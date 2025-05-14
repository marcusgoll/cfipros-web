import { cookies } from 'next/headers';
import { PostHog } from 'posthog-node';

/**
 * Gets the PostHog feature flag value on the server
 *
 * @param flagKey - The key of the feature flag to check
 * @param defaultValue - The default value to return if the flag is not found
 * @returns The feature flag value
 */
export async function getFeatureFlag(flagKey: string, defaultValue = false): Promise<boolean> {
  try {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) {
      console.error('PostHog API key is not defined');
      return defaultValue;
    }

    const posthogClient = new PostHog(posthogKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    });

    // Get distinct ID from cookie if available
    const cookieStore = cookies();
    const distinctId = (await cookieStore).get('ph_distinct_id')?.value;

    if (!distinctId) {
      return defaultValue;
    }

    const flagValue = await posthogClient.isFeatureEnabled(flagKey, distinctId);
    return flagValue ?? defaultValue;
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
    return defaultValue;
  }
}
