import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CFI Dashboard | CFIPros',
  description: 'Certified Flight Instructor Dashboard - CFIPros',
};

export default async function CFIDashboardPage() {
  const supabase = createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user role
  const { role } = await getUserRole(user.id);
  
  // If user is not a CFI, redirect them to the appropriate dashboard
  if (role !== 'CFI') {
    redirect('/dashboard');
  }
  
  // Fetch CFI-specific data
  let cfiData = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching CFI profile:', error.message);
    } else {
      cfiData = data;
      
      // If no profile exists, create one
      if (!cfiData) {
        console.log('No CFI profile found, creating a default profile');
        
        // Use upsert instead of insert to handle potential duplicate inserts
        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'CFI'
          }, { 
            onConflict: 'id', // Specify the conflicting column
            ignoreDuplicates: false // Update if record exists
          })
          .select('*')
          .single();
          
        if (upsertError) {
          console.error('Error creating/updating CFI profile:', upsertError.message);
        } else {
          cfiData = newProfile;
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error handling CFI profile:', err);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">CFI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {cfiData?.full_name || user.email}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is your CFI dashboard. Here you can manage your students, schedule, and teaching resources.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Students</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your current students and their progress.
          </p>
          {/* Student list components would go here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Teaching Schedule</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your teaching schedule and appointments.
          </p>
          {/* Calendar or schedule components would go here */}
        </div>
      </div>
    </div>
  );
} 