import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { SectionConfig, FormData, BlockType, FieldConfig } from '@/types/section';
import { BLOCK_TYPES } from '@/types/section';
import type { ReportContentRow, ReportContentUpdate, SectionData, ReportStatus } from '@/types/database';

interface WebReportFormOptions {
  reportId: string;
  autoSaveDelay?: number;
  isDemo?: boolean;
}

interface StepData {
  [key: string]: FormData | unknown;
}

// Map step numbers to section column names
const STEP_TO_SECTION: Record<number, keyof ReportContentRow> = {
  // Section 1: Summary (steps 1-6)
  1: 'section_1_summary',
  2: 'section_1_summary',
  3: 'section_1_summary',
  4: 'section_1_summary',
  5: 'section_1_summary',
  6: 'section_1_summary',
  // Section 2: Introduction (step 7)
  7: 'section_2_introduction',
  // Section 3: Property (steps 8-10)
  8: 'section_3_property',
  9: 'section_3_property',
  10: 'section_3_property',
  // Section 4: Documents (steps 11-15)
  11: 'section_4_documents',
  12: 'section_4_documents',
  13: 'section_4_documents',
  14: 'section_4_documents',
  15: 'section_4_documents',
  // Section 5: Site & Grounds (steps 16-20)
  16: 'section_5_site_grounds',
  17: 'section_5_site_grounds',
  18: 'section_5_site_grounds',
  19: 'section_5_site_grounds',
  20: 'section_5_site_grounds',
  // Section 6: Building Envelope (steps 21-24)
  21: 'section_6_building_envelope',
  22: 'section_6_building_envelope',
  23: 'section_6_building_envelope',
  24: 'section_6_building_envelope',
  // Section 7: Mechanical (steps 25-28)
  25: 'section_7_mechanical',
  26: 'section_7_mechanical',
  27: 'section_7_mechanical',
  28: 'section_7_mechanical',
  // Section 8: Interior (steps 29-30)
  29: 'section_8_interior',
  30: 'section_8_interior',
  // Section 9: Fire Protection (steps 31-32)
  31: 'section_9_fire_protection',
  32: 'section_9_fire_protection',
  // Section 10: Additional Considerations (steps 33-35)
  33: 'section_10_additional',
  34: 'section_10_additional',
  35: 'section_10_additional',
  // Appendices (step 36)
  36: 'appendices',
};

// Map step numbers to their key within the section
const STEP_TO_KEY: Record<number, string> = {
  1: 'step_1', 2: 'step_2', 3: 'step_3', 4: 'step_4', 5: 'step_5', 6: 'step_6',
  7: 'step_7',
  8: 'step_8', 9: 'step_9', 10: 'step_10',
  11: 'step_11', 12: 'step_12', 13: 'step_13', 14: 'step_14', 15: 'step_15',
  16: 'step_16', 17: 'step_17', 18: 'step_18', 19: 'step_19', 20: 'step_20',
  21: 'step_21', 22: 'step_22', 23: 'step_23', 24: 'step_24',
  25: 'step_25', 26: 'step_26', 27: 'step_27', 28: 'step_28',
  29: 'step_29', 30: 'step_30',
  31: 'step_31', 32: 'step_32',
  33: 'step_33', 34: 'step_34', 35: 'step_35',
  36: 'step_36',
};

