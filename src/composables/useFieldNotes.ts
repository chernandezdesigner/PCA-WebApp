import { ref, computed, watch, type Ref } from 'vue';
import { supabase } from '@/services/supabase';

// ============================================================================
// Types - Simplified
// ============================================================================

export interface FieldPhoto {
  id: string;
  storage_path: string;
  thumbnail_path?: string;
  notes?: string;
  captured_at: string;
  filename?: string;
}

export interface FieldNoteSection {
  id: string;
  title: string;
  category: string;
  rawData: Record<string, unknown> | null;
  photos: FieldPhoto[];
  hasData: boolean;
}

export interface FieldNotesCategory {
  id: string;
  title: string;
  icon: string;
  sections: FieldNoteSection[];
  totalPhotos: number;
  comingSoon?: boolean;
}

// ============================================================================
// Configuration - Matches Mobile App Navigation
// ============================================================================

const FIELD_NOTES_CONFIG = [
  {
    id: 'project-summary',
    title: 'Project Summary',
    icon: 'clipboard',
    table: 'project_summaries' as const,
    formType: 'project_summaries',
    sections: [
      { id: 'ps-1', stepKey: null, formStep: 1, title: 'General Info', fields: ['project_name', 'project_number', 'property_address', 'property_city', 'property_state', 'property_zip', 'weather', 'temperature', 'inspection_date', 'inspection_time', 'inspector_name', 'inspector_number', 'surrounding_properties'] },
      { id: 'ps-2', stepKey: null, formStep: 2, title: 'Unit Info', fields: ['acreage', 'number_sign_down', 'year_renovated', 'number_of_buildings', 'net_sq_ft', 'number_of_units', 'gsf', 'number_of_vacant_units', 'year_built', 'lease_type', 'recent_capital_improvements'] },
      { id: 'ps-3', stepKey: null, formStep: 3, title: 'Documentation & Personnel', fields: ['documents', 'personnel_interviewed', 'commercial_tenants'] },
      { id: 'ps-4', stepKey: null, formStep: 4, title: 'Red Flags & Utilities', fields: ['problematic_materials', 'domestic_water', 'domestic_sewage', 'storm_water_drainage', 'electricity', 'natural_gas', 'heating_oil', 'propane', 'well_system', 'septic_system', 'wastewater_treatment_plant'] },
    ],
  },
  {
    id: 'site-grounds',
    title: 'Site Grounds',
    icon: 'landscape',
    table: 'site_grounds' as const,
    formType: 'site_grounds',
    sections: [
      { id: 'sg-1', stepKey: 'step1', formStep: 1, title: 'Drainage & Erosion' },
      { id: 'sg-2', stepKey: 'step2', formStep: 2, title: 'Topography' },
      { id: 'sg-3', stepKey: 'step3', formStep: 3, title: 'Site Elements' },
      { id: 'sg-4', stepKey: 'step4', formStep: 4, title: 'Other Structures' },
    ],
  },
  {
    id: 'building-envelope',
    title: 'Building Envelope',
    icon: 'building',
    table: 'building_envelope' as const,
    formType: 'building_envelope',
    sections: [
      { id: 'be-1', stepKey: 'step1', formStep: 1, title: 'Foundation & Substructure' },
      { id: 'be-2', stepKey: 'step2', formStep: 2, title: 'Superstructure' },
      { id: 'be-3', stepKey: 'step3', formStep: 3, title: 'Primary & Secondary Roofing' },
      { id: 'be-4', stepKey: 'step4', formStep: 4, title: 'Exterior Walls' },
      { id: 'be-5', stepKey: 'step5', formStep: 5, title: 'Parking, Paving, Sidewalks' },
      { id: 'be-6', stepKey: 'step6', formStep: 6, title: 'Parking Garage Structure' },
      { id: 'be-7', stepKey: 'step7', formStep: 7, title: 'Building Stairs, Balconies, Patios' },
      { id: 'be-8', stepKey: 'step8', formStep: 8, title: 'Windows' },
      { id: 'be-9', stepKey: 'step9', formStep: 9, title: 'Doors' },
      { id: 'be-10', stepKey: 'step10', formStep: 10, title: 'Pool, Spa' },
    ],
  },
  {
    id: 'mechanical-systems',
    title: 'Mechanical Systems',
    icon: 'settings',
    table: 'mechanical_systems' as const,
    formType: 'mechanical_systems',
    sections: [
      { id: 'ms-1', stepKey: 'step1', formStep: 1, title: 'HVAC Individual Units' },
      { id: 'ms-2', stepKey: 'step2', formStep: 2, title: 'Misc Units' },
      { id: 'ms-3', stepKey: 'step3', formStep: 3, title: 'Chillers & Cooling Towers' },
      { id: 'ms-4', stepKey: 'step4', formStep: 4, title: 'Boilers' },
      { id: 'ms-5', stepKey: 'step5', formStep: 5, title: 'Plumbing Systems' },
      { id: 'ms-6', stepKey: 'step6', formStep: 6, title: 'Water Heaters' },
      { id: 'ms-7', stepKey: 'step7', formStep: 7, title: 'Electrical' },
      { id: 'ms-8', stepKey: 'step8', formStep: 8, title: 'Elevators & Conveying Systems' },
      { id: 'ms-9', stepKey: 'step9', formStep: 9, title: 'Fire Protection' },
    ],
  },
  {
    id: 'interior-conditions',
    title: 'Interior Conditions',
    icon: 'home',
    table: null,
    formType: 'interior_conditions',
    sections: [
      { id: 'ic-1', stepKey: null, formStep: 1, title: 'Coming Soon' },
    ],
    comingSoon: true,
  },
];

