import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Admin Dashboard | CFIPros',
  description: 'School Administrator Dashboard - CFIPros',
};

export default async function SchoolAdminDashboardPage() {
  const supabase = createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user role
  const { role } = await getUserRole(user.id);
  
  // If user is not a SCHOOL_ADMIN, redirect them to the appropriate dashboard
  if (role !== 'SCHOOL_ADMIN') {
    redirect('/dashboard');
  }
  
  // Fetch school-specific data
  let schoolData = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching school admin profile:', error.message);
    } else {
      schoolData = data;
      
      // If no profile exists, create one
      if (!schoolData) {
        console.log('No school admin profile found, creating a default profile');
        
        // Use upsert instead of insert to handle potential duplicate inserts
        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'SCHOOL_ADMIN',
            school_name: user.user_metadata?.school_name || 'Your Flight School',
            part_61_or_141_type: user.user_metadata?.part_61_or_141_type || 'part61_flight_school'
          }, { 
            onConflict: 'id', // Specify the conflicting column
            ignoreDuplicates: false // Update if record exists
          })
          .select('*')
          .single();
          
        if (upsertError) {
          console.error('Error creating/updating school admin profile:', upsertError.message);
        } else {
          schoolData = newProfile;
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error handling school admin profile:', err);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">School Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {schoolData?.full_name || user.email}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is your School Administrator dashboard. Here you can manage your school, instructors, and students.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your School</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {schoolData?.school_name || 'Your School'}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {schoolData?.part_61_or_141_type || 'Part 61/141 information not available'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructor Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your flight instructors and their assignments.
          </p>
          {/* Instructor management components would go here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Student Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your students and their training programs.
          </p>
          {/* Student management components would go here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Training Resources</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your school&apos;s training resources and materials.
          </p>
          {/* Resource management components would go here */}
        </div>
      </div>
    </div>
  );
} 