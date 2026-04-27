import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/server/services/codeService';

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    const analysis = await analyzeRepository(repoUrl);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
