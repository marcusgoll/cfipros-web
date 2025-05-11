'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyEmail } from '@/components/features/auth/VerifyEmail';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get email from localStorage that was set during signup
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleContinue = () => {
    // After email verification, redirect to role selection
    router.push('/role-selection');
  };

  if (!email) {
    return (
      <div className="container flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Email Verification Required</CardTitle>
            <CardDescription>
              We couldn&apos;t find your email address. Please return to the signup page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/sign-up" className="w-full">
              <Button className="w-full">Return to Sign Up</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <VerifyEmail email={email} onVerified={handleContinue} />
    </div>
  );
}
