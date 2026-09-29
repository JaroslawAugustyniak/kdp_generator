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
import {
  CoverGenerationPipeline,
  OpenAIImageGenerator,
  StabilityImageGenerator,
  ReplicateUpscaler,
  CoverPipelineConfig,
} from './cover-pipeline/index.js';
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
    'generate-cover <config-file>',
    'Generate cover PDF from JSON config',
    (yargs) => {
      return yargs
        .positional('config-file', {
          describe: 'Path to cover config JSON file',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          describe: 'Output PDF file path',
          type: 'string',
          default: 'cover.pdf',
        });
    },
    async (argv) => {
      try {
        const configPath = path.resolve(argv['config-file'] as string);
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));

        // Validate specs
        if (!generator.validateSpecs(config.width, config.height, config.pageCount)) {
          process.exit(1);
        }

        await generator.generateCover(config, argv.output as string);
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
  .command(
    'generate-ai-cover <config-file>',
    'Generate a print-ready cover PDF using the AI art + upscale + composite pipeline',
    (yargs) => {
      return yargs
        .positional('config-file', {
          describe: 'Path to AI cover pipeline config JSON file',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          describe: 'Output PDF file path',
          type: 'string',
          default: 'ai-cover.pdf',
        })
        .option('no-cache', {
          describe: 'Disable the on-disk art/upscale cache entirely',
          type: 'boolean',
          default: false,
        })
        .option('force-regenerate-art', {
          describe: 'Ignore cached AI art and call the image provider again',
          type: 'boolean',
          default: false,
        })
        .option('force-regenerate-upscale', {
          describe: 'Ignore cached upscale and call the upscaler again',
          type: 'boolean',
          default: false,
        });
    },
    async (argv) => {
      try {
        const configPath = path.resolve(argv['config-file'] as string);
        const raw = JSON.parse(readFileSync(configPath, 'utf-8'));

        if (!generator.validateSpecs(raw.width, raw.height, raw.pageCount)) {
          process.exit(1);
        }

        const imageGenerator =
          raw.imageProvider === 'stability'
            ? new StabilityImageGenerator()
            : new OpenAIImageGenerator();

        const config: CoverPipelineConfig = {
          ...raw,
          imageGenerator,
          upscaler: new ReplicateUpscaler(),
          outputPath: argv.output as string,
          useCache: !(argv['no-cache'] as boolean),
          forceRegenerateArt: argv['force-regenerate-art'] as boolean,
          forceRegenerateUpscale: argv['force-regenerate-upscale'] as boolean,
        };

        const pipeline = new CoverGenerationPipeline(config);
        await pipeline.generate();
        console.log('✓ Done!');
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    }
  )
  .demandCommand()
  .strict()
  .help()
  .parse();
