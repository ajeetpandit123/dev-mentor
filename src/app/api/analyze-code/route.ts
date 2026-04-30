import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { analyzeRepository } from '@/server/services/codeService';

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

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    // 2. CHECK USAGE LIMIT (3 FREE TOKENS)
    if (user) {
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.warn('Usage limit check failed:', countError.message);
      } else if (count !== null && count >= 3) {
        return NextResponse.json({ 
          error: 'LIMIT_REACHED', 
          message: 'You have reached your limit of 3 free repository analyses.' 
        }, { status: 403 });
      }
    }

    const analysis = await analyzeRepository(repoUrl, user?.id);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
