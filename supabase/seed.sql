-- Seed data for local development
-- This will be used when running 'supabase db reset' or with 'supabase db push --include-seed'

-- Example: Insert a test admin user (assumes the auth.users table has a corresponding entry)
INSERT INTO public.profiles (id, full_name, email, role, part_61_or_141_type)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cfipros.com', 'SCHOOL_ADMIN', 'PART_141'),
  ('00000000-0000-0000-0000-000000000002', 'CFI User', 'cfi@cfipros.com', 'CFI', 'PART_61'),
  ('00000000-0000-0000-0000-000000000003', 'Student User', 'student@cfipros.com', 'STUDENT', 'PART_61')
ON CONFLICT (id) DO NOTHING;

-- Example: Insert a test school
INSERT INTO public.schools (id, name, admin_user_id, part_61_or_141_type, description, contact_email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'CFI Pros Flight School', '00000000-0000-0000-0000-000000000001', 'PART_141', 'Test flight school for development', 'admin@cfipros.com')
ON CONFLICT (id) DO NOTHING;

-- Example: Insert sample ACS codes (limited selection for example)
INSERT INTO public.acs_codes (id, description, area, task, sub_task, knowledge_area, exam_type)
VALUES
  ('CA.I.A.K1', 'Certification requirements, recent flight experience, and recordkeeping', 'CA', 'I', 'A', 'K1', 'Private'),
  ('CA.I.A.K2', 'Privileges and limitations', 'CA', 'I', 'A', 'K2', 'Private'),
  ('CA.I.A.K3', 'Medical certificates: class, duration, and basic requirements', 'CA', 'I', 'A', 'K3', 'Private')
ON CONFLICT (id) DO NOTHING;

-- Example: Create sample link between CFI and Student
INSERT INTO public.student_cfi_links (student_user_id, cfi_user_id, status, linked_at)
VALUES 
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING;

-- Example: Link student to school
INSERT INTO public.student_school_links (student_user_id, school_id, status, linked_at)
VALUES 
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING;

-- Example: Link CFI to school
INSERT INTO public.cfi_school_links (cfi_user_id, school_id, status, linked_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING; 