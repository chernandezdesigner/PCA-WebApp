import { ref, computed, watch } from 'vue';
import { supabase } from '@/services/supabase';
import type { SectionConfig, FormData, BlockType, FieldConfig } from '@/types/section';
import { BLOCK_TYPES } from '@/types/section';

interface ReportFormOptions {
  assessmentId: string;
  tableName: string; // e.g., 'site_grounds', 'building_envelope'
  autoSaveDelay?: number; // ms, default 2000
}

interface StepData {
  [blockType: string]: FormData;
}

export function useReportForm(options: ReportFormOptions) {
  const { assessmentId, tableName, autoSaveDelay = 2000 } = options;

  // State
  const currentStep = ref(1);
  const totalSteps = ref(1);
  const formData = ref<Record<number, StepData>>({});
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const lastSaved = ref<Date | null>(null);
  const isDirty = ref(false);

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize form data for a section config
  function initializeSectionData(config: SectionConfig): StepData {
    const data: StepData = {};

    for (const block of BLOCK_TYPES) {
      const fields = config[block];
      if (Array.isArray(fields)) {
        data[block] = {};
        for (const field of fields) {
          data[block][field.id] = getDefaultValue(field);
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
    if (!isDirty.value) return;

    saving.value = true;
    error.value = null;

    try {
      // Build the update object with step data as JSONB
      const updateData: Record<string, unknown> = {
        current_step: currentStep.value,
        last_modified: new Date().toISOString(),
      };

      // Add each step's data
      for (const [stepNum, stepData] of Object.entries(formData.value)) {
        updateData[`step${stepNum}`] = stepData;
      }

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('assessment_id', assessmentId);

      if (updateError) {
        throw updateError;
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
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Load step data
        for (let i = 1; i <= 10; i++) {
          const stepKey = `step${i}`;
          if (data[stepKey]) {
            formData.value[i] = data[stepKey] as StepData;
          }
        }

        // Load current step
        if (data.current_step) {
          currentStep.value = data.current_step;
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
    formData.value[step][block][fieldId] = value;
    isDirty.value = true;
    scheduleAutoSave();
  }

  // Get a specific field value
  function getFieldValue(step: number, block: BlockType, fieldId: string): string | null {
    return formData.value[step]?.[block]?.[fieldId] ?? null;
  }

  // Cleanup
  function cleanup() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    // Final save if dirty
    if (isDirty.value) {
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

    // Methods
    initializeForm,
    initializeSectionData,
    nextStep,
    prevStep,
    goToStep,
    loadFromSupabase,
    saveToSupabase,
    forceSave,
    updateField,
    getFieldValue,
    cleanup,
  };
}
