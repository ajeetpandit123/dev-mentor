import { NextRequest, NextResponse } from 'next/server';
import { generateLearningRoadmap } from '@/server/services/roadmapService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const goals = Array.isArray(body.goals) ? body.goals : [];
    const currentLevel = body.currentLevel || 'Intermediate';

    const roadmap = await generateLearningRoadmap(skills, goals, currentLevel);
    return NextResponse.json(roadmap);
  } catch (error: any) {
    console.error('Roadmap API Error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
