import { UnifiedSignUpForm } from '@/components/features/auth/UnifiedSignUpForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { OAuthProviders } from '@/components/features/auth/OAuthProviders';

export const metadata: Metadata = {
  title: 'Sign Up | CFI PROS',
  description: 'Create a new account to access the platform.',
};

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Create your Account
          </h1>
        </div>

        <OAuthProviders />

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 flex-shrink text-sm text-gray-500">Or sign up with email</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <UnifiedSignUpForm />
        <div className="text-center text-sm mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            You&apos;ll select your role after confirming your email
          </p>
        </div>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
