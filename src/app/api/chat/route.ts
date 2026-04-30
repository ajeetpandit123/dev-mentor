import { NextRequest, NextResponse } from 'next/server';
import { getMentorResponse } from '@/server/services/chatService';
import { createClient, getServiceSupabase } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = getServiceSupabase();
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    
    let userContext: any = {};
    
    if (user) {
      try {
        // 2. Fetch all relevant data for context - Safe individual fetches
        const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const { data: settings } = await adminSupabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
        const { data: resumes } = await adminSupabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
        const { data: projects } = await adminSupabase.from('projects').select('*').eq('user_id', user.id).limit(5);

        userContext = {
          userName: profile?.full_name || user.user_metadata?.full_name || 'Developer',
          role: settings?.role || 'Developer',
          experience: settings?.experience_level || 'Beginner',
          targetRole: settings?.target_role,
          techStack: settings?.tech_stack,
          focusAreas: settings?.focus_areas,
          latestResumeAnalysis: resumes?.[0]?.analysis_result,
          analyzedProjects: projects?.map(p => ({ name: p.repo_name, score: p.score }))
        };
      } catch (dbError) {
        console.warn('Safe Context Loading: Database error ignored to keep chat alive', dbError);
      }
    }

    const { messages, model } = await req.json();
    const result = await getMentorResponse(messages, userContext, model);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRITICAL CHAT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to get mentor response: ' + error.message },
      { status: 500 }
    );
  }
}
