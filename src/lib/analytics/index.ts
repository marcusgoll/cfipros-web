/**
 * Analytics Module using PostHog
 * 
 * This module provides functions to track page views and events in the application.
 */

import posthog from 'posthog-js';
import { isFeatureEnabled } from '../feature-flags';

// Initialize PostHog in client components
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  
  const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (posthogApiKey && isFeatureEnabled('ANALYTICS_ENABLED')) {
    posthog.init(posthogApiKey, {
      api_host: posthogHost,
      capture_pageview: false, // We'll capture pageviews manually
      persistence: 'localStorage',
      autocapture: false,
    });
  }
}

// Track a page view
export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !isFeatureEnabled('ANALYTICS_ENABLED')) return;

  posthog.capture('$pageview', {
    $current_url: url,
  });
}

// Event names for consistent tracking
export const EVENTS = {
  // Signup flow events
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  EMAIL_VERIFICATION_SENT: 'email_verification_sent',
  EMAIL_VERIFIED: 'email_verified',
  ROLE_SELECTED: 'role_selected',
  PROFILE_COMPLETED: 'profile_completed',
  
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  
  // Subscription events
  SUBSCRIPTION_PAGE_VIEWED: 'subscription_page_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
};

// Track a custom event
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !isFeatureEnabled('ANALYTICS_ENABLED')) return;

  posthog.capture(event, properties);
}

// Identify a user (call after login/signup)
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined' || !isFeatureEnabled('ANALYTICS_ENABLED')) return;

  posthog.identify(userId, traits);
}

// Reset user (call on logout)
export function resetUser() {
  if (typeof window === 'undefined' || !isFeatureEnabled('ANALYTICS_ENABLED')) return;

  posthog.reset();
} 