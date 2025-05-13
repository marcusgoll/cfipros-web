-- Migration: Add user settings table and notification preferences
-- Created: 2025-05-15
-- Description: This migration adds a user_settings table for storing user-specific settings
-- and adds a notification_preferences column to the profiles table.

-- Transaction to ensure all changes are applied atomically
BEGIN;

-- Add new user_settings table
-- Rollback: DROP TABLE IF EXISTS public.user_settings;
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  dashboard_layout JSONB NOT NULL DEFAULT '{"layout": "default"}'::jsonb,
  custom_settings JSONB NULL
);

-- Add indexes to user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Create trigger for auto-updating updated_at column
CREATE OR REPLACE FUNCTION public.handle_user_settings_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_settings_update ON public.user_settings;
CREATE TRIGGER on_user_settings_update
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_settings_update();

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own settings
CREATE POLICY "Users can manage their own settings"
ON public.user_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add notification_preferences column to profiles if it doesn't exist
-- Rollback: ALTER TABLE public.profiles DROP COLUMN IF EXISTS notification_preferences;
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
    
    -- Add comment explaining structure
    COMMENT ON COLUMN public.profiles.notification_preferences IS 
    'JSON structure for storing user notification preferences. Example: {"email": true, "push": false}';
  END IF;
END
$$;

COMMIT; 