// ============================================================================
// Main Composable
// ============================================================================

export function useFieldNotes(reportId: Ref<string>) {
  // State
  const categories = ref<FieldNotesCategory[]>([]);
  const allPhotos = ref<FieldPhoto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sourceAssessmentId = ref<string | null>(null);
  const inspectorName = ref<string>('');
  const inspectionDate = ref<string>('');

  // Navigation state
  const currentCategoryIndex = ref(0);
  const currentSectionIndex = ref(0);

  // Computed
  const currentCategory = computed(() => categories.value[currentCategoryIndex.value] || null);
  const currentSection = computed(() => currentCategory.value?.sections[currentSectionIndex.value] || null);
  
  const hasData = computed(() => 
    categories.value.some(cat => cat.sections.some(sec => sec.hasData))
  );

  const totalPhotos = computed(() => allPhotos.value.length);

  // Navigation methods
  function goToCategory(index: number) {
    if (index >= 0 && index < categories.value.length) {
      currentCategoryIndex.value = index;
      currentSectionIndex.value = 0;
    }
  }

  function goToSection(categoryIndex: number, sectionIndex: number) {
    if (categoryIndex >= 0 && categoryIndex < categories.value.length) {
      const category = categories.value[categoryIndex];
      if (category && sectionIndex >= 0 && sectionIndex < category.sections.length) {
        currentCategoryIndex.value = categoryIndex;
        currentSectionIndex.value = sectionIndex;
      }
    }
  }

  function nextSection() {
    const category = categories.value[currentCategoryIndex.value];
    if (!category) return;

    if (currentSectionIndex.value < category.sections.length - 1) {
      currentSectionIndex.value++;
    } else if (currentCategoryIndex.value < categories.value.length - 1) {
      currentCategoryIndex.value++;
      currentSectionIndex.value = 0;
    }
  }

  function prevSection() {
    if (currentSectionIndex.value > 0) {
      currentSectionIndex.value--;
    } else if (currentCategoryIndex.value > 0) {
      currentCategoryIndex.value--;
      const prevCategory = categories.value[currentCategoryIndex.value];
      currentSectionIndex.value = prevCategory ? prevCategory.sections.length - 1 : 0;
    }
  }

  function canGoNext(): boolean {
    const category = categories.value[currentCategoryIndex.value];
    if (!category) return false;
    return currentSectionIndex.value < category.sections.length - 1 || 
           currentCategoryIndex.value < categories.value.length - 1;
  }

  function canGoPrev(): boolean {
    return currentSectionIndex.value > 0 || currentCategoryIndex.value > 0;
  }

  // Photo URL helpers
  function getPhotoUrl(path: string): string {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  }

  function getThumbnailUrl(photo: FieldPhoto): string {
    return getPhotoUrl(photo.thumbnail_path || photo.storage_path);
  }

  // Initialize empty categories
  function initializeEmptyCategories() {
    categories.value = FIELD_NOTES_CONFIG.map(config => ({
      id: config.id,
      title: config.title,
      icon: config.icon,
      sections: config.sections.map(sec => ({
        id: sec.id,
        title: sec.title,
        category: config.title,
        rawData: null,
        photos: [],
        hasData: false,
      })),
      totalPhotos: 0,
      comingSoon: (config as { comingSoon?: boolean }).comingSoon,
    }));
  }

  // Check if data object has meaningful content
  function hasContent(data: unknown): boolean {
    if (data === null || data === undefined) return false;
    if (typeof data === 'string') return data.trim().length > 0;
    if (typeof data === 'number') return true;
    if (typeof data === 'boolean') return true;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') {
      const skipKeys = new Set(['id', 'assessment_id', 'created_at', 'updated_at', 'last_modified', 'current_step']);
      return Object.entries(data).some(([key, value]) => 
        !skipKeys.has(key) && hasContent(value)
      );
    }
    return false;
  }

  // Fetch all field notes data
  async function fetchFieldNotes() {
    if (!reportId.value || reportId.value === 'demo') {
      initializeEmptyCategories();
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Get source assessment ID from report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('source_assessment_id')
        .eq('id', reportId.value)
        .single();

      if (reportError) throw reportError;
      
      sourceAssessmentId.value = reportData?.source_assessment_id || null;

      if (!sourceAssessmentId.value) {
        initializeEmptyCategories();
        loading.value = false;
        return;
      }

      // Fetch all data in parallel
      const [projectSummaryRes, siteGroundsRes, buildingEnvelopeRes, mechanicalRes, photosRes] = await Promise.all([
        supabase.from('project_summaries').select('*').eq('assessment_id', sourceAssessmentId.value).maybeSingle(),
        supabase.from('site_grounds').select('*').eq('assessment_id', sourceAssessmentId.value).maybeSingle(),
        supabase.from('building_envelope').select('*').eq('assessment_id', sourceAssessmentId.value).maybeSingle(),
        supabase.from('mechanical_systems').select('*').eq('assessment_id', sourceAssessmentId.value).maybeSingle(),
        supabase.from('photos').select('*').eq('assessment_id', sourceAssessmentId.value).order('captured_at', { ascending: false }),
      ]);

      // Store raw table data
      const tableData: Record<string, Record<string, unknown> | null> = {
        project_summaries: projectSummaryRes.data,
        site_grounds: siteGroundsRes.data,
        building_envelope: buildingEnvelopeRes.data,
        mechanical_systems: mechanicalRes.data,
      };

      // DEBUG: Log raw data
      console.group('📋 Field Notes - Raw Data');
      console.log('project_summaries:', projectSummaryRes.data);
      console.log('site_grounds:', siteGroundsRes.data);
      console.log('building_envelope:', buildingEnvelopeRes.data);
      console.log('mechanical_systems:', mechanicalRes.data);
      console.log('photos:', photosRes.data?.length || 0);
      console.groupEnd();

      // Set inspector info
      if (projectSummaryRes.data) {
        inspectorName.value = (projectSummaryRes.data.inspector_name as string) || 'Field Assessor';
        inspectionDate.value = projectSummaryRes.data.inspection_date
          ? new Date(projectSummaryRes.data.inspection_date as string).toLocaleDateString()
          : '';
      }

      // Process photos
      allPhotos.value = (photosRes.data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        storage_path: p.storage_path as string,
        thumbnail_path: p.thumbnail_path as string | undefined,
        notes: p.notes as string | undefined,
        captured_at: p.captured_at as string,
        filename: p.filename as string | undefined,
        formType: p.form_type as string,
        formStep: p.form_step as number,
      }));

      // Build categories with raw data
      const builtCategories: FieldNotesCategory[] = FIELD_NOTES_CONFIG.map(config => {
        // Handle coming soon
        if ((config as { comingSoon?: boolean }).comingSoon) {
          return {
            id: config.id,
            title: config.title,
            icon: config.icon,
            sections: [{
              id: config.sections[0]?.id || `${config.id}-coming-soon`,
              title: 'Coming Soon',
              category: config.title,
              rawData: null,
              photos: [],
              hasData: false,
            }],
            totalPhotos: 0,
            comingSoon: true,
          };
        }

        const mobileData = config.table ? tableData[config.table] : null;

        const sections: FieldNoteSection[] = config.sections.map(secConfig => {
          let rawData: Record<string, unknown> | null = null;

          // For project_summaries, extract specific fields for each step
          if (config.table === 'project_summaries' && mobileData && 'fields' in secConfig) {
            const fields = (secConfig as { fields?: string[] }).fields || [];
            const extracted: Record<string, unknown> = {};
            for (const field of fields) {
              if (mobileData[field] !== undefined && mobileData[field] !== null && mobileData[field] !== '') {
                extracted[field] = mobileData[field];
              }
            }
            rawData = Object.keys(extracted).length > 0 ? extracted : null;
          }
          // For JSONB step tables, get the step data directly
          else if (secConfig.stepKey && mobileData) {
            const stepData = mobileData[secConfig.stepKey];
            rawData = (stepData && typeof stepData === 'object') ? stepData as Record<string, unknown> : null;
          }

          // Get photos for this section
          const sectionPhotos = allPhotos.value.filter(p => 
            (p as unknown as { formType: string; formStep: number }).formType === config.formType && 
            (p as unknown as { formType: string; formStep: number }).formStep === secConfig.formStep
          );

          return {
            id: secConfig.id,
            title: secConfig.title,
            category: config.title,
            rawData,
            photos: sectionPhotos,
            hasData: hasContent(rawData) || sectionPhotos.length > 0,
          };
        });

        return {
          id: config.id,
          title: config.title,
          icon: config.icon,
          sections,
          totalPhotos: sections.reduce((sum, s) => sum + s.photos.length, 0),
        };
      });

      categories.value = builtCategories;

      // Navigate to first section with data
      for (let catIdx = 0; catIdx < builtCategories.length; catIdx++) {
        const cat = builtCategories[catIdx];
        if (!cat) continue;
        for (let secIdx = 0; secIdx < cat.sections.length; secIdx++) {
          const section = cat.sections[secIdx];
          if (section?.hasData) {
            currentCategoryIndex.value = catIdx;
            currentSectionIndex.value = secIdx;
            return;
          }
        }
      }

    } catch (e) {
      console.error('Error fetching field notes:', e);
      error.value = e instanceof Error ? e.message : 'Failed to load field notes';
      initializeEmptyCategories();
    } finally {
      loading.value = false;
    }
  }

  // Watch for reportId changes
  watch(
    () => reportId.value,
    () => fetchFieldNotes(),
    { immediate: true }
  );

  return {
    // State
    categories,
    allPhotos,
    loading,
    error,
    sourceAssessmentId,
    inspectorName,
    inspectionDate,
    
    // Navigation state
    currentCategoryIndex,
    currentSectionIndex,
    currentCategory,
    currentSection,
    
    // Computed
    hasData,
    totalPhotos,
    
    // Methods
    goToCategory,
    goToSection,
    nextSection,
    prevSection,
    canGoNext,
    canGoPrev,
    getPhotoUrl,
    getThumbnailUrl,
    fetchFieldNotes,
  };
}
