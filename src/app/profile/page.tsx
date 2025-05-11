import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | CFIPros',
  description: 'Manage your profile - CFIPros',
};

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user profile data
  let profileData = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully
    
    if (error) {
      console.error('Error fetching user profile:', error.message);
    } else {
      profileData = data;
      
      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating a default profile');
        
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
        // 3. Look at the email pattern (optional, based on your business logic)
        else if (user.email?.endsWith('@instructor.cfipros.com')) {
          userRole = 'CFI';
        } else if (user.email?.endsWith('@school.cfipros.com')) {
          userRole = 'SCHOOL_ADMIN';
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
          console.error('Error creating/updating profile:', upsertError.message);
        } else {
          profileData = newProfile;
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error handling profile:', error);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          {/* Profile form will be loaded here */}
          <div id="profile-form-container">
            <ProfileForm user={user} profile={profileData} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          {/* Password update form will be loaded here */}
          <div id="password-form-container">
            <PasswordUpdateForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Client components need to be imported in a special way in Next.js App Router
// These imports are processed by next-dynamic-modules
import ProfileForm from '@/components/features/profile/ProfileForm';
import PasswordUpdateForm from '@/components/features/profile/PasswordUpdateForm'; 