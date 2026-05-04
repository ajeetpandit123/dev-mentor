import { getServiceSupabase } from '@/lib/supabaseServer';
import { callSmartAI } from './aiService';
import pdf from 'pdf-parse';

/**
 * Resume Analysis Service
 * 
 * Extracts text from PDF and performs deep ATS analysis using Gemini 2.5 Flash.
 * Saves result to database if userId is provided.
 */
export async function analyzeResume(fileBuffer: Buffer, userId?: string) {
  try {
    const data = await pdf(fileBuffer);
    const resumeText = data.text;

    const prompt = `
      Analyze the following resume text for ATS compatibility and professional quality.
      Resume Text: ${resumeText.slice(0, 2000)}
      Return JSON: { "atsScore": number, "keywordsFound": string[], "missingKeywords": string[], "suggestions": string[], "weakPoints": string[], "industryTarget": string }
    `;

    const result = await callSmartAI(
      [{ role: "user", content: prompt }],
      "You are an expert career coach and ATS specialist.",
      { 
        response_format: { type: "json_object" }
      }
    );

    // Save to Database
    if (userId) {
      try {
        const adminSupabase = getServiceSupabase();
        await adminSupabase.from('resumes').insert({
          user_id: userId,
          ats_score: result.atsScore,
          analysis_result: result
        });
      } catch (dbError) {
        console.warn('DB Save Error:', dbError);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Resume Service Error:', error);
    throw error;
  }
}
