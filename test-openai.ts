/**
 * Quick test to verify OpenAI API key works
 * Run: npx ts-node test-openai.ts
 */

import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    console.log('🧪 Testing OpenAI API connection...');
    console.log(`📝 API Key: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "OpenAI API is working!" in one sentence.',
        },
      ],
      max_tokens: 50,
    });

    console.log('✅ Connection successful!');
    console.log('📬 Response:', response.choices[0].message.content);
    console.log(`💰 Model: ${response.model}`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test();
