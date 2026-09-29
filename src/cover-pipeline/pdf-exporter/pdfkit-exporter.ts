/**
 * Exports a fully composited cover image (PNG buffer) as a print-ready,
 * single-page PDF sized to exact KDP cover point dimensions.
 */

import { createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';

export class PDFCoverExporter {
  /**
   * @param imageBuffer Final composited cover (PNG/JPEG bytes)
   * @param widthPt Cover width in PDF points (from KDPMath.getCoverDimensions)
   * @param heightPt Cover height in PDF points
   * @param outputPath Destination .pdf file path
   */
  async exportToPDF(
    imageBuffer: Buffer,
    widthPt: number,
    heightPt: number,
    outputPath: string
  ): Promise<string> {
    const doc = new PDFDocument({
      size: [widthPt, heightPt],
      margin: 0,
      autoFirstPage: false,
    });

    const writeStream = createWriteStream(outputPath);
    doc.pipe(writeStream);

    doc.addPage({ size: [widthPt, heightPt], margin: 0 });
    doc.image(imageBuffer, 0, 0, { width: widthPt, height: heightPt });

    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    return outputPath;
  }
}
