#!/usr/bin/env node

/**
 * KDP Metadata CLI
 * Command-line interface for metadata generation
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { MetadataGenerator } from './metadata/generator.js';
import { CSVExporter } from './metadata/csv-exporter.js';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import 'dotenv/config';

yargs(hideBin(process.argv))
  .command(
    'generate <niche>',
    'Generate metadata for a KDP book niche',
    (yargs) => {
      return yargs
        .positional('niche', {
          describe: 'Book niche (e.g., "meditation and mindfulness")',
          type: 'string',
        })
        .option('style', {
          alias: 's',
          describe: 'Book style (e.g., notebook, journal, planner)',
          type: 'string',
          default: 'notebook',
        })
        .option('author', {
          alias: 'a',
          describe: 'Author name',
          type: 'string',
          default: 'Author',
        });
    },
    async (argv) => {
      try {
        const generator = new MetadataGenerator();
        const metadata = await generator.generate(
          argv.niche as string,
          argv.style as string,
          argv.author as string
        );

        console.log('\n✅ Metadata Generated!\n');
        console.log('Title:     ', metadata.title);
        console.log('Subtitle:  ', metadata.subtitle);
        console.log('Keywords:  ', metadata.keywords.join(', '));
        console.log('\nDescription:');
        console.log(metadata.description);
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  )
  .command(
    'batch <niches..>',
    'Generate metadata for multiple niches',
    (yargs) => {
      return yargs
        .positional('niches', {
          describe: 'List of niches separated by space',
          type: 'string',
          array: true,
        })
        .option('output', {
          alias: 'o',
          describe: 'Output directory',
          type: 'string',
          default: './output/metadata',
        })
        .option('style', {
          alias: 's',
          describe: 'Book style',
          type: 'string',
          default: 'notebook',
        });
    },
    async (argv) => {
      try {
        const generator = new MetadataGenerator();
        const outputDir = argv.output as string;

        if (!existsSync(outputDir)) {
          await mkdir(outputDir, { recursive: true });
        }

        console.log(`🚀 Generating metadata for ${(argv.niches as string[]).length} niches...\n`);
        const metadata = await generator.generateBatch(
          argv.niches as string[],
          argv.style as string
        );

        const csvPath = `${outputDir}/kdp_metadata.csv`;
        await CSVExporter.exportMetadata(metadata, csvPath);

        console.log(`\n✅ Done! CSV exported to: ${csvPath}`);
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  )
  .demandCommand()
  .strict()
  .help()
  .parse();
