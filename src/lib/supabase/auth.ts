'use server';

import { createSupabaseServerClient } from './server';
import type { SignUpFormData } from '@/components/features/auth/SignUpForm';
import type { SchoolSignUpFormData } from '@/components/features/auth/SchoolSignUpForm';
import type { LoginFormData } from '@/components/features/auth/LoginForm';

/**
 * Auth functions for Supabase authentication
 * 
 * NOTE ON EMAIL HANDLING:
 * All authentication-related emails (signup, verification, password reset)
 * are handled directly by Supabase Auth and its email templates.
 * 
 * To customize these emails, go to the Supabase Dashboard:
 * 1. Authentication > Email Templates
 * 2. Customize each template (Confirmation, Invite, Magic Link, Recovery)
 * 
 * For non-auth related emails, use the emailService.ts which leverages Resend.
 */

export async function signUpWithEmail(data: SignUpFormData) {
  console.log('[Auth Action] Attempting Student Sign Up with:', data.email);
  const supabase = createSupabaseServerClient();
  const { email, password } = data;

  // First attempt to sign in with the email - if it works with a wrong password, the user exists
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'deliberately-wrong-password-to-check-existence',
  });

  // If we get a wrong password error, the user exists
  if (signInError?.message?.includes('Invalid login credentials')) {
    console.log('[Auth Action - Student] User already exists (based on auth check):', email);
    return {
      user: null,
      session: null,
      error: { 
        name: 'UserExistsError', 
        message: 'User already registered'
      }
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {},
  });

  console.log('[Auth Action - Student] Supabase signUp Response:');
  console.log('Auth Data:', JSON.stringify(authData, null, 2));
  console.log('Auth Error:', JSON.stringify(authError, null, 2));

  if (authError) {
    console.error('[Auth Action - Student] Error signing up auth user:', authError.message);
    return { user: null, session: null, error: authError };
  }

  // Check if user object exists and if email confirmation is pending or completed
  if (authData.user) {
    console.log('[Auth Action - Student] User created/found. User ID:', authData.user.id);
    console.log('[Auth Action - Student] Email confirmed at:', authData.user.email_confirmed_at);
    
    // If email is already confirmed, this is an existing user
    if (authData.user.email_confirmed_at) {
      return {
        user: null,
        session: null,
        error: { 
          name: 'UserExistsError', 
          message: 'User already registered'
        }
      };
    }
  } else {
    console.error('[Auth Action - Student] Sign up call successful but no user data returned in authData.user.');
    return {
      user: null,
      session: null,
      error: { name: 'AuthError', message: 'Sign up successful but no user object in response.' },
    };
  }
  
  return { user: authData.user, session: authData.session, error: null };
}

// Added for CFI Sign Up
export async function signUpWithEmailCFI(data: SignUpFormData) {
  console.log('[Auth Action] Attempting CFI Sign Up with:', data.email);
  const supabase = createSupabaseServerClient();
  const { email, password } = data;

  // First attempt to sign in with the email - if it works with a wrong password, the user exists
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'deliberately-wrong-password-to-check-existence',
  });

  // If we get a wrong password error, the user exists
  if (signInError?.message?.includes('Invalid login credentials')) {
    console.log('[Auth Action - CFI] User already exists (based on auth check):', email);
    return {
      user: null,
      session: null,
      error: { 
        name: 'UserExistsError', 
        message: 'User already registered'
      }
    };
  }
  
  // Proceed with normal signup if user doesn't exist
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {},
  });

  console.log('[Auth Action - CFI] Supabase signUp Response:');
  console.log('Auth Data:', JSON.stringify(authData, null, 2));
  console.log('Auth Error:', JSON.stringify(authError, null, 2));

  if (authError) {
    console.error('[Auth Action - CFI] Error signing up CFI auth user:', authError.message);
    return { user: null, session: null, error: authError };
  }

  if (authData.user) {
    console.log('[Auth Action - CFI] User created/found. User ID:', authData.user.id);
    console.log('[Auth Action - CFI] Email confirmed at:', authData.user.email_confirmed_at);
    
    // If email is already confirmed, this is an existing user
    if (authData.user.email_confirmed_at) {
      return {
        user: null,
        session: null,
        error: { 
          name: 'UserExistsError', 
          message: 'User already registered'
        }
      };
    }
  } else {
    console.error('[Auth Action - CFI] Sign up call successful but no user data returned in authData.user.');
    return {
      user: null,
      session: null,
      error: { name: 'AuthError', message: 'CFI Sign up successful but no user object in response.' },
    };
  }

  return { user: authData.user, session: authData.session, error: null };
}

