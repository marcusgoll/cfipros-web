import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  // Use the centralized Supabase server client from /lib
  // This ensures cookie handling is consistent and correct
  const supabase = createSupabaseServerClient();

  if (code) {
    console.log('[Auth Callback] Code received, attempting to exchange for session.');

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log(
        '[Auth Callback] Code exchange completed. Session data present:',
        !!data.session,
        'Error:',
        error?.message || 'None'
      );

      if (error) {
        console.error(
          '[Auth Callback] Error exchanging code for session:',
          JSON.stringify(error, null, 2)
        );
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
        );
      }
      // If successful, the session is set in cookies by the createSupabaseServerClient's cookie handler
    } catch (error) {
      console.error(
        '[Auth Callback] Exception during code exchange:',
        error instanceof Error ? error.message : error
      );
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=Server+error`);
    }

    // Get the user session for redirection
    console.log('[Auth Callback] Attempting to get session for redirection.');
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('[Auth Callback] No session found after code exchange');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=No+session+found`);
    }

    console.log('[Auth Callback] Session retrieved. User ID:', session.user.id);

    // Handle different flows based on the 'next' parameter
    if (next?.includes('/auth/reset-password')) {
      console.log('[Auth Callback] Password reset flow: Redirecting to reset-password page');
      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`);
    }

    const redirectTo = next || '/dashboard';
    console.log('[Auth Callback] Standard login flow: Redirecting to', redirectTo);
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
  }

  // If no code provided, or if an error occurred before this point and wasn't caught,
  // redirect to a generic error page or the login page.
  console.warn(
    '[Auth Callback] No code found or an unhandled error occurred. Redirecting to login.'
  );
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid+callback`);
}
