/**
 * Feature Flags System
 * 
 * This module defines all feature flags used in the application and provides
 * helper functions to check flag status in both server and client components.
 */

// Define all feature flags with their default values
export const FEATURE_FLAGS = {
  UNIFIED_SIGNUP_FLOW: false, // Controls the unified vs. role-specific signup flow
  ANALYTICS_ENABLED: false,   // Controls analytics tracking
} as const;

// Type for all available feature flags
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Get the status of a feature flag
 * This function checks environment variables first, then falls back to defaults
 * @param flag The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // First check if there's a runtime env var (for client components)
  const envValue = typeof window !== 'undefined' 
    ? window.__ENV__?.FEATURE_FLAGS?.[flag]
    : undefined;
    
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