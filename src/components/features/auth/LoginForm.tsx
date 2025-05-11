'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
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
import { loginWithEmail } from '@/lib/supabase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginFormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string | React.ReactNode;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormData) {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await loginWithEmail(values);

      if (result.error) {
        if (result.error.message.toLowerCase().includes('invalid login credentials')) {
          setFormMessage({
            type: 'error',
            message: 'Invalid email or password.',
          });
        } else if (result.error.message.toLowerCase().includes('email not confirmed')) {
          setFormMessage({
            type: 'error',
            message: (
              <>
                Your email has not been verified. Please check your inbox or{' '}
                <Link href="/verify-email" className="underline font-semibold">
                  request a new verification email
                </Link>
                .
              </>
            ),
          });
        } else {
          setFormMessage({ type: 'error', message: result.error.message });
        }
      } else if (result.user) {
        setFormMessage({
          type: 'success',
          message: 'Login successful! Redirecting to your dashboard...',
        });
        
        // Give the user a moment to see the success message before redirecting
        setTimeout(() => {
          router.refresh(); // Update session state
          router.push('/dashboard'); // Redirect to dashboard (middleware will handle role-specific routing)
        }, 1000);
      }
    } catch (error) {
      console.error('Login failed:', error);
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
        <div className="text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
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
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
        <div className="text-center text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
} 