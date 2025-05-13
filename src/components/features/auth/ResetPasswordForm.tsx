'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { trackEvent } from '@/lib/analytics';
import { resetPassword } from '@/services/authService';
import { createBrowserClient } from '@supabase/ssr';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setFormMessage({
          type: 'error',
          message: 'Supabase configuration is missing.',
        });
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setFormMessage({
          type: 'error',
          message: 'Your session has expired. Please try resetting your password again.',
        });
      } else {
        setHasSession(true);
      }
    };

    checkSession();
  }, []);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormData) {
    if (!hasSession) {
      setFormMessage({
        type: 'error',
        message: 'Your session has expired. Please try resetting your password again.',
      });
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      console.log('[ResetPasswordForm] Attempting password reset');

      // Use server action to reset password - we don't need to pass the token anymore
      // as the server will use the session cookies
      const { error } = await resetPassword('', values.password);

      if (error) {
        console.error('[ResetPasswordForm] Error:', error.message);
        setFormMessage({
          type: 'error',
          message: error.message,
        });

        // Track the failed event
        trackEvent('password_reset_completed', {
          success: false,
        });
      } else {
        console.log('[ResetPasswordForm] Password reset successful');
        setFormMessage({
          type: 'success',
          message: 'Your password has been successfully reset. Redirecting to login...',
        });

        // Track the successful event
        trackEvent('password_reset_completed', {
          success: true,
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Password reset failed:', error);

      // Track the failed event
      trackEvent('password_reset_completed', {
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
          <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter and confirm your new password below.
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={isSubmitting} />
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

        <Button type="submit" className="w-full" disabled={isSubmitting || !hasSession}>
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}
