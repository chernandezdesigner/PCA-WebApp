<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarNavigation from '@/components/SidebarNavigation.vue';
import AssessorNotesPanel from '@/components/AssessorNotesPanel.vue';
import DynamicReportSection from '@/components/DynamicReportSection.vue';
import { useReportForm } from '@/composables/useReportForm';
import type { SectionConfig, BlockType, FormData } from '@/types/section';
import type { NavSection } from '@/components/SidebarNavigation.vue';

// Import Section configs
import { 
  foundation,
  buildingFrame,
  facadesCurtainWall,
  roofing,
  heatingAndCooling
} from '@/data/templates/group1';

const route = useRoute();
const router = useRouter();

// Get assessment ID from route
const assessmentId = computed(() => (route.params.id as string) || 'demo');

// All section configurations mapped by step number
const allSectionConfigs: Record<number, { id: string; title: string; config: SectionConfig }> = {
  1: { id: '6.1', title: 'Foundation', config: foundation },
  2: { id: '6.2', title: 'Building Frame', config: buildingFrame },
  3: { id: '6.3', title: 'Facades & Curtain Wall', config: facadesCurtainWall },
  4: { id: '6.4', title: 'Roofing', config: roofing },
  5: { id: '7.1', title: 'Heating & Cooling', config: heatingAndCooling },
};

// Navigation structure
const navSections: NavSection[] = [
  {
    id: 'section-6',
    title: 'Section 6: Building Envelope',
    subsections: [
      { id: '6.1', title: '6.1 Foundation', step: 1 },
      { id: '6.2', title: '6.2 Building Frame', step: 2 },
      { id: '6.3', title: '6.3 Facades & Curtain Wall', step: 3 },
      { id: '6.4', title: '6.4 Roofing', step: 4 },
    ],
  },
  {
    id: 'section-7',
    title: 'Section 7: MEP Systems',
    subsections: [
      { id: '7.1', title: '7.1 Heating & Cooling', step: 5 },
      { id: '7.2', title: '7.2 Plumbing', step: 6 },
      { id: '7.3', title: '7.3 Electrical', step: 7 },
      { id: '7.4', title: '7.4 Fire Protection', step: 8 },
    ],
  },
  {
    id: 'section-8',
    title: 'Section 8: Interior Elements',
    subsections: [
      { id: '8.1', title: '8.1 Common Areas', step: 9 },
      { id: '8.2', title: '8.2 Tenant Spaces', step: 10 },
      { id: '8.3', title: '8.3 Amenities', step: 11 },
    ],
  },
  {
    id: 'section-9',
    title: 'Section 9: Other',
    subsections: [
      { id: '9.1', title: '9.1 ADA Compliance', step: 12 },
      { id: '9.2', title: '9.2 Environmental', step: 13 },
    ],
  },
];

const totalStepsCount = computed(() => 
  navSections.reduce((acc, section) => acc + section.subsections.length, 0)
);

// Form composable
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
  tableName: 'building_envelope',
  autoSaveDelay: 2000,
});

// Current config
const currentConfig = computed(() => allSectionConfigs[currentStep.value]);

// Current section ID
const currentSectionId = computed(() => {
  for (const section of navSections) {
    const found = section.subsections.find((sub) => sub.step === currentStep.value);
    if (found) return section.id;
  }
  return '';
});

// Completed steps
const completedSteps = ref<Set<number>>(new Set());

// Notes panel state
const isNotesPanelCollapsed = ref(false);

// Handle section data update
function handleSectionUpdate(data: Record<BlockType, FormData>) {
  currentStepData.value = data;
}

// Handle sidebar navigation
function handleNavigate(sectionId: string, step: number) {
  if (currentStepData.value && Object.keys(currentStepData.value).length > 0) {
    completedSteps.value.add(currentStep.value);
  }
  goToStep(step);
}

// Navigation
function handleNext() {
  completedSteps.value.add(currentStep.value);
  if (currentStep.value < totalStepsCount.value) {
    nextStep();
  } else {
    forceSave();
    router.push('/');
  }
}

function handlePrev() {
  prevStep();
}

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Ctrl/Cmd + S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (isDirty.value) {
      forceSave();
    }
  }
  // Ctrl/Cmd + Arrow for navigation
  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight' && currentStep.value < totalStepsCount.value) {
    event.preventDefault();
    handleNext();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft' && currentStep.value > 1) {
    event.preventDefault();
    handlePrev();
  }
}

// Lifecycle
onMounted(async () => {
  const configs = Object.values(allSectionConfigs).map((c) => c.config);
  totalSteps.value = totalStepsCount.value;
  initializeForm(configs);
  
  if (assessmentId.value !== 'demo') {
    await loadFromSupabase();
  }

  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener('keydown', handleKeydown);
});

