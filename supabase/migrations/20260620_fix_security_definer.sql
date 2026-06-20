-- ============================================================================
-- Fix SECURITY DEFINER function: validate p_author_id matches auth.uid()
-- Previously: accepted any p_author_id, allowing impersonation via PostgREST
-- Now: raises exception if caller tries to create a report as another user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_report_with_content(
    p_author_id UUID,
    p_source_assessment_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT 'draft'
)
RETURNS UUID AS $$
DECLARE
    v_report_id UUID;
BEGIN
    -- Validate the caller owns the author_id
    IF p_author_id != auth.uid() THEN
        RAISE EXCEPTION 'author_id must match the authenticated user';
    END IF;

    -- Insert the report
    INSERT INTO public.reports (author_id, source_assessment_id, status)
    VALUES (p_author_id, p_source_assessment_id, p_status)
    RETURNING id INTO v_report_id;

    -- Insert empty report content
    INSERT INTO public.report_content (report_id)
    VALUES (v_report_id);

    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
