---

# CFIPros Database Migration Strategy

This document outlines the recommended approach for managing database schema migrations in the CFIPros project. Following a structured migration strategy ensures consistency across all environments, enables collaborative development, and provides a history of database changes.

## Table of Contents

1. [Overview](#1-overview)
2. [Migration Tools](#2-migration-tools)
3. [Directory Structure](#3-directory-structure)
4. [Migration Naming Convention](#4-migration-naming-convention)
5. [Migration Workflow](#5-migration-workflow)
   - [Local Development](#local-development)
   - [Staging Environment](#staging-environment)
   - [Production Environment](#production-environment)
6. [Migration Best Practices](#6-migration-best-practices)
7. [Rollback Strategy](#7-rollback-strategy)
8. [Troubleshooting](#8-troubleshooting)
9. [Example Migrations](#9-example-migrations)

## 1. Overview

The CFIPros project uses Supabase (PostgreSQL) as its database. To manage schema changes in a controlled, versioned manner, we use the Supabase CLI for migrations. This approach:

- Keeps a historical record of all database changes
- Ensures consistency across environments (local, staging, production)
- Enables team collaboration with clear change tracking
- Facilitates automated deployments and CI/CD integration

## 2. Migration Tools

The primary tools for managing migrations are:

- **Supabase CLI**: For creating, applying, and managing migrations
- **Git**: For version control of migration files
- **CI/CD Pipeline**: For automated migration application in staging/production environments

### Supabase CLI Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

## 3. Directory Structure

Migrations are stored in the project repository following this structure:

```
cfipros/
├── supabase/
│   ├── migrations/
│   │   ├── 20250510000000_initial_schema.sql
│   │   ├── 20250510000001_add_user_preferences.sql
│   │   └── ...
│   ├── seed.sql                    # Data seed file for development
│   └── config.toml                 # Supabase config file
```

## 4. Migration Naming Convention

Migration files follow this naming convention:

```
<timestamp>_<descriptive_name>.sql
```

Where:
- `<timestamp>`: Format `YYYYMMDDHHMMSS` (e.g., `20250510120000` for May 10, 2025, 12:00:00)
- `<descriptive_name>`: Brief, descriptive name using snake_case (e.g., `create_users_table`, `add_email_verification`)

The Supabase CLI automatically generates timestamps when creating new migrations.

## 5. Migration Workflow

### Local Development

1. **Start Supabase locally** (optional, for local testing):
   ```bash
   supabase start
   ```

2. **Create a new migration**:
   ```bash
   supabase migration new add_feature_x
   ```
   This creates a new timestamped migration file in `supabase/migrations/`.

3. **Edit the migration file** with your SQL changes.

4. **Apply the migration locally**:
   ```bash
   supabase migration up
   ```

5. **Test your changes** in the local environment.

6. **Commit the migration file** to the repository.

### Using Schema Diffing

For complex changes made through the Supabase UI:

1. Make schema changes in the Supabase UI of your development project.
2. Generate a migration from the differences:
   ```bash
   supabase db diff -f descriptive_name
   ```
3. Review the generated migration file.
4. Test, commit, and apply as with manual migrations.

### Staging Environment

1. **Link to your staging project**:
   ```bash
   supabase link --project-ref your-staging-project-id
   ```

2. **Deploy migrations to staging**:
   ```bash
   supabase db push
   ```

3. **Verify changes** in the staging environment.

### Production Environment

Production migrations should NEVER be applied manually. Instead:

1. **Integrate with CI/CD pipeline**:
   - Ensure all migrations have been tested in staging
   - Set up a GitHub Action or similar CI/CD workflow that:
     - Links to the production project
     - Applies migrations only after approval

2. **Example GitHub Action for Production Migration**:
   ```yaml
   # Simplified example
   name: Deploy Database Migrations
   on:
     workflow_dispatch:
       inputs:
         environment:
           description: 'Environment to deploy to'
           required: true
           default: 'staging'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       if: github.event.inputs.environment == 'production'
       environment: production  # Requires approval
       steps:
         - uses: actions/checkout@v4
         - name: Install Supabase CLI
           run: npm install -g supabase
         - name: Login to Supabase
           run: supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
         - name: Link to Project
           run: supabase link --project-ref ${{ secrets.PRODUCTION_PROJECT_ID }}
         - name: Push Migrations
           run: supabase db push
   ```

## 6. Migration Best Practices

1. **Keep migrations focused and atomic**:
   - Each migration should do one logical change
   - Avoid mixing unrelated schema changes in a single migration

2. **Make migrations idempotent when possible**:
   - Use `IF NOT EXISTS` clauses for creating tables
   - Use `IF EXISTS` clauses for dropping tables
   - Check if columns exist before adding or removing them

3. **Include comments**:
   - Begin each migration with a comment explaining what it does and why
   - Note any dependencies or assumptions

4. **Handle data migrations carefully**:
   - When changing column types or structures, include data transformation steps
   - Consider splitting complex data migrations into multiple steps

5. **Always test migrations**:
   - Test each migration in development and staging before production
   - Verify both the forward migration and rollback process

6. **Avoid destructive changes in production**:
   - Prefer adding new structures over modifying existing ones
   - Add columns as nullable first, then fill data, then add constraints

7. **Use transactions**:
   - Wrap complex migrations in transactions to prevent partial application
   - Example:
     ```sql
     BEGIN;
     -- migration steps here
     COMMIT;
     ```

## 7. Rollback Strategy

While Supabase CLI doesn't directly support `down` migrations, we can implement rollbacks through these approaches:

1. **Create explicit rollback migrations**:
   - Create a new migration that reverses the changes of a problematic migration
   - Clearly name it as a rollback (e.g., `20250510130000_rollback_feature_x.sql`)

2. **Database backups**:
   - For production, ensure point-in-time recovery is enabled
   - Document how to restore to a specific point before a migration

3. **Implement reversible changes where possible**:
   - Add columns with `DROP` statements in rollback comments
   - Create tables with corresponding `DROP TABLE` comments for rollback

Example rollback comment format:
```sql
-- Migration: Create new user_settings table
-- Rollback: DROP TABLE IF EXISTS public.user_settings;

CREATE TABLE IF NOT EXISTS public.user_settings (
  -- table definition
);
```

## 8. Troubleshooting

Common issues and solutions:

1. **Migration Failed**:
   - Check the error message for specific SQL issues
   - Verify that the migration doesn't depend on schema changes that don't exist yet
   - Ensure database user has sufficient permissions

2. **Migration Order Issues**:
   - Migrations are applied in timestamp order
   - If timestamps get out of sync, create a new migration rather than modifying existing ones

3. **CI/CD Pipeline Failures**:
   - Verify environment variables and secrets are correctly set
   - Check that the Supabase access token has sufficient permissions
   - Review migration syntax for environment-specific issues

## 9. Example Migrations

### Example 1: Creating a New Table

```sql
-- Migration: Create notifications table for user alerts
-- Created: 2025-05-10

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Set up RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_notification_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_update ON public.notifications;
CREATE TRIGGER on_notification_update
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_notification_update();
```

### Example 2: Adding a Column to Existing Table

```sql
-- Migration: Add notification preferences to user profiles
-- Created: 2025-05-11

-- Add notification_preferences column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END
$$;

-- Add comment explaining structure
COMMENT ON COLUMN public.profiles.notification_preferences IS 
'JSON structure for storing user notification preferences. Example: {"email": true, "push": false}';
```

---

## Change Log

| Change        | Date       | Version | Description                  | Author         |
| :------------ | :--------- | :------ | :--------------------------- | :------------- |
| Initial draft | 2025-05-10 | 0.1     | First draft of migration strategy | Developer AI |

--- 