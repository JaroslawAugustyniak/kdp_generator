/**
 * KDP Metadata Generator
 * Generates titles, subtitles, keywords, and descriptions using OpenAI
 */

import { Metadata } from '../types/index.js';
import { OpenAIClient } from './openai-client.js';
import { PROMPTS } from './prompts.js';

export class MetadataGenerator {
  private openai: OpenAIClient;

  constructor(apiKey?: string) {
    this.openai = new OpenAIClient(apiKey);
  }

  /**
   * Generate complete metadata for a KDP book
   */
  async generate(
    niche: string,
    bookStyle: string = 'notebook',
    author: string = 'Author'
  ): Promise<Metadata> {
    console.log(`📝 Generating metadata for niche: "${niche}"`);

    // Generate title
    console.log('  ⏳ Generating titles...');
    const titles = await this.generateTitles(niche, bookStyle);
    const selectedTitle = titles[0];

    // Generate subtitle
    console.log('  ⏳ Generating subtitle...');
    const subtitle = await this.generateSubtitle(selectedTitle, niche);

    // Generate keywords
    console.log('  ⏳ Generating keywords...');
    const keywords = await this.generateKeywords(selectedTitle, niche);

    // Generate description
    console.log('  ⏳ Generating description...');
    const description = await this.generateDescription(
      selectedTitle,
      subtitle,
      niche,
      keywords
    );

    const metadata: Metadata = {
      title: selectedTitle,
      subtitle,
      description,
      keywords,
      author,
      niche,
    };

    console.log('✅ Metadata generation complete!');
    return metadata;
  }

  /**
   * Generate multiple title options
   */
  async generateTitles(niche: string, bookStyle?: string): Promise<string[]> {
    const prompt = PROMPTS.title(niche, bookStyle);
    const response = await this.openai.call(prompt, 300, 0.8);
    return this.openai.parseJSON<string[]>(response);
  }

  /**
   * Generate subtitle for a given title
   */
  async generateSubtitle(title: string, niche: string): Promise<string> {
    const prompt = PROMPTS.subtitle(title, niche);
    return await this.openai.call(prompt, 100, 0.7);
  }

  /**
   * Generate backend keywords
   */
  async generateKeywords(title: string, niche: string): Promise<string[]> {
    const prompt = PROMPTS.keywords(title, niche);
    const response = await this.openai.call(prompt, 200, 0.5);
    return this.openai.parseJSON<string[]>(response);
  }

  /**
   * Generate HTML-formatted description
   */
  async generateDescription(
    title: string,
    subtitle: string,
    niche: string,
    keywords: string[]
  ): Promise<string> {
    const prompt = PROMPTS.description(title, subtitle, niche, keywords);
    return await this.openai.call(prompt, 600, 0.7);
  }

  /**
   * Generate metadata for multiple niches (batch)
   */
  async generateBatch(
    niches: string[],
    bookStyle?: string,
    author?: string
  ): Promise<Metadata[]> {
    const results: Metadata[] = [];

    for (let i = 0; i < niches.length; i++) {
      try {
        console.log(`\n📚 Book ${i + 1}/${niches.length}`);
        const metadata = await this.generate(niches[i], bookStyle, author);
        results.push(metadata);

        // Add delay between requests to respect rate limits
        if (i < niches.length - 1) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(
          `❌ Failed to generate metadata for niche "${niches[i]}":`,
          error instanceof Error ? error.message : error
        );
      }
    }

    return results;
  }

  /**
   * Delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