// Format last saved
const lastSavedText = computed(() => {
  if (!lastSaved.value) return null;
  const now = new Date();
  const diff = now.getTime() - lastSaved.value.getTime();
  if (diff < 60000) return 'Saved just now';
  if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
  return `Saved at ${lastSaved.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
});

const isDemoMode = computed(() => assessmentId.value === 'demo');

// Warn before leaving with unsaved changes
watch(isDirty, (dirty) => {
  if (dirty) {
    window.onbeforeunload = () => true;
  } else {
    window.onbeforeunload = null;
  }
});
</script>

<template>
  <div class="report-view h-screen flex flex-col bg-zinc-950 text-zinc-100">
    <!-- Skip link for accessibility -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>

    <!-- Header -->
    <header class="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div class="flex items-center gap-4">
        <!-- Back button -->
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Back to dashboard"
          @click="router.push('/')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <!-- Title -->
        <div class="flex items-center gap-3">
          <h1 class="text-base font-semibold text-zinc-100">
            Property Condition Assessment
          </h1>
          <span 
            v-if="isDemoMode" 
            class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded"
          >
            Demo Mode
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Save status -->
        <div class="flex items-center gap-2 text-sm">
          <span v-if="saving" class="flex items-center gap-2 text-zinc-400">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Saving...</span>
          </span>
          <span v-else-if="lastSavedText" class="text-zinc-500">
            {{ lastSavedText }}
          </span>
          <span v-else-if="isDirty" class="flex items-center gap-1.5 text-amber-400">
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true" />
            Unsaved changes
          </span>
        </div>

        <!-- Save button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          :class="[
            isDirty && !isDemoMode
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
          ]"
          :disabled="!isDirty || isDemoMode || saving"
          :aria-busy="saving"
          @click="forceSave"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
      </div>
    </header>

    <!-- Main layout -->
    <div class="flex-1 flex min-h-0">
      <!-- Sidebar Navigation -->
      <SidebarNavigation
        :sections="navSections"
        :current-section="currentSectionId"
        :current-step="currentStep"
        :completed-steps="completedSteps"
        @navigate="handleNavigate"
      />

      <!-- Main Content -->
      <main 
        id="main-content"
        class="flex-1 overflow-y-auto bg-zinc-900"
        tabindex="-1"
      >
        <!-- Loading state -->
        <div 
          v-if="loading" 
          class="h-full flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto text-zinc-600 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="mt-3 text-sm text-zinc-500">Loading section data...</p>
          </div>
        </div>

        <!-- Error state -->
        <div 
          v-else-if="error && !isDemoMode" 
          class="h-full flex items-center justify-center p-6"
          role="alert"
        >
          <div class="max-w-md text-center">
            <div class="w-12 h-12 mx-auto flex items-center justify-center bg-red-500/10 rounded-full mb-4">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-zinc-100 mb-2">Failed to load data</h2>
            <p class="text-sm text-zinc-400 mb-6">{{ error }}</p>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="loadFromSupabase"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="max-w-4xl mx-auto px-6 py-8">
          <!-- Section header -->
          <div class="mb-8">
            <div class="flex items-center gap-2 text-sm text-zinc-500 mb-2">
              <span>Section {{ currentConfig?.id }}</span>
              <span aria-hidden="true">•</span>
              <span>Step {{ currentStep }} of {{ totalStepsCount }}</span>
            </div>
            <h2 class="text-2xl font-bold text-zinc-100">
              {{ currentConfig?.title }}
            </h2>
          </div>

          <!-- Form -->
          <DynamicReportSection
            v-if="currentConfig"
            :config="currentConfig.config"
            :model-value="(currentStepData as Record<BlockType, FormData>)"
            @update:model-value="handleSectionUpdate"
          />

          <!-- Navigation footer -->
          <nav 
            class="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800"
            aria-label="Section navigation"
          >
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              :disabled="currentStep === 1"
              @click="handlePrev"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <!-- Keyboard hint -->
            <div class="hidden md:flex items-center gap-4 text-xs text-zinc-600">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Ctrl</kbd>
                <span>+</span>
                <kbd class="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">←</kbd>
                <kbd class="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">→</kbd>
                <span class="ml-1">Navigate</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Ctrl</kbd>
                <span>+</span>
                <kbd class="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">S</kbd>
                <span class="ml-1">Save</span>
              </span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              @click="handleNext"
            >
              {{ currentStep === totalStepsCount ? 'Complete' : 'Continue' }}
              <svg v-if="currentStep !== totalStepsCount" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </nav>
        </div>
      </main>

      <!-- Assessor Notes Panel -->
      <AssessorNotesPanel
        :is-collapsed="isNotesPanelCollapsed"
        :current-section-id="currentConfig?.id"
        @toggle-collapse="isNotesPanelCollapsed = !isNotesPanelCollapsed"
      />
    </div>
  </div>
</template>

<style scoped>
.report-view {
  /* Prevent content shift when scrollbar appears */
  scrollbar-gutter: stable;
}

/* Smooth scroll for main content */
main {
  scroll-behavior: smooth;
}

/* Custom scrollbar for main content */
main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* Keyboard shortcuts styling */
kbd {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
}

/* Focus visible utility for browsers that don't support :focus-visible */
@supports not selector(:focus-visible) {
  button:focus,
  a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
}
</style>
