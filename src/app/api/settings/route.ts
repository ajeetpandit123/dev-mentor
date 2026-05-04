import { NextResponse } from 'next/server';
import { createClient, getServiceSupabase } from '@/lib/supabaseServer';

// GET /api/settings - Fetch user settings
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = getServiceSupabase();
    let { data: { user } } = await supabase.auth.getUser();

    // Header Fallback
    if (!user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const { data: { user: headerUser } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        user = headerUser;
      }
    }

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch settings and profile together using Admin Client to bypass RLS
    const { data: settings } = await adminSupabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      settings: settings || {},
      profile: profile || { full_name: user.user_metadata?.full_name, email: user.email }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/settings - Create or Update settings
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = getServiceSupabase();
    let { data: { user } } = await supabase.auth.getUser();

    // FALLBACK
    if (!user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const { data: { user: headerUser } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        user = headerUser;
      }
    }

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { settings, profile } = body;

    // 1. Update Profile (Name) using Admin Client
    if (profile) {
      await adminSupabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        });
    }

    // 2. Update Settings using Admin Client
    if (settings) {
      // Remove metadata fields that shouldn't be manually updated or could conflict
      const { id, created_at, updated_at, ...cleanSettings } = settings;
      
      const { error } = await adminSupabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...cleanSettings,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });
      
      if (error) {
        console.error('Supabase Settings Error:', error);
        throw error;
      }
    }

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
