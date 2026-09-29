/**
 * KDP Cover PDF Generator
 * Generates print-ready covers with bleed and spine
 */

import {
  PDFDocument,
  PDFPage,
  rgb,
  PDFImage,
  degrees,
} from 'pdf-lib';
import { readFileSync } from 'fs';
import { KDPMath } from '../kdp-math/index.js';
import { CoverConfig } from '../types/index.js';

export interface CoverGeneratorConfig {
  title: string;
  subtitle?: string;
  author?: string;
  description?: string;
  width: number; // inches
  height: number; // inches
  pageCount: number;
  coverImagePath?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: {
    title?: number;
    subtitle?: number;
    author?: number;
  };
}

export class CoverPDFGenerator {
  private pageWidth: number;
  private pageHeight: number;
  private bleedSize: number;
  private spineWidth: number;
  private layout: any;

  constructor(private config: CoverGeneratorConfig) {
    const dimensions = KDPMath.getCoverDimensions(
      config.width,
      config.height,
      config.pageCount
    );

    this.pageWidth = dimensions.width;
    this.pageHeight = dimensions.height;
    this.bleedSize = dimensions.bleedWidth;
    this.spineWidth = KDPMath.calculateSpineWidth(config.pageCount);
    this.layout = KDPMath.getCoverLayout(config.width, config.height, config.pageCount);
  }

  async generate(): Promise<PDFDocument> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([this.pageWidth, this.pageHeight]);

    // Draw background
    this.drawBackground(page);

    // Load and draw cover image if provided
    if (this.config.coverImagePath) {
      await this.drawCoverImage(pdf, page);
    }

    // Draw text on front cover
    this.drawFrontCoverText(page);

    // Draw spine text if applicable
    this.drawSpineText(page);

    return pdf;
  }

  private drawBackground(page: PDFPage): void {
    const bgColor = this.hexToRgb(this.config.backgroundColor || '#FFFFFF');

    page.drawRectangle({
      x: 0,
      y: 0,
      width: this.pageWidth,
      height: this.pageHeight,
      color: bgColor,
    });

    // Draw bleed guides (light lines)
    const bleedColor = rgb(0.9, 0.9, 0.9);

    // Top bleed
    page.drawLine({
      start: { x: 0, y: this.pageHeight - this.bleedSize },
      end: { x: this.pageWidth, y: this.pageHeight - this.bleedSize },
      color: bleedColor,
      thickness: 0.5,
    });

    // Bottom bleed
    page.drawLine({
      start: { x: 0, y: this.bleedSize },
      end: { x: this.pageWidth, y: this.bleedSize },
      color: bleedColor,
      thickness: 0.5,
    });

    // Left bleed
    page.drawLine({
      start: { x: this.bleedSize, y: 0 },
      end: { x: this.bleedSize, y: this.pageHeight },
      color: bleedColor,
      thickness: 0.5,
    });

    // Right bleed
    page.drawLine({
      start: {
        x: this.pageWidth - this.bleedSize,
        y: 0,
      },
      end: {
        x: this.pageWidth - this.bleedSize,
        y: this.pageHeight,
      },
      color: bleedColor,
      thickness: 0.5,
    });

    // Spine lines
    page.drawLine({
      start: {
        x: this.layout.spine.x,
        y: 0,
      },
      end: {
        x: this.layout.spine.x,
        y: this.pageHeight,
      },
      color: bleedColor,
      thickness: 0.5,
    });

    page.drawLine({
      start: {
        x: this.layout.spine.x + this.layout.spine.width,
        y: 0,
      },
      end: {
        x: this.layout.spine.x + this.layout.spine.width,
        y: this.pageHeight,
      },
      color: bleedColor,
      thickness: 0.5,
    });
  }

  private async drawCoverImage(pdf: PDFDocument, page: PDFPage): Promise<void> {
    if (!this.config.coverImagePath) return;

    try {
      const imageBuffer = readFileSync(this.config.coverImagePath);
      const image = await pdf.embedPng(imageBuffer);

      // Calculate dimensions to fit front cover (width of one side minus small margins)
      const frontWidth = this.layout.frontCover.width - 20;
      const frontHeight = this.layout.frontCover.height - 20;

      const scale = Math.min(
        frontWidth / image.width,
        frontHeight / image.height
      );

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      // Center on front cover
      const x =
        this.layout.frontCover.x +
        (this.layout.frontCover.width - scaledWidth) / 2;
      const y =
        this.layout.frontCover.y +
        (this.layout.frontCover.height - scaledHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    } catch (error) {
      console.warn(
        '⚠️ Could not load cover image:',
        error instanceof Error ? error.message : error
      );
    }
  }

  private drawFrontCoverText(page: PDFPage): void {
    const textColor = this.hexToRgb(this.config.textColor || '#000000');
    const front = this.layout.frontCover;

    // Margins
    const margin = 30;
    const contentX = front.x + margin;
    const contentWidth = front.width - margin * 2;

    // Title
    const titleSize = this.config.fontSize?.title || 44;
    page.drawText(this.config.title, {
      x: contentX,
      y: front.y + front.height - margin - titleSize,
      size: titleSize,
      color: textColor,
      maxWidth: contentWidth,
    });

    // Subtitle
    if (this.config.subtitle) {
      const subtitleSize = this.config.fontSize?.subtitle || 24;
      page.drawText(this.config.subtitle, {
        x: contentX,
        y: front.y + front.height - margin - titleSize - subtitleSize - 10,
        size: subtitleSize,
        color: textColor,
        maxWidth: contentWidth,
      });
    }

    // Author (bottom)
    if (this.config.author) {
      const authorSize = this.config.fontSize?.author || 16;
      page.drawText(this.config.author, {
        x: contentX,
        y: front.y + margin + 10,
        size: authorSize,
        color: textColor,
        maxWidth: contentWidth,
      });
    }
  }

  private drawSpineText(page: PDFPage): void {
    if (!this.config.title) return;

    const textColor = this.hexToRgb(this.config.textColor || '#000000');
    const spine = this.layout.spine;

    // Rotate text 90 degrees for spine
    const fontSize = 12;
    const text = this.config.title;

    // Draw spine text vertically
    page.drawText(text, {
      x: spine.x + spine.width / 2,
      y: spine.y + 20,
      size: fontSize,
      color: textColor,
      rotate: degrees(90),
      maxWidth: spine.height - 40,
    });
  }

  private hexToRgb(hex: string): any {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return rgb(0, 0, 0);

    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
}
