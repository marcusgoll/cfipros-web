import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import type { Metadata } from 'next';
import Link from 'next/link';
import LogoutButton from '@/components/features/auth/LogoutButton';

export const metadata: Metadata = {
  title: 'Dashboard | CFIPros',
  description: 'Student Dashboard - CFIPros',
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
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
          .upsert({ 
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: userRole
          }, { 
            onConflict: 'id', // Specify the conflicting column
            ignoreDuplicates: false // Update if record exists
          })
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Link 
            href="/profile" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Profile Settings
          </Link>
          <LogoutButton />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {studentData?.full_name || user.email}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is your student dashboard. Here you can track your progress, manage your courses, and more.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track your training progress and upcoming lessons here.
          </p>
          {/* Progress tracking components would go here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View your scheduled classes and training sessions.
          </p>
          {/* Calendar or list of upcoming classes would go here */}
        </div>
      </div>
    </div>
  );
}
