import { ref, watch, type Ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { FieldNoteData, FieldInspectionItem, ConditionRating, RepairStatus } from '@/types/fieldNotes';

// ============================================================================
// Types
// ============================================================================

export interface FieldPhoto {
  id: string;
  storage_path: string;
  thumbnail_path?: string;
  notes?: string;
  captured_at: string;
  filename?: string;
}

interface StepMapping {
  table: 'site_grounds' | 'building_envelope' | 'mechanical_systems';
  stepKey: string;
  formType: string;
  formStep: number;
}

// ============================================================================
// Step to Mobile Table Mapping
// Maps web app steps to mobile database tables and columns
// ============================================================================

const STEP_MAPPING: Record<number, StepMapping | null> = {
  // Steps 1-12: Property info sections - no field notes
  1: null, 2: null, 3: null, 4: null, 5: null, 6: null,
  7: null, 8: null, 9: null, 10: null, 11: null, 12: null,

  // Section 5: Site & Grounds (steps 13-17) → site_grounds table
  13: { table: 'site_grounds', stepKey: 'step1', formType: 'site_grounds', formStep: 1 },
  14: { table: 'site_grounds', stepKey: 'step2', formType: 'site_grounds', formStep: 2 },
  15: { table: 'site_grounds', stepKey: 'step3', formType: 'site_grounds', formStep: 3 },
  16: { table: 'site_grounds', stepKey: 'step4', formType: 'site_grounds', formStep: 4 },
  17: { table: 'site_grounds', stepKey: 'step4', formType: 'site_grounds', formStep: 4 }, // Ancillary shares step4

  // Section 6: Building Envelope (steps 18-21) → building_envelope table
  18: { table: 'building_envelope', stepKey: 'step1', formType: 'building_envelope', formStep: 1 },
  19: { table: 'building_envelope', stepKey: 'step2', formType: 'building_envelope', formStep: 2 },
  20: { table: 'building_envelope', stepKey: 'step3', formType: 'building_envelope', formStep: 3 },
  21: { table: 'building_envelope', stepKey: 'step4', formType: 'building_envelope', formStep: 4 },

  // Section 7: Mechanical Systems (steps 22-25) → mechanical_systems table
  22: { table: 'mechanical_systems', stepKey: 'step1', formType: 'mechanical_systems', formStep: 1 },
  23: { table: 'mechanical_systems', stepKey: 'step2', formType: 'mechanical_systems', formStep: 2 },
  24: { table: 'mechanical_systems', stepKey: 'step3', formType: 'mechanical_systems', formStep: 3 },
  25: { table: 'mechanical_systems', stepKey: 'step4', formType: 'mechanical_systems', formStep: 4 },

  // Section 8: Interior (steps 26-27) → mechanical_systems table (continued)
  26: { table: 'mechanical_systems', stepKey: 'step5', formType: 'mechanical_systems', formStep: 5 },
  27: { table: 'mechanical_systems', stepKey: 'step6', formType: 'mechanical_systems', formStep: 6 },

  // Section 9: Fire Protection (steps 28-29) → mechanical_systems table (continued)
  28: { table: 'mechanical_systems', stepKey: 'step7', formType: 'mechanical_systems', formStep: 7 },
  29: { table: 'mechanical_systems', stepKey: 'step8', formType: 'mechanical_systems', formStep: 8 },
};

// Section titles for display
const SECTION_TITLES: Record<number, string> = {
  13: 'Access & Egress',
  14: 'Paving & Parking',
  15: 'Flatwork',
  16: 'Landscaping',
  17: 'Ancillary Structures',
  18: 'Foundation',
  19: 'Building Frame',
  20: 'Facades',
  21: 'Roofing',
  22: 'HVAC',
  23: 'Electrical',
  24: 'Plumbing',
  25: 'Elevators',
  26: 'Common Areas',
  27: 'Tenant Spaces',
  28: 'Sprinklers',
  29: 'Alarm Systems',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform raw JSONB data into FieldInspectionItem format
 */
function transformToFieldItems(data: Record<string, unknown>, sectionTitle: string): FieldInspectionItem[] {
  const items: FieldInspectionItem[] = [];

  // Try to extract common field patterns from mobile app data
  // The mobile app stores data in various formats, we'll try to normalize

  // Check for observation/assessment objects
  if (data.observation || data.assessment || data.inspection) {
    const obs = (data.observation || data.assessment || data.inspection) as Record<string, unknown>;
    
    const item: FieldInspectionItem = {
      id: `item-${Date.now()}`,
      title: sectionTitle,
      typeLabel: 'Type',
      types: extractTypes(obs),
      condition: extractCondition(obs),
      repairStatus: extractRepairStatus(obs),
      repairAmount: extractRepairAmount(obs),
    };
    
    if (item.types.length > 0 || item.condition) {
      items.push(item);
    }
  }

  // Check for direct condition/type fields
  if (data.condition || data.type || data.types || data.materials) {
    const item: FieldInspectionItem = {
      id: `item-direct-${Date.now()}`,
      title: sectionTitle,
      typeLabel: 'Materials/Type',
      types: extractTypes(data),
      condition: extractCondition(data),
      repairStatus: extractRepairStatus(data),
      repairAmount: extractRepairAmount(data),
    };

    if (item.types.length > 0 || item.condition) {
      items.push(item);
    }
  }

  // Check for array of items (some mobile forms have multiple entries)
  if (Array.isArray(data.items)) {
    for (const entry of data.items) {
      if (typeof entry === 'object' && entry !== null) {
        const entryData = entry as Record<string, unknown>;
        items.push({
          id: `item-${items.length}-${Date.now()}`,
          title: (entryData.name as string) || (entryData.title as string) || sectionTitle,
          typeLabel: 'Type',
          types: extractTypes(entryData),
          condition: extractCondition(entryData),
          repairStatus: extractRepairStatus(entryData),
          repairAmount: extractRepairAmount(entryData),
        });
      }
    }
  }

  return items;
}

function extractTypes(data: Record<string, unknown>): string[] {
  const types: string[] = [];

  // Check various field patterns
  const typeFields = ['type', 'types', 'materials', 'material', 'surfaceType', 'roofType', 'wallType'];
  
  for (const field of typeFields) {
    const value = data[field];
    if (typeof value === 'string' && value.trim()) {
      types.push(value.trim());
    } else if (Array.isArray(value)) {
      types.push(...value.filter(v => typeof v === 'string' && v.trim()));
    }
  }

  return [...new Set(types)]; // Remove duplicates
}

function extractCondition(data: Record<string, unknown>): ConditionRating {
  const conditionFields = ['condition', 'overallCondition', 'rating'];
  
  for (const field of conditionFields) {
    const value = data[field];
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized.includes('good')) return 'Good';
      if (normalized.includes('fair')) return 'Fair';
      if (normalized.includes('poor')) return 'Poor';
    }
  }
  
  return null;
}

