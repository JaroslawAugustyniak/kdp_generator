/**
 * Cover Generation Pipeline - Shared Types
 */

export interface ImageGenerationOptions {
  /** Requested pixel width from the generation provider (provider-native, pre-upscale) */
  width?: number;
  /** Requested pixel height from the generation provider (provider-native, pre-upscale) */
  height?: number;
  /** Free-form style hint appended to the prompt (e.g. "flat vector illustration", "watercolor") */
  style?: string;
}

export interface ImageGenerationResult {
  /** Raw image bytes (PNG/JPEG) */
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Generates initial low-content book cover art from a text prompt.
 * Implementations: OpenAI (DALL-E), Stability AI, Leonardo AI, etc.
 * Output resolution is provider-native and generally below 300 DPI print
 * requirements — the pipeline's Upscaler stage closes that gap.
 */
export interface ImageGenerator {
  generateCoverArt(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult>;
}

/**
 * Upscales a source image to at least the target pixel dimensions using
 * an AI super-resolution model (e.g. Real-ESRGAN via Replicate), so the
 * final composite meets KDP's 300 DPI print requirement.
 */
export interface Upscaler {
  upscale(
    imageBuffer: Buffer,
    targetWidthPx: number,
    targetHeightPx: number
  ): Promise<Buffer>;
}

export interface CompositeTextConfig {
  title: string;
  subtitle?: string;
  author?: string;
  textColor?: string; // hex
  titleFontSize?: number; // px, at target DPI
  subtitleFontSize?: number;
  authorFontSize?: number;
  /** Path to a .ttf/.otf font file embedded into the SVG overlay */
  fontPath: string;
  /** Optional separate bold/display font for the title */
  titleFontPath?: string;
}

export interface CompositeOverlayConfig {
  /** Hex color of the semi-transparent shape behind the front-cover text */
  color?: string;
  /** 0-1 opacity */
  opacity?: number;
}

export interface CompositeOptions {
  widthPx: number;
  heightPx: number;
  frontCoverWidthPx: number;
  spineWidthPx: number;
  backCoverWidthPx: number;
  bleedPx: number;
  text: CompositeTextConfig;
  overlay?: CompositeOverlayConfig;
}

export interface CoverPipelineConfig {
  niche: string;
  title: string;
  subtitle?: string;
  author?: string;
  width: number; // interior width, inches
  height: number; // interior height, inches
  pageCount: number;
  dpi?: number; // default 300

  imageGenerator: ImageGenerator;
  upscaler: Upscaler;

  fontPath: string;
  titleFontPath?: string;
  textColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  /** Extra style keywords folded into the auto-built art prompt */
  artStyle?: string;
  /** Fully overrides the auto-built art prompt when provided */
  promptOverride?: string;

  outputPath: string;

  /**
   * Directory for caching generated/upscaled intermediates so repeated runs
   * (e.g. while fine-tuning composite text/overlay) skip paid API calls.
   * Defaults to `.cache/cover-pipeline`. Set `useCache: false` to disable.
   */
  cacheDir?: string;
  useCache?: boolean;
  /** Bypass the cache and force a fresh AI art generation call */
  forceRegenerateArt?: boolean;
  /** Bypass the cache and force a fresh upscale call (art itself may still be cached) */
  forceRegenerateUpscale?: boolean;
}
