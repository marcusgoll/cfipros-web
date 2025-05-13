'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Request a password reset for a user by email
 *
 * @param email User's email address
 * @returns Object with error if any
 */
export async function requestPasswordReset(email: string) {
  console.log('[Auth Service] Requesting password reset for:', email);
  const supabase = createSupabaseServerClient();

  // Get the base URL from environment or use a fallback for local development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  // Supabase will append the token as a hash fragment (#access_token=...)
  // Use redirect to auth callback which will handle extracting the token
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    console.error('[Auth Service] Error requesting password reset:', error.message);
    return { error };
  }

  // Always return success even if email doesn't exist (for security reasons)
  console.log('[Auth Service] Password reset requested successfully for:', email);
  return { error: null };
}

/**
 * Reset a user's password using the current session
 *
 * @param _token Deprecated parameter (kept for backward compatibility)
 * @param newPassword New password to set
 * @returns Object with error if any
 */
export async function resetPassword(_token: string, newPassword: string) {
  console.log('[Auth Service] Attempting to reset password with current session');

  try {
    // Use the centralized Supabase server client from /lib
    const supabase = createSupabaseServerClient();

    // Update the user's password using the current session
    // The client from createSupabaseServerClient already handles cookies correctly.
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('[Auth Service] Error updating password:', error.message);
      return { error };
    }

    console.log('[Auth Service] Password reset successful!');
    return { error: null };
  } catch (error) {
    console.error('[Auth Service] UNEXPECTED EXCEPTION during password reset function:', error);
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during password reset.',
      },
    };
  }
}

/**
 * Get the current authenticated user
 *
 * @returns Current user object or null
 */
export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}
