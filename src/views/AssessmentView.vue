<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TwoPanelLayout from '@/components/TwoPanelLayout.vue';
import DynamicReportSection from '@/components/DynamicReportSection.vue';
import { useReportForm } from '@/composables/useReportForm';
import type { SectionConfig, BlockType, FormData } from '@/types/section';

// Import section configs - adjust these imports based on your actual configs
import { accessEgress, pavingCurbingParking } from '@/data/templates/group1';

const route = useRoute();
const router = useRouter();

// Get assessment ID from route
const assessmentId = computed(() => route.params.id as string);

// Section configurations for each step
// Map your 9 configs to the appropriate steps
const sectionConfigs: { title: string; config: SectionConfig }[] = [
  { title: '5.2 Access & Egress', config: accessEgress },
  { title: '5.3 Paving, Curbing & Parking', config: pavingCurbingParking },
  // Add more sections as needed...
];

// Initialize the form composable
const {
  currentStep,
  totalSteps,
  currentStepData,
  loading,
  saving,
  error,
  lastSaved,
  isDirty,
  initializeForm,
  nextStep,
  prevStep,
  goToStep,
  loadFromSupabase,
  forceSave,
  cleanup,
} = useReportForm({
  assessmentId: assessmentId.value,
  tableName: 'site_grounds', // Adjust based on which table this form uses
  autoSaveDelay: 2000,
});

// Current section config
const currentConfig = computed(() => sectionConfigs[currentStep.value - 1]);

// Step indicator items
const steps = computed(() =>
  sectionConfigs.map((section, index) => ({
    number: index + 1,
    title: section.title,
    isActive: currentStep.value === index + 1,
    isComplete: currentStep.value > index + 1,
  }))
);

// Handle section data update
function handleSectionUpdate(data: Record<BlockType, FormData>) {
  currentStepData.value = data;
}

// Navigation
function handleNext() {
  if (currentStep.value < totalSteps.value) {
    nextStep();
  } else {
    // Complete or submit
    forceSave();
    router.push('/');
  }
}

function handlePrev() {
  prevStep();
}

function handleStepClick(step: number) {
  goToStep(step);
}

// Lifecycle
onMounted(async () => {
  initializeForm(sectionConfigs.map((s) => s.config));
  await loadFromSupabase();
});

onUnmounted(() => {
  cleanup();
});

// Format last saved time
const lastSavedText = computed(() => {
  if (!lastSaved.value) return '';
  return `Last saved: ${lastSaved.value.toLocaleTimeString()}`;
});
</script>

<template>
  <div class="assessment-view h-screen flex flex-col">
    <!-- Header with Step Indicator -->
    <header class="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between mb-3">
        <button
          type="button"
          class="text-gray-600 hover:text-gray-800"
          @click="router.push('/')"
        >
          &larr; Back to Dashboard
        </button>
        
        <div class="flex items-center gap-4">
          <span v-if="saving" class="text-sm text-blue-600">Saving...</span>
          <span v-else-if="lastSavedText" class="text-sm text-gray-500">
            {{ lastSavedText }}
          </span>
          <button
            type="button"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            :disabled="saving || !isDirty"
            @click="forceSave"
          >
            Save
          </button>
        </div>
      </div>

      <!-- Step Indicator -->
      <nav class="step-indicator flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="step in steps"
          :key="step.number"
          type="button"
          :class="[
            'flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            step.isActive
              ? 'bg-blue-600 text-white'
              : step.isComplete
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
          @click="handleStepClick(step.number)"
        >
          <span class="mr-1">{{ step.number }}.</span>
          {{ step.title }}
        </button>
      </nav>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <span class="text-gray-500">Loading...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          @click="loadFromSupabase"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <TwoPanelLayout
      v-else
      class="flex-1"
      left-panel-title="Mobile Reference Data"
      :right-panel-title="currentConfig?.title"
    >
      <template #left-panel>
        <!-- Left panel content - mobile data reference -->
        <div class="text-sm text-gray-600">
          <p class="mb-4">
            Reference data from mobile inspection will appear here.
          </p>
          <!-- Placeholder for mobile data -->
          <div class="p-4 bg-gray-100 rounded-md">
            <p class="text-gray-400 italic">No mobile data available</p>
          </div>
        </div>
      </template>

      <template #right-panel>
        <!-- Dynamic Section Form -->
        <DynamicReportSection
          v-if="currentConfig"
          :config="currentConfig.config"
          :model-value="currentStepData as Record<BlockType, FormData>"
          @update:model-value="handleSectionUpdate"
        />

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            :disabled="currentStep === 1"
            @click="handlePrev"
          >
            &larr; Previous
          </button>

          <span class="text-sm text-gray-500 self-center">
            Step {{ currentStep }} of {{ totalSteps }}
          </span>

          <button
            type="button"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            @click="handleNext"
          >
            {{ currentStep === totalSteps ? 'Complete' : 'Next &rarr;' }}
          </button>
        </div>
      </template>
    </TwoPanelLayout>
  </div>
</template>

<style scoped>
.assessment-view {
  background: #f9fafb;
}

.step-indicator::-webkit-scrollbar {
  height: 4px;
}

.step-indicator::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.step-indicator::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}
</style>
