'use server';

import { createSupabaseServerClient } from './server';
import type { SignUpFormData } from '@/components/features/auth/SignUpForm';

export async function signUpWithEmail(data: SignUpFormData) {
  const supabase = createSupabaseServerClient();
  const { email, password } = data;

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {},
  });

  if (authError) {
    console.error('Error signing up auth user:', authError.message);
    return { user: null, session: null, error: authError };
  }

  if (!authData.user) {
    console.error('Sign up successful but no user data returned.');
    return {
      user: null,
      session: null,
      error: { name: 'AuthError', message: 'Sign up successful but no user data returned.' },
    };
  }

  // Only return auth user and session; profile creation is now handled after login/verification
  return { user: authData.user, session: authData.session, error: null };
}
