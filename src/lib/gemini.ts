import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGemini(
  messages: { role: string; content: string }[],
  system?: string,
  modelName: string = 'gemini-2.0-flash',
  triedModels: string[] = []
) {
  const apiKey = process.env.GOOGLE_API_KEY?.trim().replace(/^["']|["']$/g, '');
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is missing in environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: system
    });

    console.log(`[Gemini SDK] Using model: ${modelName}`);

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    // Check for Quota or Not Found errors
    const errorMessage = error.message || '';
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404')) {
      const fallbacks = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ];

      const nextFallback = fallbacks.find(f => f !== modelName && !triedModels.includes(f));
      
      if (nextFallback) {
        console.warn(`[Gemini SDK] Model ${modelName} failed/quota exceeded. Trying fallback: ${nextFallback}`);
        return callGemini(messages, system, nextFallback, [...triedModels, modelName]);
      }
    }

    console.error('Gemini SDK Error:', error);
    throw new Error(`Gemini API Error: ${error.message || JSON.stringify(error)}`);
  }
}
