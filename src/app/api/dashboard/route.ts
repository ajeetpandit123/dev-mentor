import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { getDashboardData } from '@/server/services/dashboardService';

export async function GET(req: Request) {
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

    console.log('DEBUG: Dashboard API User ID:', user?.id || 'NULL');

    const data = await getDashboardData(user?.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
