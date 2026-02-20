-- Add appendices JSONB column to report_content for step 34
ALTER TABLE public.report_content
  ADD COLUMN IF NOT EXISTS appendices JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.report_content.appendices IS 'Appendix A-E file/photo metadata stored as JSONB';

-- Update step constraint to allow step 34
ALTER TABLE public.report_content
  DROP CONSTRAINT IF EXISTS report_content_current_step_check;
ALTER TABLE public.report_content
  ADD CONSTRAINT report_content_current_step_check
  CHECK (current_step >= 1 AND current_step <= 34);
