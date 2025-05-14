# Feature Flags System

This directory contains the implementation of a lightweight feature flag system that allows for controlled feature rollout and A/B testing.

## Usage

### In Client Components

```tsx
'use client';

import { useFeatureFlag } from '@/lib/feature-flags/client';
import { FeatureFlagComponent } from '@/components/features/auth/FeatureFlagComponent';

// Option 1: Use the hook
function MyComponent() {
  const isUnifiedSignupEnabled = useFeatureFlag('UNIFIED_SIGNUP_FLOW');

  return <div>{isUnifiedSignupEnabled ? <UnifiedSignupForm /> : <LegacySignupForm />}</div>;
}

// Option 2: Use the component wrapper
function MyComponent() {
  return (
    <FeatureFlagComponent flag="UNIFIED_SIGNUP_FLOW" fallback={<LegacySignupForm />}>
      <UnifiedSignupForm />
    </FeatureFlagComponent>
  );
}
```

### In Server Components

```tsx
import { getFeatureFlag, ServerFeatureFlag } from '@/lib/feature-flags/server';

// Option 1: Use the async function
async function MyServerComponent() {
  const isUnifiedSignupEnabled = await getFeatureFlag('UNIFIED_SIGNUP_FLOW');

  return <div>{isUnifiedSignupEnabled ? <UnifiedSignupForm /> : <LegacySignupForm />}</div>;
}

// Option 2: Use the component wrapper
async function MyServerComponent() {
  return (
    <ServerFeatureFlag flag="UNIFIED_SIGNUP_FLOW" fallback={<LegacySignupForm />}>
      <UnifiedSignupForm />
    </ServerFeatureFlag>
  );
}
```

## Configuration

Feature flags can be configured in several ways:

1. **Environment Variables**: Set `NEXT_PUBLIC_FEATURE_FLAG_NAME=true` in your environment
2. **Runtime Configuration**: Use `setFeatureFlag()` from client components
3. **Default Values**: Edit the `FEATURE_FLAGS` object in `src/lib/feature-flags/index.ts`

## Available Flags

| Flag Name             | Description                               | Default |
| --------------------- | ----------------------------------------- | ------- |
| `UNIFIED_SIGNUP_FLOW` | Controls unified vs. role-specific signup | `false` |
| `ANALYTICS_ENABLED`   | Controls analytics tracking               | `false` |

## Adding New Flags

1. Add the flag to the `FEATURE_FLAGS` object in `index.ts`
2. Use the flag in your components
3. Update this documentation
