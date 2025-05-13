-- Initial database schema migration script
-- This script captures the existing schema design for versioning purposes
-- Ref: docs/data-models.md

-- Enumerated Types
CREATE TYPE user_role AS ENUM ('STUDENT', 'CFI', 'SCHOOL_ADMIN');
CREATE TYPE part_61_or_141_type AS ENUM ('PART_61', 'PART_141');
CREATE TYPE processing_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'COMPLETED_WITH_ERRORS');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING');
CREATE TYPE link_established_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE invitation_target_entity_type AS ENUM ('STUDENT_CFI_LINK', 'CFI_SCHOOL_LINK', 'STUDENT_SCHOOL_LINK', 'NEW_USER_REGISTRATION');

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  part_61_or_141_type part_61_or_141_type NULL,
  preferences JSONB NULL
);

-- Add indexes to profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create trigger for auto-updating updated_at column
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

-- Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  part_61_or_141_type part_61_or_141_type NOT NULL,
  description TEXT NULL,
  website_url TEXT NULL,
  logo_url TEXT NULL,
  contact_email TEXT NULL,
  phone_number TEXT NULL,
  address_line1 TEXT NULL,
  address_line2 TEXT NULL,
  city TEXT NULL,
  state_province TEXT NULL,
  postal_code TEXT NULL,
  country TEXT NULL
);

-- Add indexes to schools
CREATE INDEX IF NOT EXISTS idx_schools_admin_user_id ON public.schools(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools(name);

-- Create trigger for auto-updating updated_at column
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

-- ACS Codes Table
CREATE TABLE IF NOT EXISTS public.acs_codes (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  description TEXT NOT NULL,
  area TEXT NULL,
  task TEXT NULL,
  sub_task TEXT NULL,
  knowledge_area TEXT NULL,
  exam_type TEXT NOT NULL
);

-- Knowledge Test Reports Table
CREATE TABLE IF NOT EXISTS public.knowledge_test_reports (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_date TIMESTAMPTZ NULL,
  expiration_date TIMESTAMPTZ NULL,
  score_percentage NUMERIC NULL,
  source_ftn TEXT NULL,
  source_exam_id TEXT NULL,
  extracted_data_json JSONB NULL,
  processing_status processing_status NOT NULL DEFAULT 'PENDING',
  error_message TEXT NULL
);

-- Add indexes to knowledge_test_reports
CREATE INDEX IF NOT EXISTS idx_knowledge_test_reports_user_id ON public.knowledge_test_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_test_reports_test_type ON public.knowledge_test_reports(test_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_test_reports_status ON public.knowledge_test_reports(processing_status);

-- Processed ACS Items Table
CREATE TABLE IF NOT EXISTS public.processed_acs_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  report_id UUID NOT NULL REFERENCES public.knowledge_test_reports(id) ON DELETE CASCADE,
  acs_code_id TEXT NOT NULL REFERENCES public.acs_codes(id) ON DELETE RESTRICT,
  is_missed BOOLEAN NOT NULL,
  raw_extracted_code TEXT NULL
);

-- Add indexes to processed_acs_items
CREATE INDEX IF NOT EXISTS idx_processed_acs_items_report_id ON public.processed_acs_items(report_id);
CREATE INDEX IF NOT EXISTS idx_processed_acs_items_acs_code_id ON public.processed_acs_items(acs_code_id);
CREATE INDEX IF NOT EXISTS idx_processed_acs_items_is_missed ON public.processed_acs_items(is_missed);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NULL REFERENCES public.schools(id) ON DELETE SET NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add indexes to subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_school_id ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  inviter_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT NULL,
  role_to_invite user_role NULL,
  target_entity_type invitation_target_entity_type NOT NULL,
  target_entity_id UUID NULL,
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ NULL
);

-- Add indexes to invitations
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_user_id ON public.invitations(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON public.invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Student-CFI Links Table
CREATE TABLE IF NOT EXISTS public.student_cfi_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cfi_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL
);

-- Add indexes to student_cfi_links
CREATE INDEX IF NOT EXISTS idx_student_cfi_links_student_id ON public.student_cfi_links(student_user_id);
CREATE INDEX IF NOT EXISTS idx_student_cfi_links_cfi_id ON public.student_cfi_links(cfi_user_id);
CREATE INDEX IF NOT EXISTS idx_student_cfi_links_status ON public.student_cfi_links(status);

