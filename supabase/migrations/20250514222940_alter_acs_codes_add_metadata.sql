-- Migration to add index, comments, and updated_at trigger to existing public.acs_codes table

-- Add index on exam_type if it doesn't already exist
CREATE INDEX IF NOT EXISTS idx_acs_codes_exam_type ON public.acs_codes(exam_type);

-- Add comments on table and columns
COMMENT ON TABLE public.acs_codes IS 'Airman Certification Standards (ACS) codes and their descriptions.';
COMMENT ON COLUMN public.acs_codes.id IS 'The unique ACS code, e.g., CA.I.A.K1.';
COMMENT ON COLUMN public.acs_codes.description IS 'The detailed description of the ACS code.';
COMMENT ON COLUMN public.acs_codes.area IS 'The Area of Operation, e.g., "Airman System".';
COMMENT ON COLUMN public.acs_codes.task IS 'The Task within the Area, e.g., "Pilot Qualifications".';
COMMENT ON COLUMN public.acs_codes.sub_task IS 'The Sub-Task or Element, if applicable.';
COMMENT ON COLUMN public.acs_codes.knowledge_area IS 'Specific knowledge area identifier, e.g., K1, K2a.';
COMMENT ON COLUMN public.acs_codes.exam_type IS 'The type of exam this code applies to, e.g., CAX, PAR, IRA.';

-- Trigger function to automatically update updated_at timestamp on row update
-- Create the function only if it doesn't exist or replace it to ensure it's up-to-date
CREATE OR REPLACE FUNCTION public.update_acs_codes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now()); -- Explicitly set to UTC
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER; -- Added SECURITY DEFINER for broader applicability

-- Drop the trigger if it exists, then create it to ensure it uses the latest function definition
DROP TRIGGER IF EXISTS trg_update_acs_codes_updated_at ON public.acs_codes;
CREATE TRIGGER trg_update_acs_codes_updated_at
BEFORE UPDATE ON public.acs_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_acs_codes_updated_at_column(); 