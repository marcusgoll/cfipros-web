'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trackEvent, EVENTS } from '@/lib/analytics';

// Base schema for all roles
const baseSchema = {
  fullName: z.string().min(2, 'Full name is required'),
};

// CFI-specific fields
const cfiSchema = z.object({
  ...baseSchema,
  certificateNumber: z.string().min(4, 'Certificate number is required'),
});

// School admin-specific fields
const schoolAdminSchema = z.object({
  ...baseSchema,
  schoolName: z.string().min(2, 'School name is required'),
  schoolType: z
    .enum(['ground_school', 'part61_flight_school', 'part141_flight_school'], {
      required_error: 'Please select the school type',
    })
    .default('part61_flight_school'),
});

// Student-specific fields (just basic info for now)
const studentSchema = z.object({
  ...baseSchema,
});

// Dynamic schema based on selected role
type ProfileFormValues =
  | z.infer<typeof cfiSchema>
  | z.infer<typeof schoolAdminSchema>
  | z.infer<typeof studentSchema>;

export function ProfileSetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Get role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('selectedRole');
    if (role) {
      setSelectedRole(role);
    } else {
      // If no role is found, redirect back to role selection
      router.replace('/role-selection');
    }
  }, [router]);

  // Different form for each role
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(
      selectedRole === 'cfi'
        ? cfiSchema
        : selectedRole === 'school_admin'
          ? schoolAdminSchema
          : studentSchema
    ),
    defaultValues: {
      fullName: '',
      ...(selectedRole === 'cfi' ? { certificateNumber: '' } : {}),
      ...(selectedRole === 'school_admin'
        ? { schoolName: '', schoolType: 'part61_flight_school' }
        : {}),
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Update user profile in Supabase with the submitted data
      console.log('Submitting profile data:', data, 'for role:', selectedRole);

      // Track the profile completion event
      trackEvent(EVENTS.PROFILE_COMPLETED, { role: selectedRole });

      // Redirect based on role
      if (selectedRole === 'student') {
        // Students go directly to dashboard
        router.replace('/dashboard');
      } else {
        // CFIs and School Admins go to subscription guidance
        router.replace('/dashboard/cfi/subscribe-guidance');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  }

  // If no role is selected yet, show a loading state
  if (!selectedRole) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            {selectedRole === 'cfi' && 'Tell us more about yourself as a flight instructor'}
            {selectedRole === 'school_admin' && 'Tell us more about your flight school'}
            {selectedRole === 'student' && 'Tell us more about yourself'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 p-4 text-red-600 border border-red-200 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Common Fields */}
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

              {/* CFI-specific Fields */}
              {selectedRole === 'cfi' && (
                <FormField
                  control={form.control}
                  name="certificateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CFI Certificate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your CFI certificate number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* School Admin-specific Fields */}
              {selectedRole === 'school_admin' && (
                <>
                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your flight school's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schoolType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue="part61_flight_school"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your school type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ground_school">Ground School</SelectItem>
                            <SelectItem value="part61_flight_school">
                              Part 61 Flight School
                            </SelectItem>
                            <SelectItem value="part141_flight_school">
                              Part 141 Flight School
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">
                          Ground School: Training focused on theory only. Part 61: Individual flight
                          training with flexible curriculum. Part 141: FAA-approved structured
                          programs.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
