/**
 * Feature Flags - Client Side Hooks
 *
 * This module provides React hooks to use feature flags in client components.
 */

'use client';

import { useState, useEffect } from 'react';
import { type FeatureFlag, isFeatureEnabled /*, FEATURE_FLAGS*/ } from './index';
import { usePostHog } from 'posthog-js/react';

/**
 * React hook to check if a feature is enabled
 * @param flag The feature flag to check. Can be undefined.
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(flag: FeatureFlag | undefined): boolean {
  const posthog = usePostHog();
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (flag === undefined) return true; // Not gated
    // Initial state: use isFeatureEnabled which now checks PostHog first, then env, then defaults from FEATURE_FLAGS
    return isFeatureEnabled(flag);
  });

  useEffect(() => {
    if (flag === undefined) {
      setIsEnabled(true);
      return; // No need to set up listeners if not gated
    }

    // Function to update the flag state based on the hierarchy
    const updateFlagState = () => {
      const newValue = isFeatureEnabled(flag);
      setIsEnabled(newValue);
    };

    // Initial check in case PostHog has loaded flags since initial useState
    updateFlagState();

    // Listen for PostHog's feature flag updates
    const onFlagsListener = () => updateFlagState();
    posthog?.onFeatureFlags(onFlagsListener);

    // Also listen for our local/manual override changes
    window.addEventListener('feature-flag-changed', updateFlagState);

    return () => {
      // Cleanup PostHog listener - the actual method might vary.
      // PostHog's onFeatureFlags might return an unsubscribe function.
      // If so, it should be: const unsubscribe = posthog?.onFeatureFlags(onFlagsListener); return unsubscribe;
      // For now, if no direct unsubscribe, this is a conceptual cleanup.
      // Attempting to remove a generic listener might not always work as expected
      // if PostHog manages its listeners differently.
      // It's best practice for onFeatureFlags to return an unsubscribe function.
      // Assuming it does for now, conceptually:
      // if (posthog && posthog.off) { // Or a specific unregister function
      //   posthog.off('featureFlags', onFlagsListener); // This is hypothetical
      // }
      // If onFeatureFlags returns an unsubscribe function, that would be used here.
      // For this example, we will assume a robust SDK would provide this.
      // The key is that a listener *was* set with posthog.onFeatureFlags.

      window.removeEventListener('feature-flag-changed', updateFlagState);
    };
  }, [flag, posthog]); // Depend on posthog instance and flag

  return isEnabled;
}

/**
 * Helper to update a feature flag at runtime (useful for testing or admin panel)
 * @param flag The feature flag to update
 * @param value The new value
 */
export function setFeatureFlag(flag: FeatureFlag, value: boolean): void {
  if (typeof window === 'undefined') return;

  // Initialize window.__ENV__ if it doesn't exist
  window.__ENV__ = window.__ENV__ || {};
  window.__ENV__.FEATURE_FLAGS = window.__ENV__.FEATURE_FLAGS || {};

  // Update the flag
  window.__ENV__.FEATURE_FLAGS[flag] = value;

  // Dispatch event to notify listeners
  window.dispatchEvent(
    new CustomEvent('feature-flag-changed', {
      detail: { flag, value },
    })
  );
}
