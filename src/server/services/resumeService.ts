import { callAnthropic } from '@/lib/anthropic';
import pdf from 'pdf-parse';
import { supabase } from '@/lib/supabase';

export async function analyzeResume(fileBuffer: Buffer, userId?: string) {
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

    const result = await callAnthropic(
      [{ role: "user", content: prompt }],
      "You are an expert career coach and ATS specialist.",
      { type: "json_object" }
    );

    // 3. Save to Supabase (Optional)
    try {
      if (!userId) {
        console.warn('User ID not provided, skipping database save.');
        return result;
      }

      const adminSupabase = getServiceSupabase();

      const { data: analysisData, error: analysisError } = await adminSupabase
        .from('resumes')
        .insert({
          user_id: userId,
          ats_score: result.atsScore,
          analysis_result: result
        })
        .select()
        .single();

      if (!analysisError) {
        await adminSupabase.from('activities').insert({
          user_id: userId,
          title: 'Resume Uploaded',
          description: `ATS score improved to ${result.atsScore}`,
          type: 'resume_analysis'
        });
      }
    } catch (dbError) {
      console.warn('Could not save to database:', dbError);
    }

    return result;
  } catch (error: any) {
    console.error('Resume Service Error:', error);
    throw error;
  }
}
