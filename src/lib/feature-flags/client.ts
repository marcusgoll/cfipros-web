/**
 * Feature Flags - Client Side Hooks
 *
 * This module provides React hooks to use feature flags in client components.
 */

'use client';

import { useState, useEffect } from 'react';
import { type FeatureFlag, isFeatureEnabled } from './index';

/**
 * React hook to check if a feature is enabled
 * @param flag The feature flag to check. Can be undefined.
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(flag: FeatureFlag | undefined): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isFeatureEnabled(flag));

  useEffect(() => {
    // Check if there was a runtime update to the flag
    const handleFlagChange = () => {
      const newValue = isFeatureEnabled(flag);
      if (newValue !== isEnabled) {
        setIsEnabled(newValue);
      }
    };

    // Listen for feature flag changes (custom event)
    window.addEventListener('feature-flag-changed', handleFlagChange);

    return () => {
      window.removeEventListener('feature-flag-changed', handleFlagChange);
    };
  }, [flag, isEnabled]);

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
