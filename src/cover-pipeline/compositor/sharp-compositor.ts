/**
 * Sharp-based cover compositor.
 * Crops/resizes upscaled AI art to exact KDP pixel dimensions, then overlays
 * a semi-transparent shape and title/subtitle/author text (custom TTF) via
 * an SVG layer composited on top with sharp.
 */

import { readFileSync } from 'fs';
import sharp from 'sharp';
import { CompositeOptions, CompositeTextConfig } from '../types.js';

export class SharpCompositor {
  /**
   * @param sourceImageBuffer Upscaled cover art (already >= target resolution)
   * @param options Target pixel dimensions, layout regions, text and overlay config
   * @returns Final composited cover as a PNG buffer at exact target dimensions
   */
  async compositeCover(
    sourceImageBuffer: Buffer,
    options: CompositeOptions
  ): Promise<Buffer> {
    const baseImage = await sharp(sourceImageBuffer)
      .resize(options.widthPx, options.heightPx, {
        fit: 'cover',
        position: 'centre',
      })
      .toBuffer();

    const overlaySvg = this.buildOverlaySvg(options);

    return sharp(baseImage)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .png()
      .toBuffer();
  }

  private buildOverlaySvg(options: CompositeOptions): string {
    const { text, overlay } = options;

    // Front cover occupies the right-most region: back | spine | front
    const frontX = options.backCoverWidthPx + options.spineWidthPx;
    const frontWidth = options.frontCoverWidthPx;
    const safeMargin = Math.round(options.bleedPx * 2.5);

    const overlayColor = overlay?.color || '#000000';
    const overlayOpacity = overlay?.opacity ?? 0.35;

    const overlayRect = `
      <rect
        x="${frontX}"
        y="${Math.round(options.heightPx * 0.55)}"
        width="${frontWidth}"
        height="${Math.round(options.heightPx * 0.45)}"
        fill="${overlayColor}"
        fill-opacity="${overlayOpacity}"
      />`;

    const fontFaceCss = this.buildFontFaceCss(text);

    const textBlock = this.buildTextBlock(
      text,
      frontX,
      frontWidth,
      safeMargin,
      options.heightPx
    );

    return `
      <svg width="${options.widthPx}" height="${options.heightPx}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            ${fontFaceCss}
          </style>
        </defs>
        ${overlayRect}
        ${textBlock}
      </svg>
    `;
  }

  private buildFontFaceCss(text: CompositeTextConfig): string {
    const bodyFontBase64 = readFileSync(text.fontPath).toString('base64');
    const bodyFormat = this.fontFormat(text.fontPath);

    let css = `
      @font-face {
        font-family: 'CoverBodyFont';
        src: url(data:font/${bodyFormat};base64,${bodyFontBase64}) format('${bodyFormat === 'otf' ? 'opentype' : 'truetype'}');
      }`;

    if (text.titleFontPath) {
      const titleFontBase64 = readFileSync(text.titleFontPath).toString('base64');
      const titleFormat = this.fontFormat(text.titleFontPath);
      css += `
      @font-face {
        font-family: 'CoverTitleFont';
        src: url(data:font/${titleFormat};base64,${titleFontBase64}) format('${titleFormat === 'otf' ? 'opentype' : 'truetype'}');
      }`;
    }

    return css;
  }

  private fontFormat(fontPath: string): 'ttf' | 'otf' {
    return fontPath.toLowerCase().endsWith('.otf') ? 'otf' : 'ttf';
  }

  private buildTextBlock(
    text: CompositeTextConfig,
    frontX: number,
    frontWidth: number,
    margin: number,
    pageHeightPx: number
  ): string {
    const textColor = text.textColor || '#FFFFFF';
    const titleFontFamily = text.titleFontPath ? 'CoverTitleFont' : 'CoverBodyFont';
    const titleSize = text.titleFontSize || Math.round(frontWidth * 0.09);
    const subtitleSize = text.subtitleFontSize || Math.round(titleSize * 0.45);
    const authorSize = text.authorFontSize || Math.round(titleSize * 0.32);

    const contentX = frontX + margin;
    const contentWidth = frontWidth - margin * 2;

    const titleLines = this.wrapText(text.title, titleSize, contentWidth);
    const titleLineHeight = titleSize * 1.15;
    let cursorY = Math.round(pageHeightPx * 0.62) + titleSize;

    const titleTspans = titleLines
      .map((line, i) => this.textElement(contentX, cursorY + i * titleLineHeight, line))
      .join('\n');

    const titleBlockHeight = titleLines.length * titleLineHeight;
    let elements = `
      <text font-family="${titleFontFamily}" font-size="${titleSize}" font-weight="bold" fill="${textColor}">
        ${titleTspans}
      </text>`;

    cursorY += titleBlockHeight + subtitleSize * 0.6;

    if (text.subtitle) {
      const subtitleLines = this.wrapText(text.subtitle, subtitleSize, contentWidth);
      const subtitleLineHeight = subtitleSize * 1.2;
      const subtitleTspans = subtitleLines
        .map((line, i) =>
          this.textElement(contentX, cursorY + i * subtitleLineHeight, line)
        )
        .join('\n');

      elements += `
      <text font-family="CoverBodyFont" font-size="${subtitleSize}" fill="${textColor}">
        ${subtitleTspans}
      </text>`;

      cursorY += subtitleLines.length * subtitleLineHeight;
    }

    if (text.author) {
      const authorY = pageHeightPx - margin;
      elements += `
      <text font-family="CoverBodyFont" font-size="${authorSize}" fill="${textColor}">
        ${this.textElement(contentX, authorY, this.escapeXml(text.author))}
      </text>`;
    }

    return elements;
  }

  private textElement(x: number, y: number, content: string): string {
    return `<tspan x="${x}" y="${Math.round(y)}">${this.escapeXml(content)}</tspan>`;
  }

  /**
   * Word-wraps text to fit maxWidth at the given font size, using an average
   * glyph-width heuristic (avoids pulling in a full text-measurement library
   * for what is, in practice, a fast-enough approximation for cover layout).
   */
  private wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    const avgCharWidth = fontSize * 0.55;
    const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length <= charsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);

        if (word.length > charsPerLine) {
          let remaining = word;
          while (remaining.length > charsPerLine) {
            lines.push(remaining.substring(0, charsPerLine));
            remaining = remaining.substring(charsPerLine);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines.length > 0 ? lines : [''];
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
