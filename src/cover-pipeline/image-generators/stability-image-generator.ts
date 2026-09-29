/**
 * Stability AI (Stable Diffusion) implementation of ImageGenerator.
 * Drop-in alternative to OpenAIImageGenerator — swap in CoverPipelineConfig.imageGenerator.
 * Requires STABILITY_API_KEY. See https://platform.stability.ai/docs/api-reference for engine ids.
 */

import {
  ImageGenerator,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../types.js';

const STABILITY_API_HOST = 'https://api.stability.ai';

export class StabilityImageGenerator implements ImageGenerator {
  constructor(
    private apiKey: string = process.env.STABILITY_API_KEY || '',
    private engineId: string = 'stable-diffusion-xl-1024-v1-0'
  ) {
    if (!this.apiKey) {
      throw new Error('STABILITY_API_KEY is required for StabilityImageGenerator');
    }
  }

  async generateCoverArt(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    const width = this.roundTo64(options?.width || 1024);
    const height = this.roundTo64(options?.height || 1024);
    const fullPrompt = options?.style ? `${prompt}, ${options.style}` : prompt;

    const response = await fetch(
      `${STABILITY_API_HOST}/v1/generation/${this.engineId}/text-to-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: fullPrompt, weight: 1 }],
          width,
          height,
          samples: 1,
          steps: 40,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability AI request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      artifacts: { base64: string }[];
    };

    const artifact = data.artifacts?.[0];
    if (!artifact) {
      throw new Error('Stability AI returned no image artifacts');
    }

    return {
      buffer: Buffer.from(artifact.base64, 'base64'),
      width,
      height,
    };
  }

  /** SDXL requires dimensions that are multiples of 64 */
  private roundTo64(value: number): number {
    return Math.max(512, Math.round(value / 64) * 64);
  }
}