-- CFI-School Links Table
CREATE TABLE IF NOT EXISTS public.cfi_school_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  cfi_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL
);

-- Add indexes to cfi_school_links
CREATE INDEX IF NOT EXISTS idx_cfi_school_links_cfi_id ON public.cfi_school_links(cfi_user_id);
CREATE INDEX IF NOT EXISTS idx_cfi_school_links_school_id ON public.cfi_school_links(school_id);
CREATE INDEX IF NOT EXISTS idx_cfi_school_links_status ON public.cfi_school_links(status);

-- Student-School Links Table
CREATE TABLE IF NOT EXISTS public.student_school_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL
);

-- Add indexes to student_school_links
CREATE INDEX IF NOT EXISTS idx_student_school_links_student_id ON public.student_school_links(student_user_id);
CREATE INDEX IF NOT EXISTS idx_student_school_links_school_id ON public.student_school_links(school_id);
CREATE INDEX IF NOT EXISTS idx_student_school_links_status ON public.student_school_links(status);

-- Report Summaries Table
CREATE TABLE IF NOT EXISTS public.report_summaries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Add indexes to report_summaries
CREATE INDEX IF NOT EXISTS idx_report_summaries_user_id ON public.report_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_report_summaries_student_user_id ON public.report_summaries(student_user_id);

-- Report Summary Items Table
CREATE TABLE IF NOT EXISTS public.report_summary_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  report_summary_id UUID NOT NULL REFERENCES public.report_summaries(id) ON DELETE CASCADE,
  knowledge_test_report_id UUID NOT NULL REFERENCES public.knowledge_test_reports(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL
);

-- Add indexes to report_summary_items
CREATE INDEX IF NOT EXISTS idx_report_summary_items_report_summary_id ON public.report_summary_items(report_summary_id);
CREATE INDEX IF NOT EXISTS idx_report_summary_items_knowledge_test_report_id ON public.report_summary_items(knowledge_test_report_id);
CREATE INDEX IF NOT EXISTS idx_report_summary_items_display_order ON public.report_summary_items(display_order);

-- MCP API Keys Table
CREATE TABLE IF NOT EXISTS public.mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  client_name TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NULL,
  permissions JSONB NULL,
  rate_limit_requests INTEGER NULL,
  rate_limit_interval_seconds INTEGER NULL
);

-- Add indexes to mcp_api_keys
CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_client_name ON public.mcp_api_keys(client_name);
CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_api_key_prefix ON public.mcp_api_keys(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_is_active ON public.mcp_api_keys(is_active);

-- Set up Row Level Security Policies
-- This part would typically be in a separate migration but included here for completeness

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: User can manage their own profile
DROP POLICY IF EXISTS "User can manage their own profile" ON public.profiles;
CREATE POLICY "User can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Enable RLS on schools table
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view schools
DROP POLICY IF EXISTS "Authenticated users can view schools" ON public.schools;
CREATE POLICY "Authenticated users can view schools"
ON public.schools
FOR SELECT
TO authenticated
USING (true);

-- Policy: School admins can manage their own school
DROP POLICY IF EXISTS "School admins can manage their own school" ON public.schools;
CREATE POLICY "School admins can manage their own school"
ON public.schools
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'SCHOOL_ADMIN' AND profiles.id = schools.admin_user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'SCHOOL_ADMIN' AND profiles.id = schools.admin_user_id
  )
);

-- Enable RLS on knowledge_test_reports table
ALTER TABLE public.knowledge_test_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and manage their own knowledge test reports
DROP POLICY IF EXISTS "Users can view and manage their own knowledge test reports" ON public.knowledge_test_reports;
CREATE POLICY "Users can view and manage their own knowledge test reports"
ON public.knowledge_test_reports
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: CFIs can view knowledge test reports of their students
DROP POLICY IF EXISTS "CFIs can view knowledge test reports of their students" ON public.knowledge_test_reports;
CREATE POLICY "CFIs can view knowledge test reports of their students"
ON public.knowledge_test_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.student_cfi_links scl ON p.id = scl.cfi_user_id
    WHERE p.id = auth.uid() AND p.role = 'CFI' AND scl.student_user_id = knowledge_test_reports.user_id AND scl.status = 'ACTIVE'
  )
);

-- Add RLS policies for other tables as needed
-- ...

-- Remember: This is an initial migration script that would be used with Supabase CLI
-- Additional migrations would be created for future schema changes
