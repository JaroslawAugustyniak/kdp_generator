/**
 * OpenAI API Client Wrapper
 * Handles API calls with error handling and retry logic
 */

import { OpenAI } from 'openai';

export class OpenAIClient {
  private client: OpenAI;
  private model = 'gpt-4o-mini';
  private retries = 3;
  private retryDelay = 1000; // ms

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Call OpenAI API with retry logic
   */
  async call(
    prompt: string,
    maxTokens: number = 500,
    temperature: number = 0.7
  ): Promise<string> {
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature,
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        return content.trim();
      } catch (error) {
        if (attempt === this.retries) {
          throw error;
        }

        const delay = this.retryDelay * attempt;
        console.warn(`⚠️ Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw new Error('Failed after all retries');
  }

  /**
   * Parse JSON response safely
   */
  parseJSON<T>(response: string): T {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleanedResponse.trim());
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${response.substring(0, 100)}...`
      );
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get usage info for monitoring costs
   */
  getModel(): string {
    return this.model;
  }
}
