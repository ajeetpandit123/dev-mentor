import { callAnthropic } from '@/lib/anthropic';

export async function getMentorResponse(messages: any[], context: any = {}) {
  try {
    const systemPrompt = `
      You are "DevMentor AI", a world-class technical mentor.
      Context: ${JSON.stringify(context)}
      
      Provide helpful, actionable, and encouraging advice. Use code snippets where appropriate.
      Stay focused on technical growth and specific project improvements.
    `;

    const response = await callAnthropic(
      messages.map(m => ({ role: m.role, content: m.content })),
      systemPrompt
    );

    return {
      role: 'assistant',
      content: response
    };
  } catch (error: any) {
    console.error('Chat Service Error:', error);
    throw error;
  }
}
