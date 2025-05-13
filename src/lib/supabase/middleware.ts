import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('updateSession: Supabase URL or Anon Key missing. Cannot refresh session.');
    // Still return the basic response to avoid breaking the chain
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // If the cookie is set, update the request and response cookies
        request.cookies.set({
          name,
          value,
          ...options,
        });
        // Re-create the response with the updated request headers (important for chained middleware or server components reading cookies)
        response = NextResponse.next({
          request: {
            headers: request.headers, // headers in request might have been mutated by request.cookies.set
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        // If the cookie is removed, update the request and response cookies
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

  // Refresh session (this will also set cookies if the session changed)
  // It's important that this is called AFTER the client is created with the cookie handlers.
  await supabase.auth.getUser();

  return response;
}
