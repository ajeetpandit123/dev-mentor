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

    const analysis = await analyzeRepository(repoUrl, user?.id);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
