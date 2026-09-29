/**
 * Example: Generate KDP Metadata
 * Run: npx ts-node examples/generate-metadata.ts
 */

import 'dotenv/config';
import { MetadataGenerator } from '../src/metadata/generator.js';
import { CSVExporter } from '../src/metadata/csv-exporter.js';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

async function main() {
  // Example niches
  const niches = [
    'meditation and mindfulness',
    'productivity and goal setting',
    'fitness and wellness tracking',
    'gratitude and journaling',
    'language learning',
  ];

  const generator = new MetadataGenerator(process.env.OPENAI_API_KEY);
  const outputDir = './output/metadata';

  // Create output directory
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  // Generate metadata
  console.log('🚀 Starting KDP metadata generation...\n');
  const allMetadata = await generator.generateBatch(niches, 'notebook', 'Your Name');

  if (allMetadata.length === 0) {
    console.error('❌ No metadata generated');
    process.exit(1);
  }

  // Export to CSV
  const csvPath = `${outputDir}/kdp_metadata.csv`;
  await CSVExporter.exportMetadata(allMetadata, csvPath);
  console.log(`\n✅ CSV exported to: ${csvPath}`);

  // Export with HTML
  const htmlDir = `${outputDir}/descriptions`;
  if (!existsSync(htmlDir)) {
    await mkdir(htmlDir, { recursive: true });
  }
  await CSVExporter.exportWithHTML(allMetadata, csvPath, htmlDir);

  // Print summary
  console.log('\n📊 Generation Summary:');
  console.log(`  Total books: ${allMetadata.length}`);
  console.log(`  CSV file: ${csvPath}`);
  console.log(`  HTML descriptions: ${htmlDir}/`);
  console.log('\n✨ Done!');
}

main().catch((error) => {
  console.error('❌ Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
