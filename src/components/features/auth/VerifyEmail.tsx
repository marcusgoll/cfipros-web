'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client'; // Use client-side Supabase client
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This component must be a client component to use useSearchParams
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [message, setMessage] = useState<string>('Verifying your email, please wait...');
  const supabase = createBrowserClient();

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as 'signup' | 'email_change' | null;

    if (token_hash && type === 'signup') {
      const verifyUserEmail = async () => {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'signup' });

        if (error) {
          setVerificationStatus('error');
          setMessage(
            `Error verifying email: ${error.message}. Please try again or contact support.`
          );
        } else {
          setVerificationStatus('success');
          setMessage('Email successfully verified! Redirecting to login...');
          setTimeout(() => router.push('/login'), 3000); // Redirect after 3 seconds
        }
      };
      verifyUserEmail();
    } else if (type && type !== 'signup') {
      setVerificationStatus('error');
      setMessage(
        `Invalid verification type: ${type}. This link appears to be for a different purpose.`
      );
    } else {
      setVerificationStatus('error');
      setMessage(
        'Invalid or missing verification token. Please check the link or request a new one.'
      );
    }
  }, [searchParams, supabase, router]);

  return (
    <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg text-center">
      <p className="mb-4 text-lg">{message}</p>
      {verificationStatus === 'verifying' && (
        <div className="flex justify-center items-center">
          {/* You can add a spinner here */}
          <p className="text-gray-500">Loading...</p>
        </div>
      )}
      {verificationStatus === 'success' && !message.includes('Redirecting') && (
        <Button asChild>
          <Link href="/login">Proceed to Login</Link>
        </Button>
      )}
      {verificationStatus === 'error' && (
        <Button asChild>
          <Link href="/sign-up">Back to Sign Up</Link>
        </Button>
      )}
    </div>
  );
}

// Exporting a wrapper that includes Suspense for useSearchParams
export function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading verification status...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
