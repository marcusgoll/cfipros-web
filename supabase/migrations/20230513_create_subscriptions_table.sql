-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- A subscription must be associated with either a user or a school, but not both
  CONSTRAINT subscription_owner CHECK (
    (user_id IS NOT NULL AND school_id IS NULL) OR
    (user_id IS NULL AND school_id IS NOT NULL)
  )
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_school_id_idx ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the subscriptions table
DROP TRIGGER IF EXISTS handle_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER handle_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
-- Enable RLS on the subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to view their own subscriptions
CREATE POLICY subscriptions_select_own ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- 2. Allow school admins to view their school's subscriptions
-- (Assuming school_members table with role='admin' for school admins)
CREATE POLICY subscriptions_select_school_admin ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_members.school_id = subscriptions.school_id
    AND school_members.user_id = auth.uid()
    AND school_members.role = 'admin'
  )
);

-- 3. Service role can manage all subscriptions (for backend operations)
CREATE POLICY subscriptions_service_role ON public.subscriptions
FOR ALL
TO service_role
USING (true);

-- Grant permissions to authenticated users
GRANT SELECT ON public.subscriptions TO authenticated;

-- Grant all permissions to service_role
GRANT ALL ON public.subscriptions TO service_role; 