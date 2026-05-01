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
  
  try {
    // Using Stable v1 API for Gemini 2.5
    const model = genAI.getGenerativeModel(
      { model: modelName },
      { apiVersion: 'v1' }
    );

    console.log(`[Gemini SDK] Using Gemini 2.5 Flash: ${modelName}`);

    const lastMessage = messages[messages.length - 1].content;
    const combinedPrompt = system 
      ? `Instructions: ${system}\n\nUser Input: ${lastMessage}` 
      : lastMessage;

    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error(`[Gemini SDK] Error with ${modelName}:`, error.message);
    throw error;
  }
}
