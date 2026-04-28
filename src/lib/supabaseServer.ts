import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const allCookies = cookieStore.getAll();
          console.log('DEBUG: Available Cookies:', allCookies.map(c => c.name).join(', '));
          console.log('DEBUG: Looking for Cookie:', name);
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            console.log('DEBUG: Setting Cookie:', name);
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              secure: false, // Force false for local IP development
              sameSite: 'lax'
            });
          } catch (error) {
            console.warn('DEBUG: Cookie Set Error (likely Server Component):', name);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            console.log('DEBUG: Removing Cookie:', name);
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              secure: false,
              sameSite: 'lax'
            });
          } catch (error) {
            console.warn('DEBUG: Cookie Remove Error:', name);
          }
        },
      },
    }
  );
}
