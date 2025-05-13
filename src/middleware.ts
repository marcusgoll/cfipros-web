import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware'; // Adjusted import path

export async function middleware(request: NextRequest) {
  // First, refresh the session and get the updated response (which might have new cookies)
  const response = await updateSession(request);

  // After session is handled by updateSession, we need a Supabase client
  // to check the user's status for route protection.
  // We re-create a client here. This is standard practice as per Supabase docs
  // for accessing user after middleware's session refresh.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Middleware (after updateSession): Supabase URL or Anon Key missing. Cannot perform route protection.'
    );
    return response; // Return the response from updateSession
  }

  // Create a new Supabase client instance for route protection checks
  // This client will use the cookies potentially updated by updateSession
  // We pass the original request's cookies to this new client for it to read the (potentially updated) session.
  const { createServerClient } = await import('@supabase/ssr');
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Read from the request cookies, which updateSession might have modified
        return request.cookies.get(name)?.value;
      },
      // We don't need set/remove here as updateSession handles cookie modifications.
      // For safety and to adhere to Supabase examples, provide them as no-ops or read-only.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(_name: string, _value: string, _options: import('@supabase/ssr').CookieOptions) {
        // This client in middleware (after updateSession) should primarily be for reading.
        // updateSession is responsible for setting cookies on the *response*.
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove(_name: string, _options: import('@supabase/ssr').CookieOptions) {
        // ditto
      },
    },
  });

  // Now, get the user from this new client instance.
  // This getUser call will benefit from the session possibly refreshed by updateSession.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection logic (same as before)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/sign-up' ||
    request.nextUrl.pathname.startsWith('/cfi-sign-up') ||
    request.nextUrl.pathname.startsWith('/school-sign-up') ||
    request.nextUrl.pathname.startsWith('/role-selection');

  if (isProtectedRoute && !user) {
    // If redirecting, we use the original request's URL to build the new one,
    // but return a new redirect response.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If no redirects, return the response obtained from updateSession (which might have updated cookies)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/auth-code-error).*)',
  ],
};
