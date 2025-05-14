import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, GraduationCap, FileUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | CFIPros',
  description: 'Student Dashboard - CFIPros',
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user role
  const { role } = await getUserRole(user.id);

  // If user has a specific role that has a dedicated dashboard, redirect them
  if (role === 'CFI') {
    redirect('/dashboard/cfi');
  } else if (role === 'SCHOOL_ADMIN') {
    redirect('/dashboard/school');
  }

  // Otherwise, show the student dashboard (default)
  // Fetch any student-specific data here
  let studentData = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching student profile:', error.message);
    } else {
      studentData = data;

      // If no profile exists, create one (similar to profile page logic)
      if (!studentData) {
        console.log('No student profile found, creating a default profile');

        // Try to determine role - check multiple sources
        let userRole = 'STUDENT'; // Default role

        // 1. Check user metadata first
        if (user.user_metadata?.role) {
          userRole = user.user_metadata.role;
        }
        // 2. Check app metadata
        else if (user.app_metadata?.role) {
          userRole = user.app_metadata.role;
        }

        console.log(`Creating profile with role: ${userRole}`);

        // Use upsert instead of insert to handle potential duplicate inserts
        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || '',
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role: userRole,
            },
            {
              onConflict: 'id', // Specify the conflicting column
              ignoreDuplicates: false, // Update if record exists
            }
          )
          .select('*')
          .single();

        if (upsertError) {
          console.error('Error creating/updating student profile:', upsertError.message);
        } else {
          studentData = newProfile;
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error handling student profile:', err);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {studentData?.full_name || user.email}</h1>
        <p className="text-muted-foreground">
          This is your student dashboard. Here you can track your progress, manage your course materials, and upload test results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start space-y-0 gap-3">
            <FileUp className="h-5 w-5 text-primary mt-1" />
            <div>
              <CardTitle>Upload Test Results</CardTitle>
              <CardDescription>Upload your FAA Knowledge Test results for processing</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your test results to track your progress and identify areas for improvement.
            </p>
            <Link 
              href="/dashboard/test-upload" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
            >
              Upload now
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start space-y-0 gap-3">
            <GraduationCap className="h-5 w-5 text-primary mt-1" />
            <div>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your training progress and upcoming lessons</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Monitor your training progress across all your courses and lessons.
            </p>
            <Link 
              href="/dashboard/progress" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
            >
              View progress
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start space-y-0 gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-1" />
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Access your enrolled courses and study materials</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              View all your enrolled courses and access your study materials.
            </p>
            <Link 
              href="/dashboard/courses" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
            >
              View courses
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
