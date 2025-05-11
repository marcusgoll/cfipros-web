# Analytics System

This directory contains the implementation of the analytics tracking system using PostHog.

## Usage

### Tracking Page Views

Page views are automatically tracked by the `AnalyticsProvider` component which is included in the root layout. No further action is required.

### Tracking Custom Events

```tsx
import { trackEvent, EVENTS } from '@/lib/analytics';

// Track an event with predefined name
trackEvent(EVENTS.SIGNUP_COMPLETED, { method: 'email' });

// Track a custom event
trackEvent('custom_event_name', { property1: 'value1', property2: 'value2' });
```

### Identifying Users

```tsx
import { identifyUser } from '@/lib/analytics';

// Call after user login/signup is confirmed
identifyUser(userId, {
  email: user.email,
  role: user.role,
  // Other user traits
});
```

### Resetting User Identity

```tsx
import { resetUser } from '@/lib/analytics';

// Call on logout
resetUser();
```

## Event Taxonomy

We use a consistent event naming convention to make analysis easier. All standard events are defined in the `EVENTS` object:

| Event Name | Description | Key Properties |
|------------|-------------|----------------|
| `signup_started` | User begins signup | `{ method: 'email' \| 'google' \| 'github' }` |
| `signup_completed` | User completes initial signup | `{ method: 'email' \| 'google' \| 'github' }` |
| `email_verification_sent` | Verification email sent | `{ email: string }` |
| `email_verified` | Email verified | `{ email: string }` |
| `role_selected` | User selects role | `{ role: 'student' \| 'cfi' \| 'school_admin' }` |
| `profile_completed` | User completes profile | `{ role: string }` |
| `login` | User logs in | `{ method: string }` |
| `logout` | User logs out | `{}` |
| `subscription_page_viewed` | Subscription page viewed | `{ role: string }` |
| `subscription_started` | User begins subscription process | `{ plan: string, role: string }` |
| `subscription_completed` | Subscription completed | `{ plan: string, role: string }` |

## Feature Flag Control

Analytics are controlled by the `ANALYTICS_ENABLED` feature flag. Set this to `true` in your environment variables to enable tracking:

```
NEXT_PUBLIC_FEATURE_ANALYTICS_ENABLED=true
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_POSTHOG_API_KEY` - Your PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (defaults to https://app.posthog.com)

## Privacy Considerations

- Only track necessary user actions and properties
- Respect user privacy settings
- Don't track personal or sensitive information
- Consider data retention policies 