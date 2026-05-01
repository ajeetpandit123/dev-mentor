import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { analyzeResume } from '@/server/services/resumeService';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    let { data: { user } } = await supabase.auth.getUser();

    // FALLBACK: If cookies failed, try the Authorization header
    if (!user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data: { user: headerUser } } = await supabase.auth.getUser(token);
        user = headerUser;
      }
    }
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // 2. CHECK USAGE LIMIT (3 FREE TOKENS)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for analysis' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('analysis_tokens')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('Profile fetch failed:', profileError.message);
    } else if (!profile || profile.analysis_tokens === null || profile.analysis_tokens <= 0) {
      return NextResponse.json({ 
        error: 'LIMIT_REACHED', 
        message: 'You have reached your limit of free analyses. Please upgrade to continue.' 
      }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const analysis = await analyzeResume(buffer, user?.id);

    // 3. DECREMENT TOKEN
    if (user) {
      await supabase.rpc('decrement_tokens', { user_id: user.id });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Resume API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
