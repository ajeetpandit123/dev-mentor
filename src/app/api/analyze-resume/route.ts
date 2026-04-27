import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/server/services/resumeService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const analysis = await analyzeResume(buffer);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Resume API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
