import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// It's assumed that the execute_sql function from create-tables.ts is available.
// Or that it has been manually created in Supabase SQL Editor:
// CREATE OR REPLACE FUNCTION public.execute_sql(sql_statement TEXT)
// RETURNS void AS $$
// BEGIN
//   EXECUTE sql_statement;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;

const setupProfilesRLSSQL = `
  -- Enable RLS on profiles table
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist to prevent errors during re-run
  DROP POLICY IF EXISTS "User can manage their own profile" ON public.profiles;

  -- Policy: User can manage their own profile
  CREATE POLICY "User can manage their own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
`;

const setupSchoolsRLSSQL = `
  -- Enable RLS on schools table
  ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can view schools" ON public.schools;
  DROP POLICY IF EXISTS "School admins can manage their own school" ON public.schools;

  -- Policy: Authenticated users can view schools
  CREATE POLICY "Authenticated users can view schools"
  ON public.schools
  FOR SELECT
  TO authenticated
  USING (true);

  -- Policy: School admins can manage their own school
  -- For INSERT: The new school's admin_user_id must be the current user, and they must be a SCHOOL_ADMIN.
  -- For UPDATE/DELETE: The existing school's admin_user_id must be the current user, and they must be a SCHOOL_ADMIN.
  CREATE POLICY "School admins can manage their own school"
  ON public.schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'SCHOOL_ADMIN'::public.user_role_enum AND profiles.id = schools.admin_user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'SCHOOL_ADMIN'::public.user_role_enum AND profiles.id = schools.admin_user_id
    )
  );
`;

async function setupRLSPolicies() {
  console.log('Setting up RLS for profiles table...');
  const { error: profilesRlsError } = await supabase.rpc('execute_sql', { sql_statement: setupProfilesRLSSQL });
  if (profilesRlsError) {
    console.error('Error setting up RLS for profiles:', profilesRlsError);
    return;
  }
  console.log('RLS for profiles table set up successfully.');

  console.log('Setting up RLS for schools table...');
  const { error: schoolsRlsError } = await supabase.rpc('execute_sql', { sql_statement: setupSchoolsRLSSQL });
  if (schoolsRlsError) {
    console.error('Error setting up RLS for schools:', schoolsRlsError);
    return;
  }
  console.log('RLS for schools table set up successfully.');
}

setupRLSPolicies().then(() => console.log('RLS setup script finished.'));

// To run this script:
// 1. Ensure create-tables.ts has been run successfully.
// 2. Ensure your .env.local (or equivalent) has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
// 3. Ensure the execute_sql function is present in your Supabase (created by create-tables.ts or manually).
// 4. Then, you can run this script using ts-node:
//    npx ts-node scripts/setup-rls.ts 