/**
 * AI upscaling via Replicate (Real-ESRGAN), used to bring provider-native
 * cover art (typically 1024-1792px) up to KDP's 300 DPI print requirement
 * (e.g. ~3800x2800px for a 6x9" cover with spine and bleed).
 */

import sharp from 'sharp';
import { Upscaler } from '../types.js';

const REPLICATE_API_HOST = 'https://api.replicate.com/v1';
// nightmareai/real-esrgan — general-purpose photo/art upscaler
const DEFAULT_MODEL_OWNER = 'nightmareai';
const DEFAULT_MODEL_NAME = 'real-esrgan';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150; // ~5 minutes

export class ReplicateUpscaler implements Upscaler {
  constructor(
    private apiKey: string = process.env.REPLICATE_API_TOKEN || '',
    private modelOwner: string = DEFAULT_MODEL_OWNER,
    private modelName: string = DEFAULT_MODEL_NAME
  ) {
    if (!this.apiKey) {
      throw new Error('REPLICATE_API_TOKEN is required for ReplicateUpscaler');
    }
  }

  async upscale(
    imageBuffer: Buffer,
    targetWidthPx: number,
    targetHeightPx: number
  ): Promise<Buffer> {
    // Real-ESRGAN scales by an integer factor rather than to an exact target size,
    // so we request the smallest factor that covers the target and crop precisely
    // in the compositor's resize/crop step afterward.
    const scaleFactor = await this.computeScaleFactor(
      imageBuffer,
      targetWidthPx,
      targetHeightPx
    );

    const dataUri = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const prediction = await this.createPrediction(dataUri, scaleFactor);
    const outputUrl = await this.pollUntilComplete(prediction.id);

    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to download upscaled image (${imageResponse.status})`
      );
    }

    return Buffer.from(await imageResponse.arrayBuffer());
  }

  private async computeScaleFactor(
    imageBuffer: Buffer,
    targetWidthPx: number,
    targetHeightPx: number
  ): Promise<number> {
    const { width, height } = await sharp(imageBuffer).metadata();
    if (!width || !height) {
      throw new Error('Could not read source image dimensions for upscaling');
    }

    // Real-ESRGAN's Replicate model accepts an integer scale factor (commonly up to 10x).
    // We round up to whichever integer factor covers the larger of the two target
    // dimensions; the compositor's resize/crop step trims the excess precisely.
    const requiredScale = Math.max(
      targetWidthPx / width,
      targetHeightPx / height
    );
    return Math.min(10, Math.max(2, Math.ceil(requiredScale)));
  }

  private async createPrediction(
    imageDataUri: string,
    scale: number
  ): Promise<{ id: string }> {
    // The model-scoped endpoint always resolves to that model's latest version,
    // avoiding hardcoded version hashes that Replicate periodically deprecates.
    const response = await fetch(
      `${REPLICATE_API_HOST}/models/${this.modelOwner}/${this.modelName}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            image: imageDataUri,
            scale,
            face_enhance: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate prediction failed (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<{ id: string }>;
  }

  private async pollUntilComplete(predictionId: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const response = await fetch(
        `${REPLICATE_API_HOST}/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${this.apiKey}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to poll prediction status (${response.status})`);
      }

      const data = (await response.json()) as {
        status: string;
        output?: string | string[];
        error?: string;
      };

      if (data.status === 'succeeded') {
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        if (!output) {
          throw new Error('Replicate prediction succeeded but returned no output');
        }
        return output;
      }

      if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error(`Replicate prediction ${data.status}: ${data.error || 'unknown error'}`);
      }

      await this.sleep(POLL_INTERVAL_MS);
    }

    throw new Error('Replicate prediction timed out waiting for completion');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
