'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FeatureFlagToggle } from '@/components/features/auth/FeatureFlagToggle';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        {/* Feature Flag Toggle for Testing */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Feature Flag Testing</h2>
          <div className="space-y-2">
            <FeatureFlagToggle flag="UNIFIED_SIGNUP_FLOW" label="Unified Signup Flow" />
            <FeatureFlagToggle flag="ANALYTICS_ENABLED" label="Analytics Tracking" />
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Toggle these feature flags to test different application behaviors.
          </p>
        </div>
        
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/sign-up"
          >
            Sign Up Now
          </Link>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/login"
          >
            Log In
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/sign-up"
        >
          Start Now
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/login"
        >
          Log In
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/dashboard"
        >
          Dashboard →
        </Link>
      </footer>
    </div>
  );
}
