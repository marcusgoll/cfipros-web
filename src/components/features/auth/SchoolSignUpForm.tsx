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
import { signUpWithEmailSchool } from '@/lib/supabase/auth';
import { useState } from 'react';
import Link from 'next/link';
import { OAuthProviders } from './OAuthProviders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    schoolName: z.string().min(2, { message: 'School name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
    part61Or141Type: z.enum(['PART_61', 'PART_141'], {
      required_error: 'Please select your school type.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SchoolSignUpFormData = z.infer<typeof formSchema>;

export function SchoolSignUpForm() {
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string | React.ReactNode;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SchoolSignUpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      schoolName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SchoolSignUpFormData) {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await signUpWithEmailSchool(values);

      if (result.error) {
        if (result.error.message.toLowerCase().includes('user already registered') || 
            result.error.message.toLowerCase().includes('email link signin rate exceeded') ||
            result.error.message.toLowerCase().includes('user already exists')
        ) {
          setFormMessage({
            type: 'error',
            message: (
              <>
                This email is already registered. Please{" "}
                <Link href="/login" className="underline font-semibold">
                  log in
                </Link>
                {" "}or use a different email.
              </>
            ),
          });
        } else if (result.error.message.toLowerCase().includes('email rate limit exceeded')) {
             setFormMessage({
                type: 'error',
                message: 'Too many attempts. Please try again later.'
            });
        } else {
          setFormMessage({ type: 'error', message: result.error.message });
        }
      } else if (result.user) {
        // Supabase sends a confirmation email by default if enabled in project settings.
        setFormMessage({
          type: 'success',
          message: 'Sign up successful! Please check your email to verify your account.',
        });
        form.reset(); // Reset form on successful submission
      } else {
        // Fallback for unexpected cases
        setFormMessage({
          type: 'error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error) {
      console.error('School Admin Sign up failed:', error);
      if (error instanceof Error) {
        setFormMessage({ type: 'error', message: error.message });
      } else {
        setFormMessage({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    }
    setIsSubmitting(false);
  }

  return (
    <div className="w-full max-w-md">
      <OAuthProviders />

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 flex-shrink text-sm text-gray-500">Or sign up with email</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="schoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Flight School" {...field} disabled={isSubmitting} />
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
            name="part61Or141Type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PART_61">Part 61</SelectItem>
                    <SelectItem value="PART_141">Part 141</SelectItem>
                  </SelectContent>
                </Select>
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing Up...' : 'Sign Up as School Admin'}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        Not a Flight School Administrator?{" "}
        <Link href="/sign-up" className="underline">
          Sign up as a student
        </Link>
        {" or "}
        <Link href="/cfi-sign-up" className="underline">
          Sign up as a CFI
        </Link>
      </div>
    </div>
  );
} 