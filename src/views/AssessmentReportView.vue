<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarNavigation from '@/components/SidebarNavigation.vue';
import AssessorNotesPanel from '@/components/AssessorNotesPanel.vue';
import DynamicReportSection from '@/components/DynamicReportSection.vue';
import { useReportForm } from '@/composables/useReportForm';
import { useTheme } from '@/composables/useTheme';
import type { SectionConfig, BlockType, FormData } from '@/types/section';
import type { NavSection } from '@/components/SidebarNavigation.vue';

// Import all section configs from group1
import { 
  // Section 5: Site & Grounds
  accessEgress,
  pavingCurbingParking,
  flatwork,
  landscapingAppurtenances,
  ancillaryStructures,
  // Section 6: Building Envelope
  foundation,
  buildingFrame,
  facadesCurtainWall,
  roofing,
  // Section 7: Mechanical Systems
  heatingAndCooling,
  electrical,
  plumbing,
  elevatorsAndEscalators,
  // Section 8: Interior Elements
  commonAreas,
  tenantSpaces,
  // Section 9: Fire Protection
  sprinklersAndStandpipes,
  alarmSystems,
} from '@/data/templates/group1';

const route = useRoute();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

const assessmentId = computed(() => (route.params.id as string) || 'demo');
const isDemoMode = computed(() => assessmentId.value === 'demo');

// Map step numbers to section configs
// Total: 17 steps across 5 major sections
const allSectionConfigs: Record<number, { id: string; title: string; config: SectionConfig }> = {
  // Section 5: Site & Grounds (5 steps)
  1:  { id: '5.2', title: 'Access & Egress', config: accessEgress as SectionConfig },
  2:  { id: '5.3', title: 'Paving, Curbing & Parking', config: pavingCurbingParking as SectionConfig },
  3:  { id: '5.4', title: 'Flatwork', config: flatwork as SectionConfig },
  4:  { id: '5.5', title: 'Landscaping & Appurtenances', config: landscapingAppurtenances as SectionConfig },
  5:  { id: '5.6', title: 'Ancillary Structures', config: ancillaryStructures as SectionConfig },
  // Section 6: Building Envelope (4 steps)
  6:  { id: '6.1', title: 'Foundation', config: foundation as SectionConfig },
  7:  { id: '6.2', title: 'Building Frame', config: buildingFrame as SectionConfig },
  8:  { id: '6.3', title: 'Facades & Curtain Wall', config: facadesCurtainWall as SectionConfig },
  9:  { id: '6.4', title: 'Roofing', config: roofing as SectionConfig },
  // Section 7: Mechanical Systems (4 steps)
  10: { id: '7.1', title: 'Heating & Cooling', config: heatingAndCooling as SectionConfig },
  11: { id: '7.2', title: 'Electrical', config: electrical as SectionConfig },
  12: { id: '7.3', title: 'Plumbing', config: plumbing as SectionConfig },
  13: { id: '7.4', title: 'Elevators & Escalators', config: elevatorsAndEscalators as SectionConfig },
  // Section 8: Interior Elements (2 steps)
  14: { id: '8.1', title: 'Common Areas', config: commonAreas as SectionConfig },
  15: { id: '8.2', title: 'Tenant Spaces', config: tenantSpaces as SectionConfig },
  // Section 9: Fire Protection (2 steps)
  16: { id: '9.1', title: 'Sprinklers & Standpipes', config: sprinklersAndStandpipes as SectionConfig },
  17: { id: '9.2', title: 'Alarm Systems', config: alarmSystems as SectionConfig },
};

