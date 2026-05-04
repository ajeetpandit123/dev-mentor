import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Supabase credentials missing. Database features will not work.');
  }
}

/**
 * Client-side Supabase instance.
 * Uses @supabase/ssr createBrowserClient to ensure cookies are shared with the server.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

/**
 * Admin/Service instance for secure backend operations.
 */
export const getServiceSupabase = () => {
  const { createClient } = require('@supabase/supabase-js');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
