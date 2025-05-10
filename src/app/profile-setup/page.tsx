'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (profile) {
        router.replace('/dashboard'); // Change to your main app page
      } else {
        setLoading(false);
      }
    }
    checkProfile();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('User not authenticated.');
      setSubmitting(false);
      return;
    }
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: 'STUDENT',
    });
    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }
    router.replace('/dashboard'); // Change to your main app page
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <label htmlFor="fullName" className="block text-left font-medium">
            Full Name
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
            disabled={submitting}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" disabled={submitting || !fullName.trim()}>
            {submitting ? 'Saving...' : 'Save and Continue'}
          </Button>
        </form>
      </main>
    </div>
  );
}
