// Database types matching Supabase schema

export type AssessmentStatus = 'draft' | 'submitted' | 'synced';

export interface Assessment {
  id: string;
  user_id: string;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
  device_info?: Record<string, unknown>;
  app_version?: string;
  local_id?: string;
}

export interface ProjectSummary {
  id: string;
  assessment_id: string;
  
  // Step 1: Project Information
  project_name?: string;
  project_number?: string;
  property_address?: string;
  property_city?: string;
  property_state?: string;
  property_zip?: string;
  weather?: string;
  temperature?: number;
  inspection_date?: string;
  inspection_time?: string;
  inspector_name?: string;
  inspector_number?: string;
  surrounding_properties?: string;
  
  // Step 2: Property Details
  acreage?: number;
  number_sign_down?: number;
  year_renovated?: number;
  number_of_buildings?: number;
  net_sq_ft?: number;
  number_of_units?: number;
  gsf?: number;
  number_of_vacant_units?: number;
  year_built?: number;
  lease_type?: string;
  recent_capital_improvements?: string;
  
  // Step 3: Complex data
  documents?: Record<string, unknown>;
  personnel_interviewed?: unknown[];
  commercial_tenants?: unknown[];
  
  // Step 4: Utilities & Materials
  problematic_materials?: Record<string, unknown>;
  domestic_water?: string;
  domestic_sewage?: string;
  storm_water_drainage?: string;
  electricity?: string;
  natural_gas?: string;
  heating_oil?: string;
  propane?: string;
  well_system?: string;
  septic_system?: string;
  wastewater_treatment_plant?: string;
  
  // Progress
  current_step?: number;
  last_modified?: string;
}

export interface SiteGrounds {
  id: string;
  assessment_id: string;
  step1?: Record<string, unknown>;
  step2?: Record<string, unknown>;
  step3?: Record<string, unknown>;
  step4?: Record<string, unknown>;
  current_step?: number;
  last_modified?: string;
}

export interface BuildingEnvelope {
  id: string;
  assessment_id: string;
  step1?: Record<string, unknown>;
  step2?: Record<string, unknown>;
  step3?: Record<string, unknown>;
  step4?: Record<string, unknown>;
  step5?: Record<string, unknown>;
  step6?: Record<string, unknown>;
  step7?: Record<string, unknown>;
  step8?: Record<string, unknown>;
  step9?: Record<string, unknown>;
  step10?: Record<string, unknown>;
  current_step?: number;
  last_modified?: string;
}

export interface MechanicalSystems {
  id: string;
  assessment_id: string;
  step1?: Record<string, unknown>;
  step2?: Record<string, unknown>;
  step3?: Record<string, unknown>;
  step4?: Record<string, unknown>;
  step5?: Record<string, unknown>;
  step6?: Record<string, unknown>;
  step7?: Record<string, unknown>;
  step8?: Record<string, unknown>;
  step9?: Record<string, unknown>;
  current_step?: number;
  last_modified?: string;
}

