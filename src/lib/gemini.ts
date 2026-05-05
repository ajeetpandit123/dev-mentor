import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Handles communication with Google's Gemini models.
 * Optimized for Gemini 2.5 Flash for high-speed technical mentorship.
 * 
 * @param messages - Array of chat messages
 * @param system - System-level instructions
 * @param modelName - Defaults to gemini-2.5-flash as per environment
 */
export async function callGemini(
  messages: { role: string; content: string }[],
  system?: string,
  modelName: string = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
) {
  const apiKey = process.env.GOOGLE_API_KEY?.trim().replace(/^["']|["']$/g, '');
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const maxRetries = 3;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    const currentModel = i === maxRetries - 1 ? 'gemini-1.5-flash' : modelName;
    
    try {
      const model = genAI.getGenerativeModel(
        { model: currentModel },
        { apiVersion: 'v1' }
      );

      console.log(`[Gemini SDK] Attempt ${i + 1}: Using ${currentModel}`);

      const lastMessage = messages[messages.length - 1].content;
      const combinedPrompt = system 
        ? `Instructions: ${system}\n\nUser Input: ${lastMessage}` 
        : lastMessage;

      const result = await model.generateContent(combinedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      console.warn(`[Gemini SDK] Attempt ${i + 1} failed:`, error.message);
      
      // If it's a 503 or 429, wait and retry
      if (error.message?.includes('503') || error.message?.includes('429')) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }

  throw lastError;
}
