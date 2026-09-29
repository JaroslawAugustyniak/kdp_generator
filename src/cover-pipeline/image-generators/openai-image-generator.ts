/**
 * OpenAI (gpt-image-1) implementation of ImageGenerator
 */

import { OpenAI } from 'openai';
import {
  ImageGenerator,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../types.js';

// gpt-image-1 only supports these exact sizes (plus 'auto')
const SUPPORTED_SIZES = ['1024x1024', '1536x1024', '1024x1536'] as const;
type SupportedSize = (typeof SUPPORTED_SIZES)[number];

export class OpenAIImageGenerator implements ImageGenerator {
  private client: OpenAI;
  private model = 'gpt-image-1';

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateCoverArt(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    const size = this.resolveSize(options);
    const fullPrompt = options?.style ? `${prompt}, ${options.style}` : prompt;

    // gpt-image-1 always returns base64 and rejects `response_format` entirely
    // (unlike dall-e-2/3, where it's required to opt into b64_json).
    const response = await this.client.images.generate({
      model: this.model,
      prompt: fullPrompt,
      size,
      quality: 'high',
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('OpenAI image generation returned no image data');
    }

    const [widthStr, heightStr] = size.split('x');

    return {
      buffer: Buffer.from(b64, 'base64'),
      width: parseInt(widthStr, 10),
      height: parseInt(heightStr, 10),
    };
  }

  /**
   * Picks the closest gpt-image-1 native size to the requested aspect ratio.
   * KDP covers are wide (front+spine+back), but gpt-image-1 tops out at 1536x1024 —
   * the pipeline's Upscaler stage is what actually reaches print resolution.
   */
  private resolveSize(options?: ImageGenerationOptions): SupportedSize {
    if (!options?.width || !options?.height) return '1024x1024';

    const aspect = options.width / options.height;
    if (aspect > 1.2) return '1536x1024';
    if (aspect < 0.8) return '1024x1536';
    return '1024x1024';
  }
}
