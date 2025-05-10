---

# CFIPros Data Models

This document describes the core data entities, their structures, and the corresponding database schema for the CFIPros application, to be implemented in Supabase (PostgreSQL).

## 1. Core Application Entities (Conceptual Domain Models)

```typescript
// src/lib/types/user.ts
export type UserRole = 'STUDENT' | 'CFI' | 'SCHOOL_ADMIN';
export type Part61Or141Type = 'PART_61' | 'PART_141';

export interface UserProfile {
  id: string; // UUID, references auth.users.id
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  full_name: string | null;
  email: string;
  role: UserRole;
  part_61_or_141_type: Part61Or141Type | null;
  preferences: Record<string, any> | null; // For user-specific settings
}

export interface School {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  name: string;
  admin_user_id: string; // UUID, FK to UserProfile.id
  part_61_or_141_type: Part61Or141Type;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  contact_email: string | null;
  phone_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
}

// src/lib/types/acs.ts
export interface AcsCode {
  id: string; // e.g., "CA.I.A.K1"
  created_at?: string;
  updated_at?: string;
  description: string;
  area: string | null;
  task: string | null;
  sub_task: string | null;
  knowledge_area: string | null;
  exam_type: string;
}

// src/lib/types/knowledge-test.ts
export type ProcessingStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPLETED_WITH_ERRORS';

export interface KnowledgeTestReport {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  user_id: string; // UUID, FK to UserProfile.id (Student)
  test_type: string;
  test_date: string | null;
  expiration_date: string | null;
  score_percentage: number | null;
  source_ftn: string | null;
  source_exam_id: string | null;
  extracted_data_json: Record<string, any> | null;
  processing_status: ProcessingStatus;
  error_message: string | null;
  processed_acs_items?: ProcessedAcsItem[];
}

export interface ProcessedAcsItem {
  id: string; // UUID
  created_at: string;
  report_id: string; // UUID, FK to KnowledgeTestReport.id
  acs_code_id: string; // FK to AcsCode.id
  is_missed: boolean;
  raw_extracted_code: string | null;
  acs_code?: AcsCode;
}

// src/lib/types/subscription.ts
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'INCOMPLETE'
  | 'INCOMPLETE_EXPIRED'
  | 'TRIALING';

export interface Subscription {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes (if user profile is soft-deleted)
  user_id: string; // UUID, FK to UserProfile.id
  school_id: string | null; // UUID, FK to School.id
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus; // Reflects Stripe's status
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// src/lib/types/invitation.ts (New)
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type InvitationTargetEntityType = 'STUDENT_CFI_LINK' | 'CFI_SCHOOL_LINK' | 'STUDENT_SCHOOL_LINK' | 'NEW_USER_REGISTRATION'; // Latter for general platform invite

export interface Invitation {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  inviter_user_id: string; // UUID, FK to UserProfile.id (who sent the invite)
  invitee_email: string; // Email of the person being invited
  invitee_name: string | null; // Optional name provided by inviter
  role_to_invite: UserRole | null; // e.g., if inviting a new user as a specific role
  target_entity_type: InvitationTargetEntityType; // What this invitation is for
  target_entity_id: string | null; // e.g., school_id if inviting CFI to school, or inviter_user_id if student inviting CFI
  token: string; // Secure, unique token for the invitation link
  status: InvitationStatus;
  expires_at: string; // ISO 8601 datetime
  accepted_at: string | null; // When the invitation was accepted
}


// src/lib/types/links.ts
export type LinkEstablishedStatus = 'ACTIVE' | 'INACTIVE'; // Simplified status

export interface StudentCfiLink {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  student_user_id: string; // UUID, FK to UserProfile.id
  cfi_user_id: string; // UUID, FK to UserProfile.id
  status: LinkEstablishedStatus; // ACTIVE or INACTIVE (e.g., unlinked by user)
  linked_at: string; // ISO 8601 datetime, when it became active
  unlinked_at: string | null; // ISO 8601 datetime, when it became inactive
}

export interface CfiSchoolLink {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  cfi_user_id: string; // UUID, FK to UserProfile.id
  school_id: string; // UUID, FK to School.id
  status: LinkEstablishedStatus;
  linked_at: string;
  unlinked_at: string | null;
}

export interface StudentSchoolLink {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft deletes
  student_user_id: string; // UUID, FK to UserProfile.id
  school_id: string; // UUID, FK to School.id
  status: LinkEstablishedStatus;
  linked_at: string;
  unlinked_at: string | null;
}

// In a new file like src/lib/types/report-summary.ts
export interface ReportSummary {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string; // Creator (Student, CFI, or School Admin)
  student_user_id: string; // The student whose reports are being summarized
  name: string; // User-defined name for this summary
}

export interface ReportSummaryItem {
  id: string; // UUID
  report_summary_id: string; // FK to ReportSummary.id
  knowledge_test_report_id: string; // FK to KnowledgeTestReport.id
  display_order: number; // For ordering reports within the summary
}

// src/lib/types/mcp.ts (or a general api_keys.ts)
export interface McpApiKey {
  id: string; // UUID
  client_name: string; // Human-readable name for the external agent/client
  api_key_prefix: string; // e.g., first 8 chars of the key for identification (NOT for auth)
  api_key_hash: string; // Bcrypt hash of the actual API key
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null; // ISO 8601 datetime
  permissions: Record<string, any> | null; // For future fine-grained access control
  rate_limit_requests: number | null; // Requests per interval
  rate_limit_interval_seconds: number | null; // e.g., 60 for per minute
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // For soft delete
}
```

