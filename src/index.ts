/**
 * KDP Generator - Main Entry Point
 * Orchestrates PDF generation and metadata creation
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { InteriorPDFGenerator } from './pdf-generator/interior.js';
import { CoverPDFGenerator, type CoverGeneratorConfig } from './pdf-generator/cover.js';
import { KDPMath } from './kdp-math/index.js';
import { InteriorConfig, CoverConfig } from './types/index.js';

export class KDPGenerator {
  /**
   * Generate interior PDF from config
   */
  async generateInterior(config: InteriorConfig, outputPath: string): Promise<string> {
    const generator = new InteriorPDFGenerator(config);
    const pdf = await generator.generate();
    const pdfBytes = await pdf.save();

    writeFileSync(outputPath, pdfBytes);
    console.log(`✓ Interior PDF generated: ${outputPath}`);

    return outputPath;
  }

  /**
   * Generate cover PDF from config
   */
  async generateCover(config: CoverGeneratorConfig, outputPath: string): Promise<string> {
    const generator = new CoverPDFGenerator(config);
    const pdf = await generator.generate();
    const pdfBytes = await pdf.save();

    writeFileSync(outputPath, pdfBytes);
    console.log(`✓ Cover PDF generated: ${outputPath}`);

    return outputPath;
  }

  /**
   * Validate project specifications
   */
  validateSpecs(width: number, height: number, pageCount: number): boolean {
    const errors = KDPMath.validatePrintSpecs(width, height, pageCount);

    if (errors.length > 0) {
      console.error('❌ Validation failed:');
      errors.forEach((error) => console.error(`  - ${error}`));
      return false;
    }

    console.log('✓ Print specifications validated');
    return true;
  }

  /**
   * Get cover dimensions for a project
   */
  getCoverDimensions(width: number, height: number, pageCount: number) {
    const dimensions = KDPMath.getCoverDimensions(width, height, pageCount);
    const layout = KDPMath.getCoverLayout(width, height, pageCount);

    return {
      dimensions,
      layout,
      spineWidth: KDPMath.calculateSpineWidth(pageCount),
    };
  }
}

export { InteriorPDFGenerator } from './pdf-generator/interior.js';
export { CoverPDFGenerator, type CoverGeneratorConfig } from './pdf-generator/cover.js';
export { KDPMath } from './kdp-math/index.js';
export { MetadataGenerator, OpenAIClient, CSVExporter, PROMPTS } from './metadata/index.js';
export * from './types/index.js';
export * from './cover-pipeline/index.js';
