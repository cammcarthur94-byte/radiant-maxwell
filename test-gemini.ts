import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Step 1: Load GEMINI_API_KEY from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

// Step 2: Initialize Google provider with API key
const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

// Step 3: Strict Zod Schema
const ExtractionSchema = z.object({
  brand_mentioned: z.boolean().describe('Whether the brand IntrovertedCA was mentioned in the text'),
  citations: z.array(z.string()).describe('List of URLs found in the text'),
});

async function main() {
  const prompt = `Analyze this text: 'I love shopping at IntrovertedCA on Etsy. You can find them at https://etsy.com/shop/introvertedca.' Did they mention the brand IntrovertedCA, and what was the URL?`;

  const modelsToTry = [
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Pinging model: ${modelName} via Vercel AI SDK (generateObject)...`);
      const { object } = await generateObject({
        model: google(modelName),
        schema: ExtractionSchema,
        prompt: prompt,
      });

      console.log('\n========================================');
      console.log('✅ GEMINI API CONNECTION & SCHEMA VERIFIED');
      console.log('========================================');
      console.log('Model:', modelName);
      console.log('Prompt:', prompt);
      console.log('\n--- RAW STRUCTURED OBJECT OUTPUT ---');
      console.log(JSON.stringify(object, null, 2));
      console.log('========================================\n');
      return;
    } catch (err: any) {
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('no longer available'))) {
        console.log(`[Info] ${modelName} returned 404 (superseded/retired). Trying next active model...`);
        continue;
      }
      console.error(`Error with ${modelName}:`, err.message || err);
    }
  }
}

main();
