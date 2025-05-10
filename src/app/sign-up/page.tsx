import { SignUpForm } from '@/components/features/auth/SignUpForm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Student',
  description: 'Create a new student account to access the platform.',
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Create Your Student Account</h1>
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
        <p className="mt-8 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
