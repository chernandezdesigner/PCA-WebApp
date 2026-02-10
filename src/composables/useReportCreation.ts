import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type {
  ProjectSummary,
  ReportInsert,
  ReportContentInsert,
  SectionData,
  Report,
} from '@/types/database';

// ============================================================================
// Types
// ============================================================================

interface MobileAssessmentData {
  id: string;
  status: string;
  project_summaries: ProjectSummary | null;
}

interface CreateReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

// ============================================================================
// Field Mapping Configuration
// Maps mobile ProjectSummary fields to web app form field IDs
// ============================================================================

/**
 * Section 1: Executive Summary
 * - Step 1.1: General Description (property-name, property-address, etc.)
 * - Step 1.2: Physical Condition (recent-capital-improvements)
 * - Step 1.3: Key Findings (empty - user authored)
 */
function mapToSection1(ps: ProjectSummary | null): SectionData {
  if (!ps) return {};

  return {
    // Step 1.1: General Description
    'property-name': ps.project_name || '',
    'property-address': ps.property_address || '',
    'city': ps.property_city || '',
    'state': ps.property_state || '',
    'zip': ps.property_zip || '',
    'year-constructed': ps.year_built?.toString() || '',
    'number-of-buildings': ps.number_of_buildings?.toString() || '',
    'gross-building-area': ps.gsf?.toString() || '',
    'net-rentable-area': ps.net_sq_ft?.toString() || '',
    'total-acreage': ps.acreage?.toString() || '',
    'dwelling-units-beds': ps.number_of_units?.toString() || '',

  };
}

/**
 * Section 2: Introduction
 * - Step 2.1: Purpose (empty - user authored)
 * - Step 2.2: Scope (empty - user authored)
 * - Step 2.3: Methodology (empty - user authored)
 * - Step 2.4: Reconnaissance (date-of-assessment, weather-conditions, assessor)
 */
function mapToSection2(ps: ProjectSummary | null): SectionData {
  if (!ps) return {};

  // Format weather with temperature if available
  let weatherConditions = ps.weather || '';
  if (ps.temperature !== undefined && ps.temperature !== null) {
    weatherConditions += weatherConditions ? `, ${ps.temperature}°F` : `${ps.temperature}°F`;
  }

  return {
    // Step 2.4: Reconnaissance
    'date-of-assessment': ps.inspection_date || '',
    'weather-conditions': weatherConditions,
    'assessor': ps.inspector_name || '',
    'assessor-number': ps.inspector_number || '',
    'inspection-time': ps.inspection_time || '',
  };
}

/**
 * Section 3: Property Information
 * - Step 3.1: Property Details (covered in section 1)
 * - Step 3.2: Site Description (empty - user authored)
 * - Step 3.3: Utilities (portable-water, electricity, natural-gas, sanitary-sewer, storm-water)
 */
function mapToSection3(ps: ProjectSummary | null): SectionData {
  if (!ps) return {};

  return {
    // Step 3.3: Utilities
    'portable-water': ps.domestic_water || '',
    'electricity': ps.electricity || '',
    'natural-gas': ps.natural_gas || '',
    'sanitary-sewer': ps.domestic_sewage || '',
    'storm-water': ps.storm_water_drainage || '',



    // Personnel interviewed (stored as JSON string for display)
    'personnel-interviewed': ps.personnel_interviewed
      ? JSON.stringify(ps.personnel_interviewed)
      : '',
  };
}


/**
 * Sections 5-9: Site & Building Systems
 * These sections don't have direct mobile mappings - they're authored in the web app
 * But we can pre-populate with any relevant context
 */
function mapToSection5(_ps: ProjectSummary | null): SectionData {
  // Site & Grounds - mostly user authored
  return {};
}

function mapToSection6(_ps: ProjectSummary | null): SectionData {
  // Building Envelope - user authored
  return {};
}

function mapToSection7(_ps: ProjectSummary | null): SectionData {
  // Mechanical Systems - user authored
  return {};
}

function mapToSection8(_ps: ProjectSummary | null): SectionData {
  // Interior Elements - user authored
  return {};
}

function mapToSection9(_ps: ProjectSummary | null): SectionData {
  // Fire & Life Safety - user authored
  return {};
}

// ============================================================================
// Main Composable
// ============================================================================

