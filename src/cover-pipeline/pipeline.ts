/**
 * AI Cover Generation Pipeline
 *
 * Solves the low-resolution AI generation problem for print: AI image
 * providers (DALL-E, Stable Diffusion) top out well below the 300 DPI KDP
 * requires for a full wrap cover, so this pipeline generates art, upscales
 * it with an AI super-resolution model, composites title/subtitle/author
 * text and a branding overlay at exact print pixel dimensions, and exports
 * a print-ready PDF.
 *
 * Stages: ImageGenerator -> Upscaler -> SharpCompositor -> PDFCoverExporter
 *
 * The two paid/slow stages (art generation, upscaling) are cached to disk
 * via AssetCache, keyed off their own inputs, so repeated runs while
 * fine-tuning the composite (text, overlay, fonts) don't re-spend API calls.
 */

import { createHash } from 'crypto';
import sharp from 'sharp';
import { KDPMath } from '../kdp-math/index.js';
import { AssetCache } from './cache/asset-cache.js';
import { SharpCompositor } from './compositor/sharp-compositor.js';
import { PDFCoverExporter } from './pdf-exporter/pdfkit-exporter.js';
import { CoverPipelineConfig } from './types.js';

const DEFAULT_CACHE_DIR = '.cache/cover-pipeline';

export class CoverGenerationPipeline {
  private compositor = new SharpCompositor();
  private exporter = new PDFCoverExporter();
  private cache: AssetCache | null;

  constructor(private config: CoverPipelineConfig) {
    this.cache =
      config.useCache === false
        ? null
        : new AssetCache(config.cacheDir || DEFAULT_CACHE_DIR);
  }

  async generate(): Promise<string> {
    const dpi = this.config.dpi || 300;

    const pixelDims = KDPMath.getCoverPixelDimensions(
      this.config.width,
      this.config.height,
      this.config.pageCount,
      dpi
    );
    const pointDims = KDPMath.getCoverDimensions(
      this.config.width,
      this.config.height,
      this.config.pageCount
    );

    console.log(
      `→ Target: ${pixelDims.widthPx}x${pixelDims.heightPx}px @ ${dpi} DPI`
    );

    const prompt = this.config.promptOverride || this.buildPrompt();
    const artBuffer = await this.getOrGenerateArt(prompt, pixelDims);

    const upscaledBuffer = await this.getOrUpscaleArt(artBuffer, pixelDims);

    console.log('→ Compositing text and overlay...');
    const compositedBuffer = await this.compositor.compositeCover(upscaledBuffer, {
      widthPx: pixelDims.widthPx,
      heightPx: pixelDims.heightPx,
      frontCoverWidthPx: pixelDims.frontCoverWidthPx,
      spineWidthPx: pixelDims.spineWidthPx,
      backCoverWidthPx: pixelDims.backCoverWidthPx,
      bleedPx: pixelDims.bleedPx,
      text: {
        title: this.config.title,
        subtitle: this.config.subtitle,
        author: this.config.author,
        textColor: this.config.textColor,
        fontPath: this.config.fontPath,
        titleFontPath: this.config.titleFontPath,
      },
      overlay: {
        color: this.config.overlayColor,
        opacity: this.config.overlayOpacity,
      },
    });

    console.log('→ Exporting print-ready PDF...');
    await this.exporter.exportToPDF(
      compositedBuffer,
      pointDims.width,
      pointDims.height,
      this.config.outputPath
    );

    console.log(`✓ Cover generated: ${this.config.outputPath}`);
    return this.config.outputPath;
  }

  private async getOrGenerateArt(
    prompt: string,
    pixelDims: ReturnType<typeof KDPMath.getCoverPixelDimensions>
  ): Promise<Buffer> {
    const cacheKey = AssetCache.makeKey(this.config.title, [
      'art',
      prompt,
      this.config.artStyle,
      pixelDims.frontCoverWidthPx,
      pixelDims.heightPx,
    ]);

    if (this.cache && !this.config.forceRegenerateArt) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`→ Using cached cover art (${cacheKey}.png) — skipping AI generation call`);
        return cached;
      }
    }

    console.log('→ Generating cover art...');
    const artResult = await this.config.imageGenerator.generateCoverArt(prompt, {
      width: pixelDims.frontCoverWidthPx,
      height: pixelDims.heightPx,
      style: this.config.artStyle,
    });

    if (this.cache) {
      const savedPath = this.cache.set(cacheKey, artResult.buffer);
      console.log(`→ Cached cover art at ${savedPath}`);
    }

    return artResult.buffer;
  }

  private async getOrUpscaleArt(
    artBuffer: Buffer,
    pixelDims: ReturnType<typeof KDPMath.getCoverPixelDimensions>
  ): Promise<Buffer> {
    // Keyed off the art buffer's own content hash (not just the art cache key)
    // so a manually-swapped-in art file still produces a correct cache entry.
    const artHash = createHash('sha256')
      .update(artBuffer)
      .digest('hex')
      .slice(0, 16);

    const cacheKey = AssetCache.makeKey(this.config.title, [
      'upscaled',
      artHash,
      pixelDims.widthPx,
      pixelDims.heightPx,
    ]);

    if (this.cache && !this.config.forceRegenerateUpscale) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`→ Using cached upscale (${cacheKey}.png) — skipping upscale API call`);
        return cached;
      }
    }

    const { width, height } = await sharp(artBuffer).metadata();
    console.log(
      `→ Upscaling ${width}x${height}px source to cover ${pixelDims.widthPx}x${pixelDims.heightPx}px...`
    );
    const upscaledBuffer = await this.config.upscaler.upscale(
      artBuffer,
      pixelDims.widthPx,
      pixelDims.heightPx
    );

    if (this.cache) {
      const savedPath = this.cache.set(cacheKey, upscaledBuffer);
      console.log(`→ Cached upscaled art at ${savedPath}`);
    }

    return upscaledBuffer;
  }

  private buildPrompt(): string {
    const base = `Book cover background illustration for a "${this.config.niche}" themed low-content book`;
    return this.config.artStyle ? `${base}, ${this.config.artStyle}` : base;
  }
}
