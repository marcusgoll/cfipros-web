import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded (e.g., using dotenv or framework-specific mechanisms)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL function to execute arbitrary SQL, prerequisite for other operations
const createExecuteSQLFunctionSQL = `
CREATE OR REPLACE FUNCTION public.execute_sql(sql_statement TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

// SQL function to drop all user-defined tables in the public schema
const createDropAllUserTablesFunctionSQL = `
CREATE OR REPLACE FUNCTION public.drop_all_user_tables_in_public_schema()
RETURNS void AS $$
DECLARE
    table_rec RECORD;
BEGIN
    RAISE NOTICE 'Starting to drop user tables in public schema...';
    FOR table_rec IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN (
            'supabase_migrations' // Supabase internal migrations table
            // Add other critical Supabase-managed public tables here if any are discovered
          )
          AND tableowner NOT IN ('supabase_admin', 'postgres') // Exclude tables owned by Supabase system/superuser
    LOOP
        RAISE NOTICE 'Dropping table: public.%', table_rec.tablename;
        EXECUTE 'DROP TABLE public.' || quote_ident(table_rec.tablename) || ' CASCADE';
    END LOOP;
    RAISE NOTICE 'Finished dropping user tables.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const dropUserRoleEnumSQL = 'DROP TYPE IF EXISTS public.user_role_enum CASCADE;';
const dropPart61Or141TypeEnumSQL = 'DROP TYPE IF EXISTS public.part_61_or_141_type_enum CASCADE;';

const createEnumsSQL = `
  -- Create custom ENUM types
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE public.user_role_enum AS ENUM ('STUDENT', 'CFI', 'SCHOOL_ADMIN');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'part_61_or_141_type_enum') THEN
          CREATE TYPE public.part_61_or_141_type_enum AS ENUM ('PART_61', 'PART_141');
      END IF;
  END $$;
`;

const createProfilesTableSQL = `
  -- Create Profiles Table
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role public.user_role_enum NOT NULL,
    part_61_or_141_type public.part_61_or_141_type_enum,
    preferences JSONB
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
  CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

  CREATE OR REPLACE FUNCTION public.handle_profile_update()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
  CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_update();
`;

const createSchoolsTableSQL = `
  -- Create Schools Table
  CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    part_61_or_141_type public.part_61_or_141_type_enum NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    contact_email TEXT,
    phone_number TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_schools_admin_user_id ON public.schools(admin_user_id);
  CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools(name);

  CREATE OR REPLACE FUNCTION public.handle_school_update()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_school_update ON public.schools;
  CREATE TRIGGER on_school_update
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_school_update();
`;

async function createDatabaseSchema() {
  // 1. Ensure execute_sql function exists
  console.log('Ensuring execute_sql function in Supabase...');
  const { error: executeFuncError } = await supabase.rpc('sql', {
    sql: createExecuteSQLFunctionSQL,
  });
  if (executeFuncError) {
    console.warn('Warning during execute_sql function creation/ensure:', executeFuncError.message);
    console.warn(
      'If this script fails, please ensure the execute_sql function is manually created in your Supabase SQL Editor as per script comments.'
    );
  } else {
    console.log('execute_sql function ensured.');
  }

  // 2. Ensure drop_all_user_tables_in_public_schema function exists
  console.log('Ensuring drop_all_user_tables_in_public_schema function...');
  const { error: createDropFuncError } = await supabase.rpc('execute_sql', {
    sql_statement: createDropAllUserTablesFunctionSQL,
  });
  if (createDropFuncError) {
    console.error(
      'FATAL: Error creating drop_all_user_tables_in_public_schema function:',
      createDropFuncError
    );
    console.error(
      'Please check the SQL definition or Supabase logs. Cannot proceed with automated table dropping.'
    );
    return; // Stop if we can't create the dropper function
  }
  console.log('drop_all_user_tables_in_public_schema function ensured.');

  // 3. Call drop_all_user_tables_in_public_schema
  console.log('Calling drop_all_user_tables_in_public_schema()...');
  const { error: dropTablesError } = await supabase.rpc('drop_all_user_tables_in_public_schema');
  if (dropTablesError) {
    console.error('Error calling drop_all_user_tables_in_public_schema():', dropTablesError);
    console.error('Manual cleanup of public schema tables might be required.');
    // We might continue to try to drop enums and create schema, but it might fail or be inconsistent.
  } else {
    console.log('drop_all_user_tables_in_public_schema() executed successfully.');
  }

  // 4. Drop ENUM types (with CASCADE, in case they were in use by dropped tables)
  console.log('Dropping ENUM types if they exist...');
  const { error: dropPart61EnumErr } = await supabase.rpc('execute_sql', {
    sql_statement: dropPart61Or141TypeEnumSQL,
  });
  if (dropPart61EnumErr)
    console.warn(
      'Warning dropping part_61_or_141_type_enum (may not exist):',
      dropPart61EnumErr.message
    );
  else console.log('part_61_or_141_type_enum dropped or did not exist.');

  const { error: dropUserRoleErr } = await supabase.rpc('execute_sql', {
    sql_statement: dropUserRoleEnumSQL,
  });
  if (dropUserRoleErr)
    console.warn('Warning dropping user_role_enum (may not exist):', dropUserRoleErr.message);
  else console.log('user_role_enum dropped or did not exist.');

  // 5. Create ENUM types
  console.log('Creating ENUM types...');
  const { error: enumError } = await supabase.rpc('execute_sql', { sql_statement: createEnumsSQL });
  if (enumError) {
    console.error('Error creating ENUM types:', enumError);
    return; // Stop if enums can't be created
  }
  console.log('ENUM types created successfully.');

  // 6. Create Profiles Table
  console.log('Creating profiles table...');
  const { error: profilesError } = await supabase.rpc('execute_sql', {
    sql_statement: createProfilesTableSQL,
  });
  if (profilesError) {
    console.error('Error creating profiles table:', profilesError);
    return; // Stop if profiles table can't be created
  }
  console.log('Profiles table and trigger created successfully.');

  // 7. Create Schools Table
  console.log('Creating schools table...');
  const { error: schoolsError } = await supabase.rpc('execute_sql', {
    sql_statement: createSchoolsTableSQL,
  });
  if (schoolsError) {
    console.error('Error creating schools table:', schoolsError);
    return; // Stop if schools table can't be created
  }
  console.log('Schools table and trigger created successfully.');

  console.log('Database schema setup process complete.');
}

createDatabaseSchema().then(() => console.log('create-tables.ts script finished.'));

// To run this script:
// 1. Ensure your .env.local (or equivalent) has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
// 2. Manually run the following SQL in your Supabase SQL Editor ONCE to create the execute_sql helper function IF THE SCRIPT FAILS TO CREATE IT:
//    CREATE OR REPLACE FUNCTION public.execute_sql(sql_statement TEXT)
//    RETURNS void AS $$
//    BEGIN
//      EXECUTE sql_statement;
//    END;
//    $$ LANGUAGE plpgsql SECURITY DEFINER;
// 3. Then, you can run this script using ts-node:
//    npx ts-node scripts/create-tables.ts
//    This script will now attempt to drop all user tables in the public schema before creating new ones.
