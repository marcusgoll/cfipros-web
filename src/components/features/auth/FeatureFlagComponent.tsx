'use client';

import { useFeatureFlag } from '@/lib/feature-flags/client';
import type { FeatureFlag } from '@/lib/feature-flags';

interface FeatureFlagComponentProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * React component that conditionally renders based on a feature flag
 */
export function FeatureFlagComponent({
  flag,
  children,
  fallback = null,
}: FeatureFlagComponentProps) {
  const isEnabled = useFeatureFlag(flag);

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
