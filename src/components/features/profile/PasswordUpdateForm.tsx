'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { trackEvent, EVENTS } from '@/lib/analytics';
import { updatePassword } from '@/lib/supabase/auth';
import type { User } from '@supabase/supabase-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// Define form schema with password requirements
const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmNewPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordUpdateFormValues = z.infer<typeof passwordUpdateSchema>;

type PasswordUpdateFormProps = {
  user: User;
};

export default function PasswordUpdateForm({ user }: PasswordUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  // Check if user signed up with OAuth provider
  useEffect(() => {
    // Users who signed up with OAuth provider won't have a password
    if (user?.app_metadata?.provider && user.app_metadata.provider !== 'email') {
      setIsOAuthUser(true);
    }
  }, [user]);

  const form = useForm<PasswordUpdateFormValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  async function onSubmit(data: PasswordUpdateFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess('Password updated successfully');
        // Track the password update event
        trackEvent(EVENTS.PASSWORD_UPDATED, {});
        // Clear the form
        form.reset();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isOAuthUser) {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-900/20">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-400">OAuth Account</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          You signed in with a third-party provider. Password management is handled by your
          provider.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 p-4 text-red-600 border border-red-200 rounded-md text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 text-green-600 border border-green-200 rounded-md text-sm mb-6">
          {success}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Your current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
