import { NextResponse } from 'next/server';
// Import createClient directly from supabase-js for service role
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Profile, School, UserRole, Part61Or141Type } from '@/lib/supabase/types';

// Helper function to get a Supabase SERVICE ROLE client
// WARNING: THIS CLIENT BYPASSES RLS. DO NOT USE IN CLIENT-FACING CODE.
let supabaseServiceRoleClient: SupabaseClient | null = null;

function getSupabaseServiceRoleClient() {
  if (supabaseServiceRoleClient) {
    return supabaseServiceRoleClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }
  // Note: For scripts or server-side operations where RLS is intentionally bypassed,
  // we use the service_role key. This client has super admin privileges.
  supabaseServiceRoleClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // autoRefreshToken and persistSession are typically false for service roles
      autoRefreshToken: false,
      persistSession: false,
      // detectSessionInUrl is usually not needed for service role client
      detectSessionInUrl: false 
    }
  });
  return supabaseServiceRoleClient;
}

// Define a more specific type for test operation results
type TestOperationResult = {
  status: 'SUCCESS' | 'ERROR' | 'SKIPPED' | 'PENDING';
  data?: any; 
  error?: string;
  message?: string;
  detail?: string;
  userId?: string;
  email?: string;
  count?: number;
};

export async function GET(request: Request) {
  console.log('===== EXECUTING CRUD TEST WITH SERVICE ROLE CLIENT (RLS BYPASSED) =====');
  const supabase = getSupabaseServiceRoleClient();
  const testResults: Record<string, TestOperationResult> = {};
  let testUserProfile: Profile | null = null;
  
  const providedTestUserUID = '74c6ecee-3b68-4dac-bdf0-5f451e210fae'; 
  const targetUserIdForProfile = providedTestUserUID;

  try {
    testResults.clientInitialization = { status: 'SUCCESS', message: 'Service role client initialized. RLS is BYPASSED for these tests.' };

    // --- Profile Tests (using Service Role, RLS bypassed) ---
    const profileEmail = `user_${targetUserIdForProfile.substring(0,8)}@example.com`;
    const profileFullName = `Test User ${targetUserIdForProfile.substring(0,4)} (Service Role Test)`;
    const profileRole: UserRole = 'STUDENT';

    // Clean up existing profile for this UID first, if any
    console.log(`Service Role: Attempting to delete any pre-existing profile for ${targetUserIdForProfile} before insert...`);
    await supabase.from('profiles').delete().eq('id', targetUserIdForProfile);

    console.log(`Service Role: Attempting to create profile for user ${targetUserIdForProfile} with email ${profileEmail}...`);
    const { data: createdProfileData, error: createProfileError } = await supabase
      .from('profiles')
      .insert({ id: targetUserIdForProfile, email: profileEmail, full_name: profileFullName, role: profileRole })
      .select()
      .single();
    
    testUserProfile = createdProfileData; 

    if (createProfileError) {
      console.error(`Service Role: Error creating profile for ${targetUserIdForProfile}:`, createProfileError.message);
      testResults.createProfile = { status: 'ERROR', error: createProfileError.message, detail: `Attempted for user ID: ${targetUserIdForProfile}` };
    } else if (testUserProfile) {
      testResults.createProfile = { status: 'SUCCESS', data: testUserProfile };
      console.log('Service Role: Profile created:', testUserProfile);

      console.log(`Service Role: Attempting to read profile ${testUserProfile.id}...`);
      const { data: fetchedProfile, error: fetchProfileError } = await supabase
        .from('profiles').select('*').eq('id', testUserProfile.id).single();
      if (fetchProfileError) {
        console.error('Service Role: Error fetching profile:', fetchProfileError.message);
        testResults.readProfile = { status: 'ERROR', error: fetchProfileError.message };
      } else {
        testResults.readProfile = { status: 'SUCCESS', data: fetchedProfile };
        console.log('Service Role: Profile fetched:', fetchedProfile);
      }

      const updatedFullName = `Test User ${targetUserIdForProfile.substring(0,4)} Updated (Service Role)`;
      console.log(`Service Role: Attempting to update profile ${testUserProfile.id} to name: ${updatedFullName}...`);
      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from('profiles').update({ full_name: updatedFullName }).eq('id', testUserProfile.id).select().single();
      if (updateProfileError) {
        console.error('Service Role: Error updating profile:', updateProfileError.message);
        testResults.updateProfile = { status: 'ERROR', error: updateProfileError.message };
      } else {
        testResults.updateProfile = { status: 'SUCCESS', data: updatedProfile };
        console.log('Service Role: Profile updated:', updatedProfile);
      }

      // We will not delete the profile at the end of this test so it can be inspected.
      // console.log(`Service Role: Attempting to delete profile ${testUserProfile.id} (cleanup)...`);
      // const { error: deleteProfileError } = await supabase.from('profiles').delete().eq('id', testUserProfile.id);
      // if (deleteProfileError) {
      //   console.error('Service Role: Error deleting profile:', deleteProfileError.message);
      //   testResults.deleteProfile = { status: 'ERROR', error: deleteProfileError.message };
      // } else {
      //   testResults.deleteProfile = { status: 'SUCCESS' };
      //   console.log('Service Role: Profile deleted.');
      // }
      testResults.deleteProfile = { status: 'SKIPPED', message: 'Profile deletion skipped to allow inspection.' };

    } else {
      testResults.createProfile = { status: 'ERROR', message: 'Profile creation did not return data and no error was reported.', error: `Unknown error for user ID: ${targetUserIdForProfile}` };
      console.error('Service Role: Profile creation did not return data and no error was reported (createdProfileData is null).');
    }
    
    // --- School Tests (using Service Role, RLS bypassed) ---
    console.log('Service Role: Attempting to list schools...');
    const { data: schoolsList, error: listSchoolsError } = await supabase.from('schools').select('*').limit(10);
    if (listSchoolsError) {
      console.error('Service Role: Error listing schools:', listSchoolsError.message);
      testResults.listSchools = { status: 'ERROR', error: listSchoolsError.message };
    } else if (schoolsList) {
      testResults.listSchools = { status: 'SUCCESS', count: schoolsList.length, data: schoolsList };
      console.log(`Service Role: Schools listed (${schoolsList.length}):`, schoolsList);
    } else {
      testResults.listSchools = { status: 'ERROR', message: 'School list retrieval did not return data and no error was reported.' };
      console.error('Service Role: School list retrieval did not return data and no error was reported (schoolsList is null).');
    }
    // TODO: Add School CUD tests using service role client
    testResults.schoolCrudTests = { status: 'PENDING', message: 'School CUD tests (service role) not yet fully implemented.' };

  } catch (e: unknown) {
    console.error('General error in CRUD test route (Service Role):', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ status: 'ERROR', message: 'An unexpected error occurred during service role tests.', detail: errorMessage, results: testResults }, { status: 500 });
  }

  console.log('===== CRUD TEST WITH SERVICE ROLE CLIENT FINISHED =====');
  return NextResponse.json({ status: 'COMPLETED_WITH_SERVICE_ROLE', results: testResults });
} 