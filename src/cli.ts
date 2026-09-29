#!/usr/bin/env node

/**
 * KDP Generator CLI
 * Command-line interface for batch generation
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import path from 'path';
import { KDPGenerator } from './index.js';
import { InteriorConfig } from './types/index.js';
import 'dotenv/config';

const generator = new KDPGenerator();

yargs(hideBin(process.argv))
  .command(
    'generate-interior <config-file>',
    'Generate interior PDF from JSON config',
    (yargs) => {
      return yargs
        .positional('config-file', {
          describe: 'Path to interior config JSON file',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          describe: 'Output PDF file path',
          type: 'string',
          default: 'output.pdf',
        });
    },
    async (argv) => {
      try {
        const configPath = path.resolve(argv['config-file'] as string);
        const config: InteriorConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

        // Validate
        if (!generator.validateSpecs(config.width, config.height, config.pageCount)) {
          process.exit(1);
        }

        await generator.generateInterior(config, argv.output as string);
        console.log('✓ Done!');
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    }
  )
  .command(
    'validate <width> <height> <page-count>',
    'Validate KDP print specifications',
    (yargs) => {
      return yargs
        .positional('width', { describe: 'Page width in inches', type: 'number' })
        .positional('height', { describe: 'Page height in inches', type: 'number' })
        .positional('page-count', { describe: 'Total page count', type: 'number' });
    },
    (argv) => {
      const isValid = generator.validateSpecs(
        argv.width as number,
        argv.height as number,
        argv['page-count'] as number
      );

      process.exit(isValid ? 0 : 1);
    }
  )
  .command(
    'cover-dims <width> <height> <page-count>',
    'Calculate cover dimensions with bleed and spine',
    (yargs) => {
      return yargs
        .positional('width', { describe: 'Interior width in inches', type: 'number' })
        .positional('height', { describe: 'Interior height in inches', type: 'number' })
        .positional('page-count', { describe: 'Total page count', type: 'number' });
    },
    (argv) => {
      const dims = generator.getCoverDimensions(
        argv.width as number,
        argv.height as number,
        argv['page-count'] as number
      );

      console.log('\n📐 Cover Dimensions (in inches):');
      console.log(`  Width: ${(dims.dimensions.width / 72).toFixed(3)}"`);
      console.log(`  Height: ${(dims.dimensions.height / 72).toFixed(3)}"`);
      console.log(`  Spine Width: ${dims.spineWidth.toFixed(4)}"`);
      console.log(`  Bleed: ${0.125}"`);
      console.log('\n📍 Layout Regions:');
      Object.entries(dims.layout).forEach(([region, coords]: [string, any]) => {
        console.log(`  ${region}:`);
        console.log(
          `    Position: (${(coords.x / 72).toFixed(2)}", ${(coords.y / 72).toFixed(2)}")`
        );
        console.log(
          `    Size: ${(coords.width / 72).toFixed(2)}" x ${(coords.height / 72).toFixed(2)}"`
        );
      });
    }
  )
  .demandCommand()
  .strict()
  .help()
  .parse();
