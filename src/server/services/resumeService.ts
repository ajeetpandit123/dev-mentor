import { openai } from '@/lib/openai';
import pdf from 'pdf-parse';

export async function analyzeResume(fileBuffer: Buffer) {
  try {
    // 1. Extract text from PDF
    const data = await pdf(fileBuffer);
    const resumeText = data.text;

    // 2. AI Analysis
    const prompt = `
      Analyze the following resume text for ATS compatibility and professional quality.
      
      Resume Text:
      ${resumeText}

      Provide a detailed review in JSON format:
      {
        "atsScore": number (0-100),
        "keywordsFound": string[],
        "missingKeywords": string[],
        "suggestions": string[],
        "weakPoints": string[],
        "industryTarget": string
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: "You are an expert career coach and ATS specialist." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Resume Service Error:', error);
    throw error;
  }
}
