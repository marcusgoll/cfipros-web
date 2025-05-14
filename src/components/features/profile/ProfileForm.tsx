'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { trackEvent, EVENTS } from '@/lib/analytics';
import { updateProfile } from '@/lib/supabase/auth';
import type { User } from '@supabase/supabase-js';

// Define form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define the profile structure
interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  updated_at?: string;
  created_at?: string;
  role?: string;
  [key: string]: unknown; // Use unknown instead of any
}

type ProfileFormProps = {
  user: User; // Supabase user
  profile: Profile | null; // Profile data from database
};

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with current values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile({
        userId: user.id,
        fullName: data.fullName,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess('Profile updated successfully');
        // Track the profile update event
        trackEvent(EVENTS.PROFILE_UPDATED, { userId: user.id });
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{user.email}</p>
        <p className="text-xs text-gray-500 mt-1">
          To change your email address, please contact support.
        </p>
      </div>
    </div>
  );
}
