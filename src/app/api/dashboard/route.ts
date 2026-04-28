import { NextResponse } from 'next/server';
import { getDashboardData } from '@/server/services/dashboardService';

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