export function useWebReportForm(options: WebReportFormOptions) {
  const { reportId, autoSaveDelay = 2000 } = options;
  
  // Demo mode: skip all database operations
  const isDemo = options.isDemo ?? reportId === 'demo' ?? !reportId;

  // State
  const currentStep = ref(1);
  const totalSteps = ref(30);
  const formData = ref<Record<number, StepData>>({});
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const lastSaved = ref<Date | null>(null);
  const isDirty = ref(false);
  const completedSteps = ref<Set<number>>(new Set());
  const reportStatus = ref<ReportStatus>('draft');

  // Raw section data from database
  const sectionData = ref<Partial<ReportContentRow>>({});

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize form data for a section config
  function initializeSectionData(config: SectionConfig): StepData {
    const data: StepData = {};

    for (const block of BLOCK_TYPES) {
      const fields = config[block];
      if (Array.isArray(fields)) {
        data[block] = {};
        for (const field of fields) {
          (data[block] as FormData)[field.id] = getDefaultValue(field);
        }
      }
    }

    return data;
  }

  // Get default value for a field
  function getDefaultValue(field: FieldConfig): string | null {
    if (field.type === 'textarea' || field.type === 'text') {
      return field.defaultValue ?? null;
    }
    if (field.type === 'conditional') {
      return getDefaultValue(field.innerField);
    }
    return null;
  }

  // Initialize form with section configs
  function initializeForm(configs: SectionConfig[], startStep = 1) {
    totalSteps.value = configs.length;
    currentStep.value = startStep;

    for (let i = 0; i < configs.length; i++) {
      const stepNum = i + 1;
      if (!formData.value[stepNum]) {
        formData.value[stepNum] = initializeSectionData(configs[i]);
      }
    }
  }

  // Get data for current step
  const currentStepData = computed({
    get: () => formData.value[currentStep.value] || {},
    set: (value: StepData) => {
      formData.value[currentStep.value] = value;
      isDirty.value = true;
      scheduleAutoSave();
    },
  });

  // Navigation
  function nextStep() {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++;
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step;
    }
  }

  // Mark step as completed
  function markStepComplete(step: number) {
    completedSteps.value.add(step);
    scheduleAutoSave();
  }

  // Auto-save logic
  function scheduleAutoSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveToSupabase();
    }, autoSaveDelay);
  }

  // Save to Supabase
  async function saveToSupabase() {
    // Skip database operations in demo mode
    if (isDemo) {
      isDirty.value = false;
      lastSaved.value = new Date();
      return;
    }

    if (!isDirty.value || !reportId) return;

    saving.value = true;
    error.value = null;

    try {
      // Build the section data updates
      const updateData: ReportContentUpdate = {
        current_step: currentStep.value,
        completed_steps: Array.from(completedSteps.value),
        last_modified: new Date().toISOString(),
      };

      // Organize form data by section
      const sections: Record<string, SectionData> = {};

      for (const [stepNumStr, stepData] of Object.entries(formData.value)) {
        const stepNum = parseInt(stepNumStr);
        const sectionKey = STEP_TO_SECTION[stepNum];
        const stepKey = STEP_TO_KEY[stepNum];

        if (sectionKey && stepKey) {
          if (!sections[sectionKey]) {
            // Start with existing data from the database
            sections[sectionKey] = { ...(sectionData.value[sectionKey] as SectionData || {}) };
          }
          sections[sectionKey][stepKey] = stepData;
        }
      }

      // Add sections to update
      for (const [key, value] of Object.entries(sections)) {
        (updateData as Record<string, unknown>)[key] = value;
      }

      const { error: updateError } = await supabase
        .from('report_content')
        .update(updateData)
        .eq('report_id', reportId);

      if (updateError) {
        throw updateError;
      }

      // Update report status to in_progress if it was draft
      if (reportStatus.value === 'draft') {
        await supabase
          .from('reports')
          .update({ status: 'in_progress' })
          .eq('id', reportId);
        reportStatus.value = 'in_progress';
      }

      isDirty.value = false;
      lastSaved.value = new Date();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save';
      console.error('Error saving form:', err);
    } finally {
      saving.value = false;
    }
  }

  // Load from Supabase
  async function loadFromSupabase() {
    // Skip database operations in demo mode
    if (isDemo) {
      loading.value = false;
      return;
    }

    if (!reportId) {
      error.value = 'No report ID provided';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Fetch report and content together
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select(`
          id,
          status,
          report_content (*)
        `)
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw new Error(`Failed to load report: ${reportError.message}`);
      }

      if (!reportData) {
        throw new Error('Report not found');
      }

      // Store report status
      reportStatus.value = reportData.status as ReportStatus;

      // Get content (it's a single object due to UNIQUE constraint)
      const content = reportData.report_content as unknown as ReportContentRow | null;

      if (content) {
        // Store raw section data
        sectionData.value = content;

        // Load current step
        if (content.current_step) {
          currentStep.value = content.current_step;
        }

        // Load completed steps
        if (content.completed_steps && Array.isArray(content.completed_steps)) {
          completedSteps.value = new Set(content.completed_steps);
        }

        // Extract step data from each section
        const allSections = [
          'section_1_summary',
          'section_2_introduction',
          'section_3_property',
          'section_4_documents',
          'section_5_site_grounds',
          'section_6_building_envelope',
          'section_7_mechanical',
          'section_8_interior',
          'section_9_fire_protection',
          'section_10_additional',
          'appendices',
        ] as const;

        for (const sectionKey of allSections) {
          const sectionContent = content[sectionKey] as SectionData | null;
          if (sectionContent) {
            // Extract each step's data from the section
            for (const [key, value] of Object.entries(sectionContent)) {
              if (key.startsWith('step_')) {
                const stepNum = parseInt(key.replace('step_', ''));
                if (!isNaN(stepNum) && value) {
                  formData.value[stepNum] = value as StepData;
                }
              } else {
                // Legacy format: data is directly on the section (from initial creation)
                // Find which step this section belongs to
                for (const [stepStr, secKey] of Object.entries(STEP_TO_SECTION)) {
                  if (secKey === sectionKey) {
                    const stepNum = parseInt(stepStr);
                    if (!formData.value[stepNum]) {
                      formData.value[stepNum] = {};
                    }
                    // Merge the legacy data
                    formData.value[stepNum] = { ...formData.value[stepNum], [key]: value };
                  }
                }
              }
            }
          }
        }
      }

      isDirty.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load';
      console.error('Error loading form:', err);
    } finally {
      loading.value = false;
    }
  }

  // Force save (for manual save button)
  async function forceSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    isDirty.value = true;
    await saveToSupabase();
  }

  // Update a specific field
  function updateField(step: number, block: BlockType, fieldId: string, value: string | null) {
    if (!formData.value[step]) {
      formData.value[step] = {};
    }
    if (!formData.value[step][block]) {
      formData.value[step][block] = {};
    }
    (formData.value[step][block] as FormData)[fieldId] = value;
    isDirty.value = true;
    scheduleAutoSave();
  }

  // Get a specific field value
  function getFieldValue(step: number, block: BlockType, fieldId: string): string | null {
    return (formData.value[step]?.[block] as FormData)?.[fieldId] ?? null;
  }

  // Cleanup
  function cleanup() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    // Final save if dirty (skip in demo mode)
    if (isDirty.value && !isDemo) {
      saveToSupabase();
    }
  }

  return {
    // State
    currentStep,
    totalSteps,
    formData,
    currentStepData,
    loading,
    saving,
    error,
    lastSaved,
    isDirty,
    completedSteps,
    reportStatus,
    isDemo,

    // Methods
    initializeForm,
    initializeSectionData,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    loadFromSupabase,
    saveToSupabase,
    forceSave,
    updateField,
    getFieldValue,
    cleanup,
  };
}
