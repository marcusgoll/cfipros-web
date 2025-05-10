'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { signUpWithEmail } from '@/lib/supabase/auth'; // Import the server action
import { useState } from 'react';

const formSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof formSchema>;

export function SignUpForm() {
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignUpFormData) {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await signUpWithEmail(values);

      if (result.error) {
        setFormMessage({ type: 'error', message: result.error.message });
      } else if (result.user) {
        // Supabase sends a confirmation email by default if enabled in project settings.
        // result.user.identities might be empty if email confirmation is pending.
        if (
          result.user.identities &&
          result.user.identities.length > 0 &&
          result.user.identities[0].identity_data?.email
        ) {
          setFormMessage({
            type: 'success',
            message: 'Sign up successful! Please check your email to verify your account.',
          });
          form.reset(); // Reset form on successful submission
        } else {
          // This case might occur if email confirmation is required and the user object doesn't immediately confirm the email.
          setFormMessage({
            type: 'success',
            message: 'Confirmation email sent! Please check your inbox to verify your account.',
          });
          form.reset();
        }
      } else {
        // Should not happen if no error and no user, but good to have a fallback.
        setFormMessage({
          type: 'error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      setFormMessage({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}