// Navigation structure for sidebar
const navSections: NavSection[] = [
  {
    id: 'section-5',
    title: 'Section 5: Site & Grounds',
    subsections: [
      { id: '5.2', title: '5.2 Access & Egress', step: 1 },
      { id: '5.3', title: '5.3 Paving & Parking', step: 2 },
      { id: '5.4', title: '5.4 Flatwork', step: 3 },
      { id: '5.5', title: '5.5 Landscaping', step: 4 },
      { id: '5.6', title: '5.6 Ancillary Structures', step: 5 },
    ],
  },
  {
    id: 'section-6',
    title: 'Section 6: Building Envelope',
    subsections: [
      { id: '6.1', title: '6.1 Foundation', step: 6 },
      { id: '6.2', title: '6.2 Building Frame', step: 7 },
      { id: '6.3', title: '6.3 Facades', step: 8 },
      { id: '6.4', title: '6.4 Roofing', step: 9 },
    ],
  },
  {
    id: 'section-7',
    title: 'Section 7: Mechanical Systems',
    subsections: [
      { id: '7.1', title: '7.1 HVAC', step: 10 },
      { id: '7.2', title: '7.2 Electrical', step: 11 },
      { id: '7.3', title: '7.3 Plumbing', step: 12 },
      { id: '7.4', title: '7.4 Elevators', step: 13 },
    ],
  },
  {
    id: 'section-8',
    title: 'Section 8: Interior Elements',
    subsections: [
      { id: '8.1', title: '8.1 Common Areas', step: 14 },
      { id: '8.2', title: '8.2 Tenant Spaces', step: 15 },
    ],
  },
  {
    id: 'section-9',
    title: 'Section 9: Fire Protection',
    subsections: [
      { id: '9.1', title: '9.1 Sprinklers', step: 16 },
      { id: '9.2', title: '9.2 Alarms', step: 17 },
    ],
  },
];

const TOTAL_STEPS = 17;

// Determine which Supabase table to use based on current step
function getTableForStep(step: number): string {
  if (step <= 5) return 'site_grounds';
  if (step <= 9) return 'building_envelope';
  return 'mechanical_systems'; // Sections 7, 8, 9
}

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
  tableName: getTableForStep(1), // Will be dynamically updated
  autoSaveDelay: 2000,
});

const currentConfig = computed(() => allSectionConfigs[currentStep.value]);

const currentSectionId = computed(() => {
  for (const section of navSections) {
    const found = section.subsections.find((sub) => sub.step === currentStep.value);
    if (found) return section.id;
  }
  return '';
});

const completedSteps = ref<Set<number>>(new Set());
const isNotesPanelCollapsed = ref(false);

function handleSectionUpdate(data: Record<BlockType, FormData>) {
  currentStepData.value = data;
}

function handleNavigate(sectionId: string, step: number) {
  if (currentStepData.value && Object.keys(currentStepData.value).length > 0) {
    completedSteps.value.add(currentStep.value);
  }
  goToStep(step);
}

function handleNext() {
  completedSteps.value.add(currentStep.value);
  if (currentStep.value < TOTAL_STEPS) {
    nextStep();
  } else {
    forceSave();
    router.push('/');
  }
}

function handlePrev() {
  prevStep();
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (isDirty.value) {
      forceSave();
    }
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight' && currentStep.value < TOTAL_STEPS) {
    event.preventDefault();
    handleNext();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft' && currentStep.value > 1) {
    event.preventDefault();
    handlePrev();
  }
}

onMounted(async () => {
  const configs = Object.values(allSectionConfigs).map((c) => c.config);
  totalSteps.value = TOTAL_STEPS;
  initializeForm(configs);
  
  if (!isDemoMode.value) {
    await loadFromSupabase();
  }

  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener('keydown', handleKeydown);
});

