import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing.');
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=Supabase+config+missing`);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.warn('Failed to set cookie in Route Handler (set operation)', error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          console.warn('Failed to remove cookie in Route Handler (remove operation)', error);
        }
      },
    },
  });

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=OAuth+code+exchange+failed`);
    }
  }

  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error('Error getting user or no user found after OAuth:', getUserError);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=OAuth+authentication+failed`);
  }
  
  let redirectTo = '/';

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=Profile+fetch+failed`);
  }

  if (!profile) {
    redirectTo = '/profile-setup';
  } else {
    if (profile.role === 'CFI') {
      redirectTo = '/dashboard/cfi';
    } else {
      redirectTo = '/dashboard';
    }
  }
  
  if (!redirectTo.startsWith('http')) {
    redirectTo = `${requestUrl.origin}${redirectTo.startsWith('/') ? '' : '/'}${redirectTo}`;
  }

  return NextResponse.redirect(redirectTo);
} 