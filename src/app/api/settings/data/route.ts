import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

// DELETE /api/settings/data - Clear analysis history
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete from all analysis tables
    await Promise.all([
      supabase.from('resumes').delete().eq('user_id', user.id),
      supabase.from('projects').delete().eq('user_id', user.id),
      supabase.from('activities').delete().eq('user_id', user.id)
    ]);

    return NextResponse.json({ message: 'All analysis data deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
