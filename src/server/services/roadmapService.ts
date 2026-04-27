import { openai } from '@/lib/openai';

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

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: "You are an expert technical mentor." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Roadmap Service Error:', error);
    throw error;
  }
}
