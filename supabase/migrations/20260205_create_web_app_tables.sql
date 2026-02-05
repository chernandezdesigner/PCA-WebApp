-- ============================================================================
-- PCA Web App Database Migration
-- Creates tables for the report authoring web application
-- NOTE: This migration is for the WEB APP only - never writes to mobile tables
-- ============================================================================

-- ============================================================================
-- 1. REPORTS TABLE
-- Main table for tracking report metadata and status
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to mobile assessment (optional - reports can be created without mobile data)
    source_assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    
    -- Author tracking
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Report status workflow
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'in_progress', 'review', 'final', 'exported')),
    
    -- PDF export tracking
    pdf_generated_at TIMESTAMPTZ,
    pdf_storage_path TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE public.reports IS 'Web app report metadata - tracks report status, authorship, and PDF exports';
COMMENT ON COLUMN public.reports.source_assessment_id IS 'Optional link to mobile assessment data (read-only reference)';
COMMENT ON COLUMN public.reports.status IS 'Report workflow status: draft -> in_progress -> review -> final -> exported';


-- ============================================================================
-- 2. REPORT_CONTENT TABLE
-- Stores all form data as JSONB columns organized by section
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.report_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- One-to-one relationship with reports
    report_id UUID NOT NULL UNIQUE REFERENCES public.reports(id) ON DELETE CASCADE,
    
    -- Section 1: Executive Summary (Steps 1-3)
    -- Contains: executive summary, key findings, cost summary
    section_1_summary JSONB DEFAULT '{}'::jsonb,
    
    -- Section 2: Introduction (Step 4)
    -- Contains: report purpose, scope, methodology
    section_2_introduction JSONB DEFAULT '{}'::jsonb,
    
    -- Section 3: Property Information (Steps 5-7)
    -- Contains: property details, ownership, contacts
    section_3_property JSONB DEFAULT '{}'::jsonb,
    
    -- Section 4: Documents Review (Steps 8-12)
    -- Contains: document checklist, permits, compliance records
    section_4_documents JSONB DEFAULT '{}'::jsonb,
    
    -- Section 5: Site & Grounds (Steps 13-17)
    -- Contains: topography, parking, landscaping, utilities, drainage
    section_5_site_grounds JSONB DEFAULT '{}'::jsonb,
    
    -- Section 6: Building Envelope (Steps 18-21)
    -- Contains: roof, walls, windows, doors, foundation
    section_6_building_envelope JSONB DEFAULT '{}'::jsonb,
    
    -- Section 7: Mechanical Systems (Steps 22-25)
    -- Contains: HVAC, plumbing, electrical, elevators
    section_7_mechanical JSONB DEFAULT '{}'::jsonb,
    
    -- Section 8: Interior Elements (Steps 26-27)
    -- Contains: common areas, unit interiors, finishes
    section_8_interior JSONB DEFAULT '{}'::jsonb,
    
    -- Section 9: Fire & Life Safety (Steps 28-29)
    -- Contains: fire protection, life safety, egress
    section_9_fire_protection JSONB DEFAULT '{}'::jsonb,
    
    -- Progress tracking
    current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 29),
    completed_steps INTEGER[] NOT NULL DEFAULT '{}',
    
    -- Last modification timestamp
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE public.report_content IS 'Stores all report form data organized by section as JSONB';
COMMENT ON COLUMN public.report_content.current_step IS 'Current active step in the 29-step form (1-29)';
COMMENT ON COLUMN public.report_content.completed_steps IS 'Array of step numbers that have been completed';


-- ============================================================================
-- 3. INDEXES
-- Performance indexes for common query patterns
-- ============================================================================

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_source_assessment_id 
    ON public.reports(source_assessment_id) 
    WHERE source_assessment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_status 
    ON public.reports(status);

CREATE INDEX IF NOT EXISTS idx_reports_author_id 
    ON public.reports(author_id);

-- Compound index for common queries (author's reports by status)
CREATE INDEX IF NOT EXISTS idx_reports_author_status 
    ON public.reports(author_id, status);

-- Report content index for finding report content by report_id (already unique, but explicit)
CREATE INDEX IF NOT EXISTS idx_report_content_report_id 
    ON public.report_content(report_id);


-- ============================================================================
-- 4. TRIGGERS
-- Auto-update timestamp triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_modified timestamp
CREATE OR REPLACE FUNCTION public.update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reports.updated_at
DROP TRIGGER IF EXISTS trigger_reports_updated_at ON public.reports;
CREATE TRIGGER trigger_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for report_content.last_modified
DROP TRIGGER IF EXISTS trigger_report_content_last_modified ON public.report_content;
CREATE TRIGGER trigger_report_content_last_modified
    BEFORE UPDATE ON public.report_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_modified_column();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_content ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Reports table policies
-- Any authenticated user has full access
-- -----------------------------------------------------------------------------

-- SELECT policy
CREATE POLICY "Authenticated users can view all reports"
    ON public.reports
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT policy
CREATE POLICY "Authenticated users can create reports"
    ON public.reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- UPDATE policy
CREATE POLICY "Authenticated users can update reports"
    ON public.reports
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE policy
CREATE POLICY "Authenticated users can delete reports"
    ON public.reports
    FOR DELETE
    TO authenticated
    USING (true);

-- -----------------------------------------------------------------------------
-- Report content table policies
-- Any authenticated user has full access
-- -----------------------------------------------------------------------------

-- SELECT policy
CREATE POLICY "Authenticated users can view all report content"
    ON public.report_content
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT policy
CREATE POLICY "Authenticated users can create report content"
    ON public.report_content
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE policy
CREATE POLICY "Authenticated users can update report content"
    ON public.report_content
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE policy
CREATE POLICY "Authenticated users can delete report content"
    ON public.report_content
    FOR DELETE
    TO authenticated
    USING (true);

-- -----------------------------------------------------------------------------
-- Mobile assessments table - READ-ONLY access for web app
-- Web app can only read submitted/synced assessments
-- -----------------------------------------------------------------------------

-- First, ensure RLS is enabled on assessments (if not already)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Web app users can read submitted assessments" ON public.assessments;

-- Create read-only policy for web app users
CREATE POLICY "Web app users can read submitted assessments"
    ON public.assessments
    FOR SELECT
    TO authenticated
    USING (status IN ('submitted', 'synced'));


-- ============================================================================
-- 6. HELPER FUNCTION: Create report with content in one transaction
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_report_with_content TO authenticated;


-- ============================================================================
-- 7. GRANTS
-- Ensure proper permissions for authenticated users
-- ============================================================================

GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.report_content TO authenticated;
GRANT SELECT ON public.assessments TO authenticated;


-- ============================================================================
-- Migration complete!
-- ============================================================================
