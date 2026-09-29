/**
 * Test: Metadata Generator
 * Run: npx ts-node test-metadata.ts
 */

import 'dotenv/config';
import { MetadataGenerator } from './dist/metadata/generator.js';

async function test() {
  console.log('🧪 Testing Metadata Generator...\n');

  const generator = new MetadataGenerator(process.env.OPENAI_API_KEY);

  try {
    const metadata = await generator.generate(
      'meditation and mindfulness',
      'guided journal',
      'Test Author'
    );

    console.log('\n✅ Metadata Generated Successfully!\n');
    console.log('📋 Results:');
    console.log('─'.repeat(60));
    console.log(`Title:       ${metadata.title}`);
    console.log(`Subtitle:    ${metadata.subtitle}`);
    console.log(`Author:      ${metadata.author}`);
    console.log(`Niche:       ${metadata.niche}`);
    console.log(`\nKeywords (${metadata.keywords.length}):`);
    metadata.keywords.forEach((k, i) => {
      console.log(`  ${i + 1}. ${k}`);
    });
    console.log(`\nDescription Preview:`);
    console.log(metadata.description.substring(0, 300) + '...\n');
    console.log('─'.repeat(60));
    console.log('\n✨ Test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test();
