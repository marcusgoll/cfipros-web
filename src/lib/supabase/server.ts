import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function createSupabaseServerClientInternal() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    // Consider logging this error or throwing a more specific error type
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables.');
  }
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables.');
  }

  // Modified cookie handlers to properly handle the async nature of cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: async (name: string) => {
        // Await cookies() to properly handle its async nature
        const cookieStore = await cookies();
        return cookieStore.get(name)?.value;
      },
      set: async (name: string, value: string, options: CookieOptions) => {
        const cookieStore = await cookies();
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This catch block is important for environments where cookies might be updated.
          // In Server Actions, direct set should ideally work, but this adds robustness.
          console.warn(`Supabase server client: Failed to set cookie ${name}`, error);
        }
      },
      remove: async (name: string, options: CookieOptions) => {
        const cookieStore = await cookies();
        try {
          // Ensure we are actually trying to remove by setting value to empty and maxAge to 0 or similar
          // The original @supabase/ssr examples sometimes use set with empty value for removal.
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        } catch (error) {
          console.warn(`Supabase server client: Failed to remove cookie ${name}`, error);
        }
      },
    },
  });
}

// Explicitly export with the desired name
export const createSupabaseServerClient = createSupabaseServerClientInternal;
