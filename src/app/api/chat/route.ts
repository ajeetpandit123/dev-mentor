import { NextRequest, NextResponse } from 'next/server';
import { getMentorResponse } from '@/server/services/chatService';

export async function POST(req: NextRequest) {
  try {
    const { messages, context = {} } = await req.json();
    const result = await getMentorResponse(messages, context);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
