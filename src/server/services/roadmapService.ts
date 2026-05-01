import { callSmartAI } from './aiService';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * Roadmap Service
 * 
 * Generates personalized learning paths using Gemini 2.5 Flash.
 */
export async function generateLearningRoadmap(skills: string[], goals: string[], currentLevel: string) {
  try {
    const prompt = `
      Generate a 4-week personalized learning roadmap for a developer.
      Current Skills: ${skills.join(', ')}
      Target Goals: ${goals.join(', ')}
      Experience Level: ${currentLevel}
      Return JSON: { 
        "weeks": [{ 
          "week": number, 
          "title": string, 
          "topics": string[], 
          "miniProject": { 
            "title": string, 
            "description": string,
            "features": string[],
            "techStack": string[]
          }, 
          "resources": string[] 
        }], 
        "summary": string 
      }
    `;

    const result = await callSmartAI(
      [{ role: "user", content: prompt }],
      "You are an expert technical mentor.",
      { 
        response_format: { type: "json_object" }
      }
    );

    try {
      const adminSupabase = getServiceSupabase();
      await adminSupabase.from('activities').insert({
        title: 'New Roadmap Generated',
        description: `Learning path for ${goals[0] || 'your goals'} started`,
        type: 'roadmap'
      });
    } catch (dbError) {
      console.warn('DB Save Error:', dbError);
    }

    return result;
  } catch (error: any) {
    console.error('Roadmap Service Error:', error);
    throw error;
  }
}