// Added for School Admin Sign Up
export async function signUpWithEmailSchool(data: SchoolSignUpFormData) {
  console.log('[Auth Action] Attempting School Admin Sign Up with:', data.email);
  const supabase = createSupabaseServerClient();
  const { email, password, fullName, schoolName, part61Or141Type } = data;

  // First attempt to sign in with the email - if it works with a wrong password, the user exists
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'deliberately-wrong-password-to-check-existence',
  });

  // If we get a wrong password error, the user exists
  if (signInError?.message?.includes('Invalid login credentials')) {
    console.log('[Auth Action - School Admin] User already exists (based on auth check):', email);
    return {
      user: null,
      session: null,
      error: { 
        name: 'UserExistsError', 
        message: 'User already registered'
      }
    };
  }
  
  // Proceed with normal signup if user doesn't exist
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'SCHOOL_ADMIN',
        school_name: schoolName,
        part_61_or_141_type: part61Or141Type
      }
    },
  });

  console.log('[Auth Action - School Admin] Supabase signUp Response:');
  console.log('Auth Data:', JSON.stringify(authData, null, 2));
  console.log('Auth Error:', JSON.stringify(authError, null, 2));

  if (authError) {
    console.error('[Auth Action - School Admin] Error signing up School Admin auth user:', authError.message);
    return { user: null, session: null, error: authError };
  }

  if (authData.user) {
    console.log('[Auth Action - School Admin] User created/found. User ID:', authData.user.id);
    console.log('[Auth Action - School Admin] Email confirmed at:', authData.user.email_confirmed_at);
    
    // If email is already confirmed, this is an existing user
    if (authData.user.email_confirmed_at) {
      return {
        user: null,
        session: null,
        error: { 
          name: 'UserExistsError', 
          message: 'User already registered'
        }
      };
    }

    // We don't create the school record here, we'll do that during profile setup
    // after the user has verified their email

  } else {
    console.error('[Auth Action - School Admin] Sign up call successful but no user data returned in authData.user.');
    return {
      user: null,
      session: null,
      error: { name: 'AuthError', message: 'School Admin Sign up successful but no user object in response.' },
    };
  }

  return { user: authData.user, session: authData.session, error: null };
}

// Login with email and password
export async function loginWithEmail(data: LoginFormData) {
  console.log('[Auth Action] Attempting login with:', data.email);
  const supabase = createSupabaseServerClient();
  const { email, password } = data;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('[Auth Action - Login] Supabase login Response:');
  console.log('Auth Data:', authData ? 'Session exists' : 'No session');
  console.log('Auth Error:', JSON.stringify(authError, null, 2));

  if (authError) {
    console.error('[Auth Action - Login] Error signing in:', authError.message);
    return { user: null, session: null, error: authError };
  }

  if (!authData.user) {
    console.error('[Auth Action - Login] Login successful but no user data returned.');
    return {
      user: null,
      session: null,
      error: { name: 'AuthError', message: 'Login successful but no user object in response.' },
    };
  }

  return { user: authData.user, session: authData.session, error: null };
}

// Get user role from profile
export async function getUserRole(userId: string) {
  console.log('[Auth Action] Getting user role for:', userId);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Auth Action] Error fetching user role:', error.message);
    return { role: null, error };
  }

  return { role: data?.role, error: null };
}

// Determine redirect path based on user role
export async function getRedirectPathByRole(userId: string) {
  const { role, error } = await getUserRole(userId);
  
  if (error || !role) {
    console.error('[Auth Action] Error determining redirect path:', error?.message || 'No role found');
    return '/profile-setup'; // Default to profile setup if role can't be determined
  }

  switch (role) {
    case 'STUDENT':
      return '/dashboard';
    case 'CFI':
      return '/dashboard/cfi';
    case 'SCHOOL_ADMIN':
      return '/dashboard/school';
    default:
      return '/dashboard';
  }
}
