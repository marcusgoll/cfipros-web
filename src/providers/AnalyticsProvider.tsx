'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { useFeatureFlag } from '@/lib/feature-flags/client';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAnalyticsEnabled = useFeatureFlag('ANALYTICS_ENABLED');

  // Initialize analytics on first render
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views when route changes
  useEffect(() => {
    if (isAnalyticsEnabled) {
      // Wait for the page to fully load
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      // Use setTimeout to ensure the page has fully loaded
      // This helps get more accurate page view timing
      setTimeout(() => {
        trackPageView(url);
      }, 300);
    }
  }, [pathname, searchParams, isAnalyticsEnabled]);

  return <>{children}</>;
}