function extractRepairStatus(data: Record<string, unknown>): RepairStatus {
  const statusFields = ['repairStatus', 'status', 'priority', 'repairPriority'];
  
  for (const field of statusFields) {
    const value = data[field];
    if (typeof value === 'string') {
      const upper = value.toUpperCase();
      if (upper === 'IR' || upper.includes('IMMEDIATE')) return 'IR';
      if (upper === 'ST' || upper.includes('SHORT')) return 'ST';
      if (upper === 'LT' || upper.includes('LONG')) return 'LT';
      if (upper === 'RM' || upper.includes('ROUTINE') || upper.includes('MAINTENANCE')) return 'RM';
      if (upper === 'NA' || upper.includes('NOT APPLICABLE')) return 'NA';
    }
  }
  
  return null;
}

function extractRepairAmount(data: Record<string, unknown>): number | null {
  const amountFields = ['repairAmount', 'estimatedCost', 'cost', 'amount', 'repairCost'];
  
  for (const field of amountFields) {
    const value = data[field];
    if (typeof value === 'number' && value > 0) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  
  return null;
}

function extractObservations(data: Record<string, unknown>): string {
  const obsFields = ['observations', 'notes', 'comments', 'description', 'remarks'];
  
  for (const field of obsFields) {
    const value = data[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  
  return '';
}

// ============================================================================
// Main Composable
// ============================================================================

export function useFieldNotes(
  reportId: Ref<string>,
  currentStep: Ref<number>
) {
  const fieldNotes = ref<FieldNoteData | null>(null);
  const photos = ref<FieldPhoto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sourceAssessmentId = ref<string | null>(null);
  const hasFieldNotes = ref(false);

  /**
   * Check if current step has field notes (steps 13-29)
   */
  function stepHasFieldNotes(step: number): boolean {
    return STEP_MAPPING[step] !== null;
  }

  /**
   * Fetch source assessment ID from report
   */
  async function fetchSourceAssessmentId(): Promise<string | null> {
    if (!reportId.value || reportId.value === 'demo') {
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('source_assessment_id')
        .eq('id', reportId.value)
        .single();

      if (fetchError) throw fetchError;
      return data?.source_assessment_id || null;
    } catch (err) {
      console.error('Error fetching source assessment:', err);
      return null;
    }
  }

  /**
   * Fetch field notes for current step
   */
  async function fetchFieldNotes() {
    const step = currentStep.value;
    const mapping = STEP_MAPPING[step];

    // Reset state
    fieldNotes.value = null;
    photos.value = [];
    hasFieldNotes.value = stepHasFieldNotes(step);

    // No field notes for property info sections (steps 1-12)
    if (!mapping) {
      loading.value = false;
      return;
    }

    // Demo mode - no data to fetch
    if (!reportId.value || reportId.value === 'demo') {
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Get source assessment ID if not cached
      if (!sourceAssessmentId.value) {
        sourceAssessmentId.value = await fetchSourceAssessmentId();
      }

      if (!sourceAssessmentId.value) {
        // No linked mobile assessment
        loading.value = false;
        return;
      }

      // Fetch mobile data from the appropriate table
      const { data: mobileData, error: mobileError } = await supabase
        .from(mapping.table)
        .select('*')
        .eq('assessment_id', sourceAssessmentId.value)
        .maybeSingle();

      if (mobileError) throw mobileError;

      // Fetch photos for this section
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, notes, captured_at, filename')
        .eq('assessment_id', sourceAssessmentId.value)
        .eq('form_type', mapping.formType)
        .eq('form_step', mapping.formStep)
        .order('captured_at', { ascending: false });

      if (photoError) throw photoError;

      photos.value = (photoData || []) as FieldPhoto[];

      // Extract and transform the step data
      if (mobileData && mobileData[mapping.stepKey]) {
        const stepData = mobileData[mapping.stepKey] as Record<string, unknown>;
        const sectionTitle = SECTION_TITLES[step] || `Step ${step}`;

        // Fetch inspector info from project_summaries
        const { data: projectData } = await supabase
          .from('project_summaries')
          .select('inspector_name, inspection_date')
          .eq('assessment_id', sourceAssessmentId.value)
          .maybeSingle();

        const items = transformToFieldItems(stepData, sectionTitle);
        const observations = extractObservations(stepData);

        fieldNotes.value = {
          sectionId: `step-${step}`,
          inspector: projectData?.inspector_name || 'Field Assessor',
          inspectionDate: projectData?.inspection_date
            ? new Date(projectData.inspection_date).toLocaleDateString()
            : 'Date not recorded',
          location: sectionTitle,
          items,
          observations,
          photoCount: photos.value.length,
        };
      }
    } catch (err) {
      console.error('Error fetching field notes:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load field notes';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get public URL for a photo
   */
  function getPhotoUrl(storagePath: string): string {
    const { data } = supabase.storage.from('photos').getPublicUrl(storagePath);
    return data.publicUrl;
  }

  /**
   * Get thumbnail URL for a photo
   */
  function getThumbnailUrl(photo: FieldPhoto): string {
    const path = photo.thumbnail_path || photo.storage_path;
    return getPhotoUrl(path);
  }

  // Watch for step changes and refetch
  watch(
    [reportId, currentStep],
    () => {
      fetchFieldNotes();
    },
    { immediate: true }
  );

  return {
    // State
    fieldNotes,
    photos,
    loading,
    error,
    hasFieldNotes,
    sourceAssessmentId,

    // Methods
    fetchFieldNotes,
    stepHasFieldNotes,
    getPhotoUrl,
    getThumbnailUrl,
  };
}
