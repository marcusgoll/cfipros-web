/**
 * Feature Flags - Server Side Utilities
 *
 * This module provides utilities for server components to check feature flag status.
 */

import { FeatureFlag, isFeatureEnabled } from './index';

/**
 * Server component helper to check if a feature flag is enabled
 * @param flag The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export async function getFeatureFlag(flag: FeatureFlag): Promise<boolean> {
  return isFeatureEnabled(flag);
}

/**
 * Server component helper that conditionally renders based on a feature flag
 * This has been temporarily commented out to fix linting issues.
 * Uncomment and fix once the TypeScript parser issue is resolved.
 */
/*
export async function ServerFeatureFlag({
  flag,
  children,
  fallback = null
}: {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isEnabled = await getFeatureFlag(flag);
  return isEnabled ? children : fallback;
}
*/
