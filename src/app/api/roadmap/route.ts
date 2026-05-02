import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET: Retrieves the user's latest active roadmap.
 * Query Params: userId (string)
 * Returns: The roadmap record from Supabase including the structured JSON steps and progress history.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(data || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Persists or updates the user's roadmap state.
 * Body: { userId: string, roadmapJson: object }
 * Logic: Uses an upsert operation to maintain exactly one active roadmap per user 
 * while ensuring all progress (checklist state, history) is saved securely in the cloud.
 */
export async function POST(req: Request) {
  try {
    const { userId, roadmapJson } = await req.json();

    if (!userId || !roadmapJson) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Manual upsert logic to avoid onConflict errors without a unique constraint
    const { data: existing } = await supabase
      .from('roadmaps')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('roadmaps')
        .update({
          roadmap_json: roadmapJson,
          created_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          roadmap_json: roadmapJson,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
