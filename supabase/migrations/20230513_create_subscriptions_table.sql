-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Check constraint to ensure exactly one of user_id or school_id is set
  CONSTRAINT exactly_one_owner CHECK (
    (user_id IS NOT NULL AND school_id IS NULL) OR
    (user_id IS NULL AND school_id IS NOT NULL)
  )
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id) WHERE user_id IS NOT NULL;

-- Create index on school_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_school_id ON subscriptions(school_id) WHERE school_id IS NOT NULL;

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();

-- Create RLS policies
-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting: Users can see their own subscriptions, and schools can see their subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (auth.uid() IN (
      SELECT user_id FROM school_members 
      WHERE school_id = subscriptions.school_id AND role = 'admin'
    ))
  );

-- Policy for inserting: Only service role can insert
CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy for updating: Only service role can update
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy for deleting: Only service role can delete
CREATE POLICY "Service role can delete subscriptions"
  ON subscriptions
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT ON TABLE subscriptions TO authenticated; 