'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export type ForgotPasswordFormData = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await requestPasswordReset(values.email);

      if (result.error) {
        setFormMessage({
          type: 'error',
          message: result.error.message,
        });
      } else {
        setFormMessage({
          type: 'success',
          message: 'Password reset instructions have been sent to your email address.',
        });

        // Track the event
        trackEvent('password_reset_requested', {
          success: true,
        });
      }
    } catch (error) {
      console.error('Password reset request failed:', error);

      // Track the failed event
      trackEvent('password_reset_requested', {
        success: false,
      });

      if (error instanceof Error) {
        setFormMessage({ type: 'error', message: error.message });
      } else {
        setFormMessage({ type: 'error', message: 'An unexpected error occurred.' });
      }
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formMessage && (
          <div
            className={`p-3 rounded-md ${
              formMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {formMessage.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="text-center text-sm mt-4">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </Form>
  );
}