export function useReportCreation() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Creates a new report from a mobile assessment
   * @param sourceAssessmentId - The mobile assessment ID to create a report from
   * @returns Result object with success status and report ID or error
   */
  async function createReportFromAssessment(
    sourceAssessmentId: string
  ): Promise<CreateReportResult> {
    loading.value = true;
    error.value = null;

    try {
      // 1. Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to create a report');
      }

      // 2. Check if a report already exists for this assessment
      const { data: existingReport, error: checkError } = await supabase
        .from('reports')
        .select('id')
        .eq('source_assessment_id', sourceAssessmentId)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Failed to check existing reports: ${checkError.message}`);
      }

      if (existingReport) {
        throw new Error('A report already exists for this assessment');
      }

      // 3. Fetch mobile assessment with project_summaries
      const { data: assessmentData, error: fetchError } = await supabase
        .from('assessments')
        .select(
          `
          id,
          status,
          project_summaries (*)
        `
        )
        .eq('id', sourceAssessmentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch assessment: ${fetchError.message}`);
      }

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      // Type assertion for the joined data
      const assessment = assessmentData as unknown as MobileAssessmentData;

      // 4. Verify assessment is submitted/synced
      if (!['submitted', 'synced'].includes(assessment.status)) {
        throw new Error('Only submitted or synced assessments can be converted to reports');
      }

      // 5. Map mobile data to web app form fields
      const projectSummary = assessment.project_summaries;

      const mappedContent: ReportContentInsert = {
        report_id: '', // Will be set after report creation
        section_1_summary: mapToSection1(projectSummary),
        section_2_introduction: mapToSection2(projectSummary),
        section_3_property: mapToSection3(projectSummary),
        section_5_site_grounds: mapToSection5(projectSummary),
        section_6_building_envelope: mapToSection6(projectSummary),
        section_7_mechanical: mapToSection7(projectSummary),
        section_8_interior: mapToSection8(projectSummary),
        section_9_fire_protection: mapToSection9(projectSummary),
        current_step: 1,
        completed_steps: [],
      };

      // 6. Create the report record
      const reportInsert: ReportInsert = {
        source_assessment_id: sourceAssessmentId,
        author_id: user.id,
        status: 'draft',
      };

      const { data: newReport, error: reportError } = await supabase
        .from('reports')
        .insert(reportInsert)
        .select()
        .single();

      if (reportError) {
        throw new Error(`Failed to create report: ${reportError.message}`);
      }

      const report = newReport as Report;

      // 7. Create the report content record with mapped data
      mappedContent.report_id = report.id;

      const { error: contentError } = await supabase
        .from('report_content')
        .insert(mappedContent);

      if (contentError) {
        // Rollback: delete the report if content creation fails
        await supabase.from('reports').delete().eq('id', report.id);
        throw new Error(`Failed to create report content: ${contentError.message}`);
      }

      return {
        success: true,
        reportId: report.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create report';
      error.value = message;
      console.error('Error creating report:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Creates a blank report without a source assessment
   * @returns Result object with success status and report ID or error
   */
  async function createBlankReport(): Promise<CreateReportResult> {
    loading.value = true;
    error.value = null;

    try {
      // 1. Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to create a report');
      }

      // 2. Create the report record
      const reportInsert: ReportInsert = {
        source_assessment_id: null,
        author_id: user.id,
        status: 'draft',
      };

      const { data: newReport, error: reportError } = await supabase
        .from('reports')
        .insert(reportInsert)
        .select()
        .single();

      if (reportError) {
        throw new Error(`Failed to create report: ${reportError.message}`);
      }

      const report = newReport as Report;

      // 3. Create empty report content
      const contentInsert: ReportContentInsert = {
        report_id: report.id,
        section_1_summary: {},
        section_2_introduction: {},
        section_3_property: {},
        section_5_site_grounds: {},
        section_6_building_envelope: {},
        section_7_mechanical: {},
        section_8_interior: {},
        section_9_fire_protection: {},
        current_step: 1,
        completed_steps: [],
      };

      const { error: contentError } = await supabase
        .from('report_content')
        .insert(contentInsert);

      if (contentError) {
        // Rollback
        await supabase.from('reports').delete().eq('id', report.id);
        throw new Error(`Failed to create report content: ${contentError.message}`);
      }

      return {
        success: true,
        reportId: report.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create report';
      error.value = message;
      console.error('Error creating blank report:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Deletes a report and its content
   * @param reportId - The report ID to delete
   */
  async function deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      // Content is deleted automatically via CASCADE
      const { error: deleteError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (deleteError) {
        throw new Error(`Failed to delete report: ${deleteError.message}`);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete report';
      error.value = message;
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    loading,
    error,

    // Methods
    createReportFromAssessment,
    createBlankReport,
    deleteReport,
  };
}
