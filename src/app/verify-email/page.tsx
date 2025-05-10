import { VerifyEmail } from '@/components/features/auth/VerifyEmail';
import { Suspense } from 'react';

// Wrapper component to handle Suspense for searchParams
function VerifyEmailPageContent() {
  // The VerifyEmail component will handle reading searchParams internally
  // as it needs to be a client component to do so effectively with hooks.
  return <VerifyEmail />;
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Verifying Your Email</h1>
        {/* Suspense is important here if VerifyEmail uses useSearchParams */}
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailPageContent />
        </Suspense>
      </main>
    </div>
  );
}
