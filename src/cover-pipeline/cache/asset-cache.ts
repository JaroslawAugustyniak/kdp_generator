/**
 * On-disk cache for pipeline intermediates (raw AI art, upscaled art).
 *
 * AI generation and upscaling are the two paid, slow steps in the cover
 * pipeline. While fine-tuning the composite (text, overlay, fonts,
 * positioning) you want to re-run the pipeline many times without paying
 * for a new OpenAI + Replicate call every time. This cache stores each
 * stage's output under a human-readable, deterministic filename so re-runs
 * with the same inputs reuse the file from disk instead of calling the API.
 */

import { createHash } from 'crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export class AssetCache {
  constructor(private cacheDir: string) {
    mkdirSync(this.cacheDir, { recursive: true });
  }

  /**
   * Builds a stable, human-readable cache filename: `<slug>-<hash>.png`.
   * `slug` comes from a human-friendly label (e.g. the book title), `hash`
   * is derived from every input that should invalidate the cache when changed
   * (prompt text, target dimensions, provider, etc).
   */
  static makeKey(label: string, parts: (string | number | undefined)[]): string {
    const hash = createHash('sha256')
      .update(parts.filter((p) => p !== undefined).join('|'))
      .digest('hex')
      .slice(0, 12);

    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);

    return `${slug}-${hash}`;
  }

  private filePath(key: string): string {
    return path.join(this.cacheDir, `${key}.png`);
  }

  has(key: string): boolean {
    return existsSync(this.filePath(key));
  }

  get(key: string): Buffer | null {
    const filePath = this.filePath(key);
    return existsSync(filePath) ? readFileSync(filePath) : null;
  }

  set(key: string, buffer: Buffer): string {
    const filePath = this.filePath(key);
    writeFileSync(filePath, buffer);
    return filePath;
  }
}
