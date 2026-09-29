/**
 * Example: Complete KDP Book Generation
 * Generates interior PDF, cover PDF, and metadata in one go
 * Run: npx ts-node examples/complete-book-generation.ts
 */

import 'dotenv/config';
import { KDPGenerator } from '../src/index.js';
import { MetadataGenerator, CSVExporter } from '../src/metadata/index.js';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

interface BookProject {
  niche: string;
  title?: string;
  author: string;
  bookStyle?: string;
  pageCount?: number;
  width?: number; // inches
  height?: number; // inches
}

async function generateCompleteBook(project: BookProject) {
  const {
    niche,
    author = 'Your Name',
    bookStyle = 'notebook',
    pageCount = 100,
    width = 6,
    height = 9,
  } = project;

  const generator = new KDPGenerator();
  const metadataGen = new MetadataGenerator();
  const outputDir = `./output/${niche.replace(/\s+/g, '_').toLowerCase()}`;

  // Create output directory
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  console.log(`\n🚀 Generating Complete KDP Book: ${niche}`);
  console.log(`📊 Specs: ${width}"x${height}", ${pageCount} pages`);
  console.log(`📁 Output: ${outputDir}/\n`);

  try {
    // Step 1: Generate Metadata
    console.log('1️⃣ Generating Metadata from OpenAI...');
    const metadata = await metadataGen.generate(niche, bookStyle, author);
    console.log(`   ✓ Title: ${metadata.title}`);
    console.log(`   ✓ Keywords: ${metadata.keywords.join(', ')}`);

    // Step 2: Generate Interior PDF
    console.log('\n2️⃣ Generating Interior PDF...');
    const interiorConfig = {
      title: metadata.title,
      pageCount,
      width,
      height,
      pages: [
        {
          contentType: 'blank' as const,
        },
        {
          contentType: 'lined' as const,
          paperColor: 'white' as const,
          lineHeight: 14,
          lineColor: '#CCCCCC',
        },
      ],
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 36,
      marginRight: 36,
    };

    const interiorPath = `${outputDir}/interior.pdf`;
    await generator.generateInterior(interiorConfig, interiorPath);

    // Step 3: Generate Cover PDF
    console.log('\n3️⃣ Generating Cover PDF...');
    const coverConfig = {
      title: metadata.title,
      subtitle: metadata.subtitle,
      author,
      width,
      height,
      pageCount,
      backgroundColor: '#F5F5DC',
      textColor: '#2C3E50',
      fontSize: {
        title: 48,
        subtitle: 24,
        author: 16,
      },
    };

    const coverPath = `${outputDir}/cover.pdf`;
    await generator.generateCover(coverConfig, coverPath);

    // Step 4: Export Metadata to CSV
    console.log('\n4️⃣ Exporting Metadata...');
    const csvPath = `${outputDir}/metadata.csv`;
    await CSVExporter.exportMetadata([metadata], csvPath);

    // Summary
    console.log('\n✅ Complete Book Generation Finished!');
    console.log('─'.repeat(60));
    console.log(`📚 ${metadata.title}`);
    console.log(`👤 ${author}`);
    console.log(`📌 Niche: ${niche}`);
    console.log('\n📁 Generated Files:');
    console.log(`   📄 ${interiorPath} (interior layout)`);
    console.log(`   📄 ${coverPath} (print-ready cover with bleed & spine)`);
    console.log(`   📊 ${csvPath} (metadata for KDP listing)`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Upload interior.pdf to KDP');
    console.log('   2. Upload cover.pdf to KDP');
    console.log('   3. Use metadata.csv for title, keywords, description');
    console.log('─'.repeat(60));
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Example usage
const bookProject: BookProject = {
  niche: 'meditation and mindfulness',
  author: 'Your Name',
  bookStyle: 'guided journal',
  pageCount: 100,
  width: 6,
  height: 9,
};

generateCompleteBook(bookProject);
