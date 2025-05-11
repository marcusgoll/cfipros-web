import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import type { Metadata } from 'next';

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
  const { data: studentData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching student profile:', error.message);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
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
