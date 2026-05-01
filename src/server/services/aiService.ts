import { callGemini } from '@/lib/gemini';

/**
 * Centralized AI Orchestrator
 * 
 * Optimized for Gemini 2.5 Flash as the sole technical mentorship engine.
 */
export async function callSmartAI(
  messages: { role: string; content: string }[],
  system?: string,
  options: { 
    model?: string; 
    response_format?: any;
  } = {}
) {
  const { model, response_format } = options;

  try {
    console.log('[AI Service] Calling Gemini 2.5 Flash...');
    const response = await callGemini(messages, system, model);
    
    if (response) {
      return handleJsonResponse(response, response_format);
    }

    throw new Error('No response from Gemini.');

  } catch (error: any) {
    console.error('[AI Service] Gemini call failed:', error.message);
    throw error;
  }
}

/**
 * Helper to handle JSON extraction from AI responses.
 */
function handleJsonResponse(response: string, format: any) {
  if (format?.type === 'json_object') {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      console.warn('[AI Service] JSON parse failed');
    }
  }
  return response;
}
