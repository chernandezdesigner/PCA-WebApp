-- ============================================================================
-- Tighten RLS policies on reports and report_content
-- Previously: any authenticated user could read/update/delete ALL rows
-- Now: users can only access their own reports (via author_id)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. REPORTS TABLE — restrict to own reports
-- -----------------------------------------------------------------------------

-- Drop the overly permissive policies
DROP POLICY "Authenticated users can view all reports" ON public.reports;
DROP POLICY "Authenticated users can update reports" ON public.reports;
DROP POLICY "Authenticated users can delete reports" ON public.reports;

-- Recreate with author_id scoping
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- NOTE: INSERT policy ("Authenticated users can create reports") already
-- enforces auth.uid() = author_id via WITH CHECK — no change needed.

-- -----------------------------------------------------------------------------
-- 2. REPORT_CONTENT TABLE — restrict via parent report ownership
-- -----------------------------------------------------------------------------

-- Drop the overly permissive policies
DROP POLICY "Authenticated users can view all report content" ON public.report_content;
DROP POLICY "Authenticated users can create report content" ON public.report_content;
DROP POLICY "Authenticated users can update report content" ON public.report_content;
DROP POLICY "Authenticated users can delete report content" ON public.report_content;

-- Recreate scoped to parent report's author_id
CREATE POLICY "Users can view own report content" ON public.report_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_content.report_id
        AND reports.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own report content" ON public.report_content
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_content.report_id
        AND reports.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own report content" ON public.report_content
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_content.report_id
        AND reports.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_content.report_id
        AND reports.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own report content" ON public.report_content
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_content.report_id
        AND reports.author_id = auth.uid()
    )
  );
