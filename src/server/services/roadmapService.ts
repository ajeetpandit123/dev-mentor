import { callAnthropic } from '@/lib/anthropic';
import { supabase } from '@/lib/supabase';

export async function generateLearningRoadmap(skills: string[], goals: string[], currentLevel: string) {
  try {
    const prompt = `
      Generate a 4-week personalized learning roadmap for a developer.
      Current Skills: ${skills.join(', ')}
      Target Goals: ${goals.join(', ')}
      Experience Level: ${currentLevel}

      Return a structured JSON roadmap:
      {
        "weeks": [
          {
            "week": number,
            "title": string,
            "topics": string[],
            "miniProject": {
              "title": string,
              "description": string
            },
            "resources": string[]
          }
        ],
        "summary": string
      }
    `;

    const result = await callAnthropic(
      [{ role: "user", content: prompt }],
      "You are an expert technical mentor.",
      { type: "json_object" }
    );

    // 3. Save activity (Optional)
    try {
      await supabase.from('activities').insert({
        title: 'New Roadmap Generated',
        description: `Learning path for ${goals[0] || 'your goals'} started`,
        type: 'roadmap'
      });
    } catch (dbError) {
      console.warn('Could not save to database:', dbError);
    }

    return result;
  } catch (error: any) {
    console.error('Roadmap Service Error:', error);
    throw error;
  }
}