export interface Photo {
  id: string;
  assessment_id: string;
  user_id: string;
  form_type?: string;
  form_step?: number;
  field_name?: string;
  storage_path: string;
  thumbnail_path?: string;
  filename?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  upload_status?: 'pending' | 'uploading' | 'completed' | 'failed';
  uploaded_at?: string;
  captured_at?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Combined assessment with all related data
export interface AssessmentWithDetails extends Assessment {
  project_summaries?: ProjectSummary;
  site_grounds?: SiteGrounds;
  building_envelope?: BuildingEnvelope;
  mechanical_systems?: MechanicalSystems;
  photos?: Photo[];
}

// For dashboard display
export interface AssessmentListItem {
  id: string;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
  project_name?: string;
  project_number?: string;
  property_address?: string;
  property_city?: string;
  property_state?: string;
  inspector_name?: string;
  year_built?: number;
  number_of_buildings?: number;
}

// ============================================================================
// WEB APP TABLES - Report Authoring
// ============================================================================

export type ReportStatus = 'draft' | 'in_progress' | 'review' | 'final' | 'exported';

// Reports table types
export interface Reports {
  Row: {
    id: string;
    source_assessment_id: string | null;
    author_id: string;
    status: ReportStatus;
    pdf_generated_at: string | null;
    pdf_storage_path: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    source_assessment_id?: string | null;
    author_id: string;
    status?: ReportStatus;
    pdf_generated_at?: string | null;
    pdf_storage_path?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    source_assessment_id?: string | null;
    author_id?: string;
    status?: ReportStatus;
    pdf_generated_at?: string | null;
    pdf_storage_path?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

// Report content section data type (JSONB columns)
export type SectionData = Record<string, unknown>;

// Report content table types
export interface ReportContent {
  Row: {
    id: string;
    report_id: string;
    section_1_summary: SectionData;
    section_2_introduction: SectionData;
    section_3_property: SectionData;
    section_4_documents: SectionData;
    section_5_site_grounds: SectionData;
    section_6_building_envelope: SectionData;
    section_7_mechanical: SectionData;
    section_8_interior: SectionData;
    section_9_fire_protection: SectionData;
    section_10_additional: SectionData;
    appendices: SectionData;
    current_step: number;
    completed_steps: number[];
    last_modified: string;
  };
  Insert: {
    id?: string;
    report_id: string;
    section_1_summary?: SectionData;
    section_2_introduction?: SectionData;
    section_3_property?: SectionData;
    section_4_documents?: SectionData;
    section_5_site_grounds?: SectionData;
    section_6_building_envelope?: SectionData;
    section_7_mechanical?: SectionData;
    section_8_interior?: SectionData;
    section_9_fire_protection?: SectionData;
    section_10_additional?: SectionData;
    appendices?: SectionData;
    current_step?: number;
    completed_steps?: number[];
    last_modified?: string;
  };
  Update: {
    id?: string;
    report_id?: string;
    section_1_summary?: SectionData;
    section_2_introduction?: SectionData;
    section_3_property?: SectionData;
    section_4_documents?: SectionData;
    section_5_site_grounds?: SectionData;
    section_6_building_envelope?: SectionData;
    section_7_mechanical?: SectionData;
    section_8_interior?: SectionData;
    section_9_fire_protection?: SectionData;
    section_10_additional?: SectionData;
    appendices?: SectionData;
    current_step?: number;
    completed_steps?: number[];
    last_modified?: string;
  };
}

// Convenience type aliases
export type Report = Reports['Row'];
export type ReportInsert = Reports['Insert'];
export type ReportUpdate = Reports['Update'];

export type ReportContentRow = ReportContent['Row'];
export type ReportContentInsert = ReportContent['Insert'];
export type ReportContentUpdate = ReportContent['Update'];

// Combined report with content
export interface ReportWithContent extends Report {
  report_content?: ReportContentRow;
}

// For report list display
export interface ReportListItem {
  id: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  author_id: string;
  source_assessment_id: string | null;
  pdf_generated_at: string | null;
  // Joined from source assessment (if linked)
  project_name?: string;
  property_address?: string;
  property_city?: string;
  property_state?: string;
  // Joined from report_content
  current_step?: number;
  completed_steps?: number[];
}

// Database schema interface (Supabase pattern)
export interface Database {
  public: {
    Tables: {
      // Mobile app tables (read-only from web app)
      assessments: {
        Row: Assessment;
        Insert: never; // Web app should never insert
        Update: never; // Web app should never update
      };
      project_summaries: {
        Row: ProjectSummary;
        Insert: never;
        Update: never;
      };
      site_grounds: {
        Row: SiteGrounds;
        Insert: never;
        Update: never;
      };
      building_envelope: {
        Row: BuildingEnvelope;
        Insert: never;
        Update: never;
      };
      mechanical_systems: {
        Row: MechanicalSystems;
        Insert: never;
        Update: never;
      };
      photos: {
        Row: Photo;
        Insert: never;
        Update: never;
      };
      // Web app tables (full access)
      reports: Reports;
      report_content: ReportContent;
    };
  };
}
