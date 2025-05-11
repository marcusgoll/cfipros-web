import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: Supabase URL or Anon Key missing. Cannot refresh session.');
    return response; // Proceed without session refresh if config is missing
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // If the cookie is set, update the response
        // The `set` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        // If the cookie is removed, update the response
        // The `delete` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Refresh session (if expired)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if we're on a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isAuthRoute = 
      request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname === '/sign-up' ||
      request.nextUrl.pathname.startsWith('/cfi-sign-up') ||
      request.nextUrl.pathname.startsWith('/school-sign-up') ||
      request.nextUrl.pathname.startsWith('/role-selection');
    
    // If it's a protected route and user is not authenticated, redirect to login
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If user is already authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Middleware: Error refreshing session', error);
    // Optionally handle a failed session refresh, e.g., by redirecting to login
  }
  
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