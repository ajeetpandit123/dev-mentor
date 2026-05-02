import { callSmartAI } from './aiService';

/**
 * Mentorship Chat Service
 * 
 * This service handles the specialized "Chat with Mentor" feature.
 * Uses callSmartAI to handle Gemini 2.5 Flash communication.
 * 
 * @param messages - Array of chat messages
 * @param context - User profile data for personalization
 * @param model - Optional model override
 */
export async function getMentorResponse(messages: any[], context: any = {}, model?: string) {
  const { 
    userName = 'Developer', 
    role = 'Developer', 
    experience = 'Beginner',
    techStack = 'MERN',
    targetRole = 'SDE',
  } = context;

  const systemPrompt = `
    You are "DevIntel", a world-class technical mentor.
    USER: ${userName} (${experience} ${role})
    FOCUS: ${techStack} -> ${targetRole}
    
    GUIDELINES:
    1. Provide formal, analytical technical advice.
    2. Use professional headers and bulleted lists.
  `;

  const result = await callSmartAI(messages, systemPrompt, { model });

  return {
    role: 'assistant',
    content: result
  };
}