## 2. Database Schema (Supabase/PostgreSQL)

```sql
-- Enumerated Types
CREATE TYPE user_role AS ENUM ('STUDENT', 'CFI', 'SCHOOL_ADMIN');
CREATE TYPE part_61_or_141_type AS ENUM ('PART_61', 'PART_141');
CREATE TYPE processing_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'COMPLETED_WITH_ERRORS');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING');
CREATE TYPE link_established_status AS ENUM ('ACTIVE', 'INACTIVE'); -- Revised
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'); -- New
CREATE TYPE invitation_target_entity_type AS ENUM ('STUDENT_CFI_LINK', 'CFI_SCHOOL_LINK', 'STUDENT_SCHOOL_LINK', 'NEW_USER_REGISTRATION'); -- New


-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
  full_name TEXT,
  role user_role NOT NULL,
  part_61_or_141_type part_61_or_141_type NULL,
  preferences JSONB NULL -- Added
);

-- Schools Table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
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
  country TEXT NULL,
  CONSTRAINT unique_school_admin_for_creation UNIQUE (admin_user_id)
);

-- ACS Codes Master Table (schema unchanged from previous version)
CREATE TABLE public.acs_codes (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  description TEXT NOT NULL,
  area TEXT,
  task TEXT,
  sub_task TEXT,
  knowledge_area TEXT,
  exam_type TEXT NOT NULL
);

-- Knowledge Test Reports Table
CREATE TABLE public.knowledge_test_reports (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_date DATE NULL,
  expiration_date DATE NULL,
  score_percentage INT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
  source_ftn TEXT NULL,
  source_exam_id TEXT NULL,
  extracted_data_json JSONB NULL,
  processing_status processing_status NOT NULL DEFAULT 'PENDING',
  error_message TEXT NULL
);

-- Processed ACS Items from Knowledge Tests (schema unchanged)
CREATE TABLE public.knowledge_test_acs_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  report_id UUID NOT NULL REFERENCES public.knowledge_test_reports(id) ON DELETE CASCADE,
  acs_code_id TEXT NOT NULL REFERENCES public.acs_codes(id) ON DELETE RESTRICT,
  is_missed BOOLEAN NOT NULL DEFAULT TRUE,
  raw_extracted_code TEXT NULL,
  UNIQUE (report_id, acs_code_id)
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added (e.g., if linked profile is soft-deleted)
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  school_id UUID NULL REFERENCES public.schools(id) ON DELETE SET NULL, -- SET NULL if school is deleted
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT school_subscription_link_if_school_admin CHECK (
    (school_id IS NULL) OR
    (school_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p JOIN public.schools s ON p.id = s.admin_user_id WHERE p.id = subscriptions.user_id AND p.role = 'SCHOOL_ADMIN' AND s.id = subscriptions.school_id))
  )
);

-- Invitations Table (NEW)
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  inviter_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT NULL,
  role_to_invite user_role NULL, -- Role for a new user being invited to the platform
  target_entity_type invitation_target_entity_type NOT NULL,
  target_entity_id UUID NULL, -- e.g., school_id if inviting a CFI to that school, or inviter_user_id if a student is inviting a CFI
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ NULL,
  INDEX idx_invitations_token (token),
  INDEX idx_invitations_invitee_email (invitee_email)
);
-- RLS: Inviter can see/cancel their pending invites. System handles token validation.

-- Student-CFI Links Table (status simplified)
CREATE TABLE public.student_cfi_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cfi_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE', -- Default to ACTIVE once created via invitation
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL,
  UNIQUE (student_user_id, cfi_user_id),
  CONSTRAINT check_student_role_sc_links CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = student_user_id AND role = 'STUDENT')),
  CONSTRAINT check_cfi_role_sc_links CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = cfi_user_id AND role = 'CFI'))
);

-- CFI-School Links Table (status simplified)
CREATE TABLE public.cfi_school_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
  cfi_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL,
  UNIQUE (cfi_user_id, school_id),
  CONSTRAINT check_cfi_role_cs_links CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = cfi_user_id AND role = 'CFI'))
);

-- Student-School Links Table (status simplified)
CREATE TABLE public.student_school_links (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL, -- Added
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status link_established_status NOT NULL DEFAULT 'ACTIVE',
  linked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  unlinked_at TIMESTAMPTZ NULL,
  UNIQUE (student_user_id, school_id),
  CONSTRAINT check_student_role_ss_links CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = student_user_id AND role = 'STUDENT'))
);

-- Report Summaries Table
CREATE TABLE public.report_summaries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Creator
  student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Subject Student
  name TEXT NOT NULL,
  CONSTRAINT check_student_role_for_summary_subject CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = student_user_id AND role = 'STUDENT'))
);
-- RLS: Creator can CRUD. CFI/School Admin with access to student_user_id can read.

-- Report Summary Items Table (Junction)
CREATE TABLE public.report_summary_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  report_summary_id UUID NOT NULL REFERENCES public.report_summaries(id) ON DELETE CASCADE,
  knowledge_test_report_id UUID NOT NULL REFERENCES public.knowledge_test_reports(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  UNIQUE (report_summary_id, knowledge_test_report_id)
);
-- RLS: Access via parent report_summaries.

-- MCP API Keys Table (NEW)
CREATE TABLE public.mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ NULL,
  client_name TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL UNIQUE, -- For admin identification of keys
  api_key_hash TEXT NOT NULL UNIQUE,   -- Store a bcrypt hash of the API key
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count BIGINT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NULL,
  permissions JSONB NULL, -- For future granular permissions
  rate_limit_requests INT NULL,
  rate_limit_interval_seconds INT NULL,
  CONSTRAINT check_rate_limit_logic CHECK (
    (rate_limit_requests IS NULL AND rate_limit_interval_seconds IS NULL) OR
    (rate_limit_requests IS NOT NULL AND rate_limit_interval_seconds IS NOT NULL AND rate_limit_requests > 0 AND rate_limit_interval_seconds > 0)
  )
);
-- RLS: Only accessible by a highly privileged role or system internal processes. Not directly by users.
-- INDEX idx_mcp_api_keys_prefix (api_key_prefix); -- If lookups by prefix are needed by admins

```

