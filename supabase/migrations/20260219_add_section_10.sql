-- ============================================================================
-- Add Section 10: Additional Considerations to report_content
-- ============================================================================

-- 1. Add the new JSONB column for Section 10
ALTER TABLE public.report_content
    ADD COLUMN IF NOT EXISTS section_10_additional JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.report_content.section_10_additional
    IS 'Section 10: Additional Considerations - Natural Hazards, Microbial Contamination, ADA Screening';

-- 2. Update the current_step CHECK constraint to allow up to 37 steps
ALTER TABLE public.report_content
    DROP CONSTRAINT IF EXISTS report_content_current_step_check;

ALTER TABLE public.report_content
    ADD CONSTRAINT report_content_current_step_check
    CHECK (current_step >= 1 AND current_step <= 37);
