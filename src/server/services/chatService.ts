import { openai } from '@/lib/openai';

export async function getMentorResponse(messages: any[], context: any = {}) {
  try {
    const systemPrompt = `
      You are "DevMentor AI", a world-class technical mentor.
      Context: ${JSON.stringify(context)}
      
      Provide helpful, actionable, and encouraging advice. Use code snippets where appropriate.
      Stay focused on technical growth and specific project improvements.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...(Array.isArray(messages) ? messages : [])
      ],
    });

    return {
      role: 'assistant',
      content: response.choices[0].message.content
    };
  } catch (error: any) {
    console.error('Chat Service Error:', error);
    throw error;
  }
}
