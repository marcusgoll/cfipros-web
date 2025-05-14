'use client';

import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FaGoogle } from 'react-icons/fa';
import { useState } from 'react';

interface OAuthProvidersProps {
  variant?: 'login' | 'signup';
}

export function OAuthProviders({ variant = 'signup' }: OAuthProvidersProps) {
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleOAuthSignIn = async (provider: 'google') => {
    setError(null);
    setLoadingGoogle(true);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    }

    setLoadingGoogle(false);
  };

  // Determine button text based on variant
  const buttonText = variant === 'login' ? 'Log in with Google' : 'Sign up with Google';

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => handleOAuthSignIn('google')}
        disabled={loadingGoogle}
      >
        {loadingGoogle ? (
          'Loading...'
        ) : (
          <>
            <FaGoogle className="mr-2 h-4 w-4" /> {buttonText}
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
