# Email Configuration

This document outlines the email configuration setup for the CFIPros application. The project uses two different email services for different purposes:

1. **Supabase Auth** - Handles authentication emails (signup verification, password reset)
2. **Resend** - Handles all non-authentication transactional emails

## Supabase Auth Email Configuration

Supabase Auth handles all authentication-related emails including:

- Email verification
- Password reset
- Email address changes

These emails are configured through the Supabase Dashboard under Authentication > Email Templates.

### Email Template Customization

It's recommended to customize the default email templates in the Supabase Dashboard to match the CFIPros branding. The following templates should be customized:

1. **Confirmation Template** - Sent when a user signs up to verify their email
2. **Invite Template** - Used when inviting users to the platform
3. **Magic Link Template** - Used for passwordless login
4. **Recovery Template** - Used for password reset

## Resend Configuration

Resend is used for all non-authentication emails like:

- Welcome emails
- Notification emails
- Invitation emails to join organizations
- Test report sharing

### Required Environment Variables

Add these variables to your `.env.local` file:

```
# Resend Email Configuration
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-verified-sender-email@example.com
```

### Setting Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify a sending domain or use Resend's shared domain for testing
3. Create an API key and add it to your environment variables
4. Verify your sender email address in Resend

## Testing Email Configuration

You can test the email configuration using the `sendTestEmail` function from the email service:

```typescript
import { sendTestEmail } from '@/services/emailService';

// Send a test email to verify configuration
sendTestEmail('your-email@example.com');
```

## Email Security Best Practices

1. Never hardcode API keys in your codebase
2. Store all email configuration in environment variables
3. Use Resend's API key with the minimum required permissions
4. Ensure proper error handling for email sending failures
