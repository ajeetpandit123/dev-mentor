import { callAnthropic } from '@/lib/anthropic';
import { callGemini } from '@/lib/gemini';

export async function getMentorResponse(messages: any[], context: any = {}, model?: string) {
  try {
    const { 
      userName = 'Developer', 
      role = 'Developer', 
      experience = 'Beginner',
      techStack = 'MERN',
      targetRole = 'SDE',
      latestResumeAnalysis,
      analyzedProjects = []
    } = context;

    const systemPrompt = `
      You are "DevMentor AI", a world-class technical mentor.
      
      USER PROFILE:
      - Name: ${userName}
      - Current Role: ${role}
      - Experience Level: ${experience}
      - Tech Stack: ${techStack}
      - Target Job: ${targetRole}

      USER PROGRESS:
      - Resume Analysis: ${latestResumeAnalysis ? 'Available (Use this to guide career advice)' : 'Not available'}
      - Projects Analyzed: ${analyzedProjects.length > 0 ? analyzedProjects.map((p: any) => `${p.name} (Score: ${p.score}/10)`).join(', ') : 'None yet'}

      GUIDELINES:
      1. Maintain a strictly FORMAL, PROFESSIONAL, and ANALYTICAL tone.
      2. Avoid casual greetings, emojis, or slang.
      3. Structure responses with professional headers and bulleted lists.
      4. Provide high-level executive summaries followed by deep technical analysis.
      5. Reference the USER PROFILE and PROGRESS to provide data-driven insights.
      6. If data is missing (e.g., no projects analyzed), provide a professional assessment based on the stated Tech Stack and Role.
    `;

    // 1. Determine which AI provider to use
    const useGemini = !!process.env.GOOGLE_API_KEY;
    
    // Anthropic requires the first message to be from the 'user'.
    // We also ensure messages alternate roles.
    let sanitizedMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    // Remove leading assistant messages
    while (sanitizedMessages.length > 0 && sanitizedMessages[0].role !== 'user') {
      sanitizedMessages.shift();
    }

    // Ensure alternating roles
    const alternatingMessages = [];
    let lastRole = null;
    for (const msg of sanitizedMessages) {
      if (msg.role !== lastRole) {
        alternatingMessages.push({ role: msg.role, content: msg.content });
        lastRole = msg.role;
      }
    }

    if (alternatingMessages.length === 0) {
      throw new Error('No valid user messages found to send to AI.');
    }

    let response;
    if (useGemini) {
      console.log('[ChatService] Using Google Gemini');
      response = await callGemini(alternatingMessages, systemPrompt);
    } else {
      console.log('[ChatService] Using Anthropic');
      response = await callAnthropic(alternatingMessages, systemPrompt, model);
    }

    return {
      role: 'assistant',
      content: response
    };
  } catch (error: any) {
    console.error('Chat Service Error:', error);
    throw error;
  }
}
