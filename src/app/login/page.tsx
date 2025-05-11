import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Log In | CFIPros',
  description: 'Log in to your CFIPros account',
};

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  
  // If user is already authenticated, redirect to dashboard
  if (data?.session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Log in to your CFIPros account
          </p>
        </div>
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
