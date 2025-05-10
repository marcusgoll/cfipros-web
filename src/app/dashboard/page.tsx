'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);

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
      if (!profile) {
        router.replace('/profile-setup');
        return;
      }
      setLoading(false);
    }
    checkProfile();
  }, [router, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Render your dashboard content here
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full max-w-2xl p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard!</h1>
        {/* Add your dashboard content here */}
      </main>
    </div>
  );
}
