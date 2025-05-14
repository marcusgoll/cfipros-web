/**
 * Feature Flags System
 *
 * This module defines all feature flags used in the application and provides
 * helper functions to check flag status in both server and client components.
 */

import { posthog /*, type PostHog*/ } from 'posthog-js';

// Define all feature flags with their default values
export const FEATURE_FLAGS = {
  UNIFIED_SIGNUP_FLOW: false, // Controls the unified vs. role-specific signup flow
  ANALYTICS_ENABLED: false, // Controls analytics tracking
  ENHANCED_NAV_ENABLED: true, // Controls visibility of the main site navigation (default to true for now)
  COMPANY_LINK_ENABLED: true, // Controls visibility of the company link (default to true for now)
} as const;

// Type for all available feature flags
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Get the status of a feature flag
 * This function checks environment variables first, then falls back to defaults
 * @param flag The feature flag to check. If undefined, returns true (not gated).
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag | undefined): boolean {
  if (flag === undefined) {
    return true; // If no flag is specified, consider it enabled (not gated)
  }

  // 1. Check PostHog (if client-side and PostHog is available)
  if (typeof window !== 'undefined' && posthog && typeof posthog.isFeatureEnabled === 'function') {
    // Check if PostHog has loaded flags and knows this specific flag
    // getFeatureFlagPayload returns the payload or undefined if not found/loaded
    const flagPayload = posthog.getFeatureFlagPayload(flag);
    if (flagPayload !== undefined) {
      // If PostHog has a payload for the flag, use its evaluation.
      // isFeatureEnabled will use the payload if available, or evaluate based on rollout if no payload.
      return !!posthog.isFeatureEnabled(flag);
    }
    // If no payload, it means PostHog might not have this flag defined explicitly with a payload,
    // but isFeatureEnabled might still return a value based on rollout rules or if it's a simple boolean flag.
    // However, to be safe and ensure we only use PostHog if it *definitively* has the flag,
    // we can be more strict. For now, the payload check is a good indicator.
    // Alternatively, simply calling posthog.isFeatureEnabled(flag) and relying on its internal
    // fallback to 'false' if unknown might be an option, depending on desired behavior.
  }

  // 2. Check if there's a runtime env var (for client components)
  const envValue =
    typeof window !== 'undefined' ? window.__ENV__?.FEATURE_FLAGS?.[flag] : undefined;

  if (envValue !== undefined) {
    return envValue === true || envValue === 'true';
  }

  // Then check Next.js env vars
  const nextEnvKey = `NEXT_PUBLIC_FEATURE_${flag}`;
  const nextEnvValue = process.env[nextEnvKey];

  if (nextEnvValue !== undefined) {
    return nextEnvValue === 'true';
  }

  // Fall back to default value
  return FEATURE_FLAGS[flag];
}

// Add this to your global.d.ts file or create a feature-flags.d.ts
declare global {
  interface Window {
    __ENV__?: {
      FEATURE_FLAGS?: {
        [key in FeatureFlag]?: boolean | string;
      };
    };
  }
}
