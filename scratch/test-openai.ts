import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testKey() {
  try {
    console.log('Testing key starting with:', process.env.OPENAI_API_KEY?.substring(0, 15));
    console.log('Key ends with:', process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 4));
    
    const response = await openai.models.list();
    console.log('Success! Models found:', response.data.length);
  } catch (error: any) {
    console.error('Error testing key:', error.message);
  }
}

testKey();