## 3. Relationships

* (Most relationships remain as previously defined)
* **Invitations to Profiles:** Many-to-One (Many invitations can be sent by one `inviter_user_id`).
* The link tables (`student_cfi_links`, `cfi_school_links`, `student_school_links`) now represent confirmed relationships. The process of establishing these links (pending states, acceptance) will be managed via the `invitations` table.

## 4. Data Seeding

* `acs_codes` table: To be populated by a script (`scripts/seed-acs-codes.ts`) from `src/lib/acs-codes/*.ts`.

## 5. Notes on Row Level Security (RLS)

RLS policies will be crucial and will now also need to account for `deleted_at IS NULL` in most queries:
* Users can only access/modify their own non-deleted `profiles`.
* School Admins can manage their own non-deleted `schools` record.
* Students can CRUD their own non-deleted `knowledge_test_reports`.
* Access to linked entities (reports, student profiles, etc.) will depend on `ACTIVE` status in the respective non-deleted link tables.
* (Other RLS notes from previous version still apply, adapted for soft deletes).

## Change Log

| Change        | Date       | Version | Description                  | Author         |
| :------------ | :--------- | :------ | :--------------------------- | :------------- |
| Initial draft | 2025-05-09 | 0.1     | First draft of data models and DB schema | Architect Gem  |
| Revisions 1   | 2025-05-09 | 0.2     | Added `expiration_date` to reports, expanded `schools` table, noted analytics requirements. | Architect Gem |
| Revisions 2   | 2025-05-09 | 0.3     | Added `student_school_links` table and updated RLS notes for direct student-school association. | Architect Gem |
| Revisions 3   | 2025-05-09 | 0.4     | Added soft deletes, user preferences, and invitations table. Simplified link table statuses. | Architect Gem |
| Revisions 4   | 2025-05-09 | 0.5     | Added Report Summaries Tables | Architect Gem |
| Revisions 5   | 2025-05-09 | 0.6     | Added MCP API authentication and usage tables | Architect Gem |

---
