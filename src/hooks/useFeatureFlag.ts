'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';

interface UseFeatureFlagResult {
  enabled: boolean;
  loading: boolean;
}

/**
 * A hook to check if a PostHog feature flag is enabled
 *
 * @param flagKey - The key of the feature flag to check
 * @param defaultValue - The default value to return if the flag is not found
 * @returns An object with the flag value and loading state
 */
export function useFeatureFlag(flagKey?: string, defaultValue = false): UseFeatureFlagResult {
  const [enabled, setEnabled] = useState(defaultValue);
  const [loading, setLoading] = useState(!!flagKey);
  const posthog = usePostHog();

  const checkFlag = useCallback(() => {
    if (!flagKey) {
      setEnabled(true);
      setLoading(false);
      return;
    }

    if (!posthog) {
      setEnabled(defaultValue);
      setLoading(false);
      return;
    }

    try {
      // In development with no API key, defaulting to true for easier testing
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        setEnabled(true);
        setLoading(false);
        return;
      }

      const flagValue = posthog.isFeatureEnabled(flagKey);
      setEnabled(flagValue ?? defaultValue);
      setLoading(false);
    } catch {
      setEnabled(defaultValue);
      setLoading(false);
    }
  }, [flagKey, defaultValue, posthog]);

  useEffect(() => {
    checkFlag();

    // Check again after a delay in case PostHog is still initializing
    const timer = setTimeout(() => {
      if (loading) {
        checkFlag();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkFlag, loading]);

  return { enabled, loading };
}
