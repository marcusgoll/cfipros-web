CREATE TABLE public.acs_codes (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    description TEXT NOT NULL,
    area TEXT NULL,
    task TEXT NULL,
    sub_task TEXT NULL,
    knowledge_area TEXT NULL,
    exam_type TEXT NOT NULL
);

CREATE INDEX idx_acs_codes_exam_type ON public.acs_codes(exam_type);

-- Optional: Add comments on table and columns if desired for more context in DB tools
COMMENT ON TABLE public.acs_codes IS 'Airman Certification Standards (ACS) codes and their descriptions.';
COMMENT ON COLUMN public.acs_codes.id IS 'The unique ACS code, e.g., CA.I.A.K1.';
COMMENT ON COLUMN public.acs_codes.description IS 'The detailed description of the ACS code.';
COMMENT ON COLUMN public.acs_codes.area IS 'The Area of Operation, e.g., "Airman System".';
COMMENT ON COLUMN public.acs_codes.task IS 'The Task within the Area, e.g., "Pilot Qualifications".';
COMMENT ON COLUMN public.acs_codes.sub_task IS 'The Sub-Task or Element, if applicable.';
COMMENT ON COLUMN public.acs_codes.knowledge_area IS 'Specific knowledge area identifier, e.g., K1, K2a.';
COMMENT ON COLUMN public.acs_codes.exam_type IS 'The type of exam this code applies to, e.g., CAX, PAR, IRA.';

-- Trigger to automatically update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_acs_codes_updated_at
BEFORE UPDATE ON public.acs_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 