import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is missing in .env file');
}

export const openai = new OpenAI({
  apiKey: apiKey || '', 
});