const lastSavedText = computed(() => {
  if (!lastSaved.value) return null;
  const now = new Date();
  const diff = now.getTime() - lastSaved.value.getTime();
  if (diff < 60000) return 'Saved just now';
  if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
  return `Saved at ${lastSaved.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
});

watch(isDirty, (dirty) => {
  if (dirty) {
    window.onbeforeunload = () => true;
  } else {
    window.onbeforeunload = null;
  }
});

// Calculate completion percentage
const completionPercentage = computed(() => {
  return Math.round((completedSteps.value.size / TOTAL_STEPS) * 100);
});
</script>

<template>
  <div 
    class="report-view h-screen flex flex-col transition-colors duration-300"
    :class="theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-100 text-slate-900'"
  >
    <!-- Skip link -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>

    <!-- Header -->
    <header 
      class="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b transition-colors duration-300"
      :class="theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
    >
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          :class="theme === 'dark' ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'"
          aria-label="Back to dashboard"
          @click="router.push('/')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div class="flex items-center gap-3">
          <h1 
            class="text-base font-semibold"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Property Condition Assessment
          </h1>
          <span 
            v-if="isDemoMode" 
            class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border"
            :class="theme === 'dark' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'"
          >
            Demo Mode
          </span>
          <span 
            v-if="completionPercentage > 0"
            class="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium rounded"
            :class="theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'"
          >
            {{ completionPercentage }}% complete
          </span>
        </div>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button
          type="button"
          @click="toggleTheme"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          :class="theme === 'dark' ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="theme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Save status -->
        <div class="flex items-center gap-2 text-sm">
          <span 
            v-if="saving" 
            class="flex items-center gap-2"
            :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
          >
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Saving...</span>
          </span>
          <span 
            v-else-if="lastSavedText" 
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ lastSavedText }}
          </span>
          <span v-else-if="isDirty" class="flex items-center gap-1.5 text-amber-500">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full" aria-hidden="true" />
            Unsaved changes
          </span>
        </div>

        <!-- Save button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :class="[
            isDirty && !isDemoMode
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : theme === 'dark'
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
        class="flex-1 overflow-y-auto transition-colors duration-300"
        :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-white'"
        tabindex="-1"
      >
        <div v-if="loading" class="h-full flex items-center justify-center" role="status" aria-live="polite">
          <div class="text-center">
            <svg 
              class="w-8 h-8 mx-auto animate-spin"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p 
              class="mt-3 text-sm"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Loading section data...
            </p>
          </div>
        </div>

        <div v-else-if="error && !isDemoMode" class="h-full flex items-center justify-center p-6" role="alert">
          <div class="max-w-md text-center">
            <div class="w-12 h-12 mx-auto flex items-center justify-center bg-red-500/10 rounded-full mb-4">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 
              class="text-lg font-semibold mb-2"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              Failed to load data
            </h2>
            <p 
              class="text-sm mb-6"
              :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
            >
              {{ error }}
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
              @click="loadFromSupabase"
            >
              Try again
            </button>
          </div>
        </div>

        <div v-else class="max-w-4xl mx-auto px-6 py-8">
          <div class="mb-8">
            <div 
              class="flex items-center gap-2 text-sm mb-2"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              <span>Section {{ currentConfig?.id }}</span>
              <span aria-hidden="true">•</span>
              <span>Step {{ currentStep }} of {{ TOTAL_STEPS }}</span>
            </div>
            <h2 
              class="text-2xl font-bold"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              {{ currentConfig?.title }}
            </h2>
          </div>

          <DynamicReportSection
            v-if="currentConfig"
            :config="currentConfig.config"
            :model-value="(currentStepData as Record<BlockType, FormData>)"
            @update:model-value="handleSectionUpdate"
          />

          <nav 
            class="flex items-center justify-between mt-10 pt-6 border-t"
            :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
            aria-label="Section navigation"
          >
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="theme === 'dark' 
                ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
              :disabled="currentStep === 1"
              @click="handlePrev"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div 
              class="hidden md:flex items-center gap-4 text-xs"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              <span class="flex items-center gap-1">
                <kbd 
                  class="px-1.5 py-0.5 rounded"
                  :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'"
                >
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd 
                  class="px-1.5 py-0.5 rounded"
                  :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'"
                >
                  ←
                </kbd>
                <kbd 
                  class="px-1.5 py-0.5 rounded"
                  :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'"
                >
                  →
                </kbd>
                <span class="ml-1">Navigate</span>
              </span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              @click="handleNext"
            >
              {{ currentStep === TOTAL_STEPS ? 'Complete' : 'Continue' }}
              <svg v-if="currentStep !== TOTAL_STEPS" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </nav>
        </div>
      </main>

      <AssessorNotesPanel
        :is-collapsed="isNotesPanelCollapsed"
        :current-section-id="currentConfig?.id"
        @toggle-collapse="isNotesPanelCollapsed = !isNotesPanelCollapsed"
      />
    </div>
  </div>
</template>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
}
</style>
