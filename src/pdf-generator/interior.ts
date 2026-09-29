import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { InteriorConfig, ContentType } from '../types/index.js';
import { KDPMath } from '../kdp-math/index.js';

export class InteriorPDFGenerator {
  private pageWidth: number;
  private pageHeight: number;
  private marginTop: number = 36; // 0.5 inch default
  private marginBottom: number = 36;
  private marginLeft: number = 36;
  private marginRight: number = 36;

  constructor(private config: InteriorConfig) {
    const dimensions = KDPMath.getInteriorDimensions(config.width, config.height);
    this.pageWidth = dimensions.width;
    this.pageHeight = dimensions.height;

    if (config.marginTop) this.marginTop = config.marginTop;
    if (config.marginBottom) this.marginBottom = config.marginBottom;
    if (config.marginLeft) this.marginLeft = config.marginLeft;
    if (config.marginRight) this.marginRight = config.marginRight;
  }

  async generate(): Promise<PDFDocument> {
    const pdf = await PDFDocument.create();

    // Create pages based on config
    for (let i = 0; i < this.config.pageCount; i++) {
      const pageConfig = this.config.pages[i % this.config.pages.length];
      const page = pdf.addPage([this.pageWidth, this.pageHeight]);

      this.drawPageContent(page, pageConfig);
    }

    return pdf;
  }

  private drawPageContent(page: PDFPage, pageConfig: any): void {
    const { contentType, paperColor = 'white', lineColor = '#CCCCCC', lineHeight = 14 } = pageConfig;

    // Draw background
    this.drawBackground(page, paperColor);

    // Draw content based on type
    switch (contentType) {
      case 'lined':
        this.drawLinedContent(page, lineHeight, lineColor);
        break;
      case 'dotted':
        this.drawDottedContent(page, lineHeight, lineColor);
        break;
      case 'graph':
        this.drawGraphContent(page, lineColor);
        break;
      case 'blank':
        // No additional drawing needed
        break;
      case 'checkboxes':
        this.drawCheckboxContent(page, lineHeight, lineColor);
        break;
    }
  }

  private drawBackground(page: PDFPage, paperColor: string): void {
    const colorMap: Record<string, any> = {
      white: rgb(1, 1, 1),
      cream: rgb(0.98, 0.96, 0.93),
      yellow: rgb(1, 1, 0.88),
    };

    page.drawRectangle({
      x: 0,
      y: 0,
      width: this.pageWidth,
      height: this.pageHeight,
      color: colorMap[paperColor] || colorMap.white,
    });
  }

  private drawLinedContent(page: PDFPage, lineHeight: number, lineColor: string): void {
    const contentTop = this.pageHeight - this.marginTop;
    const contentBottom = this.marginBottom;
    const contentHeight = contentTop - contentBottom;

    // Draw horizontal lines
    let currentY = contentTop;
    while (currentY > contentBottom) {
      page.drawLine({
        start: { x: this.marginLeft, y: currentY },
        end: { x: this.pageWidth - this.marginRight, y: currentY },
        color: this.hexToRgb(lineColor),
        thickness: 0.5,
      });

      currentY -= lineHeight;
    }

    // Draw left margin line
    page.drawLine({
      start: { x: this.marginLeft - 18, y: this.marginBottom },
      end: { x: this.marginLeft - 18, y: contentTop },
      color: this.hexToRgb('#FF9999'),
      thickness: 1,
    });
  }

  private drawDottedContent(page: PDFPage, lineHeight: number, lineColor: string): void {
    const contentTop = this.pageHeight - this.marginTop;
    const contentBottom = this.marginBottom;
    const contentHeight = contentTop - contentBottom;
    const dotSpacing = 18; // dots every 18 points
    const dotRadius = 1;

    let currentY = contentTop;
    while (currentY > contentBottom) {
      let currentX = this.marginLeft;
      while (currentX < this.pageWidth - this.marginRight) {
        page.drawCircle({
          x: currentX,
          y: currentY,
          size: dotRadius,
          color: this.hexToRgb(lineColor),
        });

        currentX += dotSpacing;
      }

      currentY -= lineHeight;
    }
  }

  private drawGraphContent(page: PDFPage, lineColor: string): void {
    const contentTop = this.pageHeight - this.marginTop;
    const contentBottom = this.marginBottom;
    const gridSize = 18; // 18 point grid squares

    // Draw vertical lines
    let currentX = this.marginLeft;
    while (currentX < this.pageWidth - this.marginRight) {
      page.drawLine({
        start: { x: currentX, y: contentBottom },
        end: { x: currentX, y: contentTop },
        color: this.hexToRgb(lineColor),
        thickness: 0.5,
      });

      currentX += gridSize;
    }

    // Draw horizontal lines
    let currentY = contentBottom;
    while (currentY < contentTop) {
      page.drawLine({
        start: { x: this.marginLeft, y: currentY },
        end: { x: this.pageWidth - this.marginRight, y: currentY },
        color: this.hexToRgb(lineColor),
        thickness: 0.5,
      });

      currentY += gridSize;
    }
  }

  private drawCheckboxContent(page: PDFPage, lineHeight: number, lineColor: string): void {
    const contentTop = this.pageHeight - this.marginTop;
    const contentBottom = this.marginBottom;
    const checkboxSize = 12;
    const checkboxSpacing = 4;

    let currentY = contentTop - 10;
    while (currentY > contentBottom + 20) {
      // Draw checkbox
      page.drawRectangle({
        x: this.marginLeft,
        y: currentY - checkboxSize,
        width: checkboxSize,
        height: checkboxSize,
        borderColor: this.hexToRgb(lineColor),
        borderWidth: 1,
      });

      // Draw line for text
      page.drawLine({
        start: { x: this.marginLeft + checkboxSize + checkboxSpacing, y: currentY - checkboxSize / 2 },
        end: { x: this.pageWidth - this.marginRight, y: currentY - checkboxSize / 2 },
        color: this.hexToRgb(lineColor),
        thickness: 0.5,
      });

      currentY -= lineHeight;
    }
  }

  private hexToRgb(hex: string): any {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return rgb(0.8, 0.8, 0.8);

    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
}
