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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trackEvent, EVENTS } from '@/lib/analytics';

// Role selection schema
const roleSchema = z.object({
  role: z.enum(['student', 'cfi', 'school_admin'], {
    required_error: 'Please select a role',
  }),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RoleSelection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: undefined,
    },
  });

  async function onSubmit(data: RoleFormValues) {
    setIsLoading(true);

    try {
      // Store role selection for the next step
      localStorage.setItem('selectedRole', data.role);

      // Redirect to the appropriate profile completion page
      router.push('/profile-setup');

      // Track event
      trackEvent(EVENTS.ROLE_SELECTED, { role: data.role });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">
            Choose how you&apos;ll use CFI PROS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="font-semibold">Student Pilot</div>
                            <p className="text-sm text-gray-500">
                              I&apos;m learning to fly and preparing for FAA tests
                            </p>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="cfi" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="font-semibold">Certified Flight Instructor</div>
                            <p className="text-sm text-gray-500">
                              I teach students and create lesson plans
                            </p>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="school_admin" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="font-semibold">Flight School Administrator</div>
                            <p className="text-sm text-gray-500">
                              I manage a flight school and its instructors
                            </p>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Continuing...' : 'Continue'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
