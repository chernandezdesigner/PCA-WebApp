<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useToast } from '@/composables/useToast';
import { useRoute, useRouter } from 'vue-router';
import SidebarNavigation from '@/components/SidebarNavigation.vue';
import AssessorNotesPanel from '@/components/AssessorNotesPanel.vue';
import PdfExportOverlay from '@/components/PdfExportOverlay.vue';
import { generateReportPdf, validateReportForExport } from '@/services/pdf/pdfGenerationService';
import { postProcessPdf, triggerDownload } from '@/services/pdf/pdfPostProcessor';
import type { ReportMeta } from '@/services/pdf/reportTemplate';
import { withTimeout } from '@/utils/withTimeout';
import { buildPdfFilename } from '@/utils/pdfFilename';
import DynamicReportSection from '@/components/DynamicReportSection.vue';
import PropertyInfoSection from '@/components/PropertyInfoSection.vue';
import AdaChecklistSection from '@/components/AdaChecklistSection.vue';
import ConditionSummarySection from '@/components/ConditionSummarySection.vue';
import CostOpinionSection from '@/components/CostOpinionSection.vue';
import AppendixSection from '@/components/AppendixSection.vue';
import { useWebReportForm } from '@/composables/useWebReportForm';
import { useTheme } from '@/composables/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import type { SectionConfig, PropertyInfoConfig, ChecklistConfig, ConditionSummaryConfig, CostOpinionConfig, AppendixConfig, BlockType, FormData, AnySection } from '@/types/section';
import type { NavSection, NavSubsection } from '@/components/SidebarNavigation.vue';

// Import Section 1-4 configs (group2 - property info style)
import { 
  generalDescription,
  generalPhysicalCondition,
  opinionOfProbableCost,
  recommendations,
  propertyConditionSummary,
  opinionOfProbableCostTable,
  generalPropertyReconnaissanceInformation,
  locationAndDescription,
  tenantAndLeaseInformation,
  utilityAndServiceProviders,
  propertyQuestionnaire,
  interviews,
  buildingAndFireDepartments,
  zoningDepartment,
  previousReports,
} from '@/data/templates/group2';

// Import Section 5-9 configs (group1 - report style)
import { 
  topographyStormwater,
  accessEgress,
  pavingCurbingParking,
  flatwork,
  landscapingAppurtenances,
  ancillaryStructures,
  foundation,
  buildingFrame,
  facadesCurtainWall,
  roofing,
  heatingAndCooling,
  electrical,
  plumbing,
  elevatorsAndEscalators,
  commonAreas,
  tenantSpaces,
  sprinklersAndStandpipes,
  alarmSystems,
  naturalHazards,
  microbialContamination,
  adaScreeningChecklist,
} from '@/data/templates/group1';

const route = useRoute();
const router = useRouter();
const { theme, toggleTheme } = useTheme();
const { showError, showSuccess } = useToast();

// PDF export state
const exportingPdf = ref(false);
const pdfOverlayMessage = ref('Preparing your report...');

const reportId = computed(() => (route.params.id as string) || 'demo');
const isDemoMode = computed(() => reportId.value === 'demo');
const authStore = useAuthStore();
const userId = computed(() => authStore.user?.id || '');

// Section type indicator
type SectionType = 'property-info' | 'report' | 'checklist' | 'condition-summary' | 'cost-opinion' | 'appendix';

// Map step numbers to section configs
const allSectionConfigs: Record<number, { 
  id: string; 
  title: string; 
  config: AnySection;
  type: SectionType;
}> = {
  // Section 1: Summary (6 steps)
  1:  { id: '1.1', title: 'General Description', config: generalDescription as PropertyInfoConfig, type: 'property-info' },
  2:  { id: '1.2', title: 'Physical Condition', config: generalPhysicalCondition as PropertyInfoConfig, type: 'property-info' },
  3:  { id: '1.3', title: 'Probable Cost', config: opinionOfProbableCost as PropertyInfoConfig, type: 'property-info' },
  4:  { id: '1.5', title: 'Recommendations', config: recommendations as PropertyInfoConfig, type: 'property-info' },
  5:  { id: 'PCS', title: 'Condition Summary', config: propertyConditionSummary as ConditionSummaryConfig, type: 'condition-summary' },
  6:  { id: 'OPC', title: 'Cost Tables', config: opinionOfProbableCostTable as CostOpinionConfig, type: 'cost-opinion' },
  // Section 2: Introduction (1 step)
  7:  { id: '2.4', title: 'Reconnaissance Info', config: generalPropertyReconnaissanceInformation as PropertyInfoConfig, type: 'property-info' },
  // Section 3: Property Characteristics (3 steps)
  8:  { id: '3.1', title: 'Location & Description', config: locationAndDescription as PropertyInfoConfig, type: 'property-info' },
  9:  { id: '3.2', title: 'Tenant & Lease Info', config: tenantAndLeaseInformation as PropertyInfoConfig, type: 'property-info' },
  10: { id: '3.3', title: 'Utilities & Services', config: utilityAndServiceProviders as PropertyInfoConfig, type: 'property-info' },
  // Section 4: Document Review (5 steps)
  11: { id: '4.1', title: 'Property Questionnaire', config: propertyQuestionnaire as PropertyInfoConfig, type: 'property-info' },
  12: { id: '4.2', title: 'Interviews', config: interviews as PropertyInfoConfig, type: 'property-info' },
  13: { id: '4.3', title: 'Building & Fire Depts', config: buildingAndFireDepartments as PropertyInfoConfig, type: 'property-info' },
  14: { id: '4.4', title: 'Zoning Department', config: zoningDepartment as PropertyInfoConfig, type: 'property-info' },
  15: { id: '4.5', title: 'Previous Reports', config: previousReports as PropertyInfoConfig, type: 'property-info' },
  // Section 5: Site & Grounds (6 steps)
  16: { id: '5.1', title: 'Topography & Stormwater', config: topographyStormwater as SectionConfig, type: 'report' },
  17: { id: '5.2', title: 'Access & Egress', config: accessEgress as SectionConfig, type: 'report' },
  18: { id: '5.3', title: 'Paving & Parking', config: pavingCurbingParking as SectionConfig, type: 'report' },
  19: { id: '5.4', title: 'Flatwork', config: flatwork as SectionConfig, type: 'report' },
  20: { id: '5.5', title: 'Landscaping', config: landscapingAppurtenances as SectionConfig, type: 'report' },
  21: { id: '5.6', title: 'Ancillary Structures', config: ancillaryStructures as SectionConfig, type: 'report' },
  // Section 6: Building Envelope (4 steps)
  22: { id: '6.1', title: 'Foundation', config: foundation as SectionConfig, type: 'report' },
  23: { id: '6.2', title: 'Building Frame', config: buildingFrame as SectionConfig, type: 'report' },
  24: { id: '6.3', title: 'Facades', config: facadesCurtainWall as SectionConfig, type: 'report' },
  25: { id: '6.4', title: 'Roofing', config: roofing as SectionConfig, type: 'report' },
  // Section 7: Mechanical Systems (4 steps)
  26: { id: '7.1', title: 'HVAC', config: heatingAndCooling as SectionConfig, type: 'report' },
  27: { id: '7.2', title: 'Electrical', config: electrical as SectionConfig, type: 'report' },
  28: { id: '7.3', title: 'Plumbing', config: plumbing as SectionConfig, type: 'report' },
  29: { id: '7.4', title: 'Elevators', config: elevatorsAndEscalators as SectionConfig, type: 'report' },
  // Section 8: Interior Elements (2 steps)
  30: { id: '8.1', title: 'Common Areas', config: commonAreas as SectionConfig, type: 'report' },
  31: { id: '8.2', title: 'Tenant Spaces', config: tenantSpaces as SectionConfig, type: 'report' },
  // Section 9: Fire Protection (2 steps)
  32: { id: '9.1', title: 'Sprinklers', config: sprinklersAndStandpipes as SectionConfig, type: 'report' },
  33: { id: '9.2', title: 'Alarms', config: alarmSystems as SectionConfig, type: 'report' },
  // Section 10: Additional Considerations (3 steps)
  34: { id: '10.1', title: 'Natural Hazards', config: naturalHazards as SectionConfig, type: 'report' },
  35: { id: '10.2', title: 'Microbial Contamination', config: microbialContamination as SectionConfig, type: 'report' },
  36: { id: '10.3', title: 'ADA Screening', config: adaScreeningChecklist as ChecklistConfig, type: 'checklist' },
  // Appendices (1 step)
  37: { id: 'APP', title: 'Uploads & Appendices', config: { appendixType: 'appendix' } as AppendixConfig, type: 'appendix' },
};

// Navigation structure for sidebar
const navSections: NavSection[] = [
  {
    id: 'section-1',
    title: 'Section 1: Summary',
    subsections: [
      { id: '1.1', title: '1.1 General Description', step: 1 },
      { id: '1.2', title: '1.2 Physical Condition', step: 2 },
      { id: '1.3', title: '1.3 Probable Cost', step: 3 },
      { id: '1.5', title: '1.5 Recommendations', step: 4 },
      { id: 'PCS', title: 'Condition Summary', step: 5 },
      { id: 'OPC', title: 'Cost Tables', step: 6 },
    ],
  },
  {
    id: 'section-2',
    title: 'Section 2: Introduction',
    subsections: [
      { id: '2.4', title: '2.4 Reconnaissance', step: 7 },
    ],
  },
  {
    id: 'section-3',
    title: 'Section 3: Property',
    subsections: [
      { id: '3.1', title: '3.1 Location', step: 8 },
      { id: '3.2', title: '3.2 Tenants & Leases', step: 9 },
      { id: '3.3', title: '3.3 Utilities', step: 10 },
    ],
  },
  {
    id: 'section-4',
    title: 'Section 4: Documents',
    subsections: [
      { id: '4.1', title: '4.1 Questionnaire', step: 11 },
      { id: '4.2', title: '4.2 Interviews', step: 12 },
      { id: '4.3', title: '4.3 Building & Fire', step: 13 },
      { id: '4.4', title: '4.4 Zoning', step: 14 },
      { id: '4.5', title: '4.5 Previous Reports', step: 15 },
    ],
  },
  {
    id: 'section-5',
    title: 'Section 5: Site & Grounds',
    subsections: [
      { id: '5.1', title: '5.1 Topography', step: 16 },
      { id: '5.2', title: '5.2 Access & Egress', step: 17 },
      { id: '5.3', title: '5.3 Paving', step: 18 },
      { id: '5.4', title: '5.4 Flatwork', step: 19 },
      { id: '5.5', title: '5.5 Landscaping', step: 20 },
      { id: '5.6', title: '5.6 Ancillary', step: 21 },
    ],
  },
  {
    id: 'section-6',
    title: 'Section 6: Building Envelope',
    subsections: [
      { id: '6.1', title: '6.1 Foundation', step: 22 },
      { id: '6.2', title: '6.2 Frame', step: 23 },
      { id: '6.3', title: '6.3 Facades', step: 24 },
      { id: '6.4', title: '6.4 Roofing', step: 25 },
    ],
  },
  {
    id: 'section-7',
    title: 'Section 7: Mechanical',
    subsections: [
      { id: '7.1', title: '7.1 HVAC', step: 26 },
      { id: '7.2', title: '7.2 Electrical', step: 27 },
      { id: '7.3', title: '7.3 Plumbing', step: 28 },
      { id: '7.4', title: '7.4 Elevators', step: 29 },
    ],
  },
  {
    id: 'section-8',
    title: 'Section 8: Interior',
    subsections: [
      { id: '8.1', title: '8.1 Common Areas', step: 30 },
      { id: '8.2', title: '8.2 Tenant Spaces', step: 31 },
    ],
  },
  {
    id: 'section-9',
    title: 'Section 9: Fire Protection',
    subsections: [
      { id: '9.1', title: '9.1 Sprinklers', step: 32 },
      { id: '9.2', title: '9.2 Alarms', step: 33 },
    ],
  },
  {
    id: 'section-10',
    title: 'Section 10: Additional',
    subsections: [
      { id: '10.1', title: '10.1 Natural Hazards', step: 34 },
      { id: '10.2', title: '10.2 Mold', step: 35 },
      { id: '10.3', title: '10.3 ADA Screening', step: 36 },
    ],
  },
  {
    id: 'appendices',
    title: 'Appendices',
    subsections: [
      { id: 'APP', title: 'Uploads & Appendices', step: 37 },
    ],
  },
];

const TOTAL_STEPS = 37;

const {
  currentStep,
  totalSteps,
  currentStepData,
  loading,
  saving,
  error,
  lastSaved,
  isDirty,
  completedSteps: completedStepsFromDb,
  // initializeForm - available but not used in demo mode
  nextStep,
  prevStep,
  goToStep,
  markStepComplete,
  loadFromSupabase,
  forceSave,
  cleanup,
} = useWebReportForm({
  reportId: reportId.value,
  autoSaveDelay: 2000,
});

const currentConfig = computed(() => allSectionConfigs[currentStep.value]);

const currentSectionId = computed(() => {
  for (const section of navSections) {
    const found = section.subsections.find((sub: NavSubsection) => sub.step === currentStep.value);
    if (found) return section.id;
  }
  return '';
});

// Use completedSteps from composable (loaded from DB)
const completedSteps = completedStepsFromDb;
const isNotesPanelCollapsed = ref(false);

// Handle both section types
function handleReportSectionUpdate(data: Record<BlockType, FormData>) {
  currentStepData.value = data;
}

function handlePropertyInfoUpdate(data: FormData) {
  currentStepData.value = data;
}

function handleNavigate(_sectionId: string, step: number) {
  if (currentStepData.value && Object.keys(currentStepData.value).length > 0) {
    markStepComplete(currentStep.value);
  }
  goToStep(step);
}

async function handleNext() {
  markStepComplete(currentStep.value);
  if (currentStep.value < TOTAL_STEPS) {
    nextStep();
  } else {
    await forceSave();
    if (!isDemoMode.value) {
      await supabase
        .from('reports')
        .update({ status: 'final' })
        .eq('id', reportId.value);
      await autoExportPdf();
    }
    router.push('/');
  }
}

async function autoExportPdf() {
  exportingPdf.value = true;
  pdfOverlayMessage.value = 'Checking report data...';

  try {
    const validation = await validateReportForExport(reportId.value);
    if (!validation.valid) {
      showError(`Report saved. PDF export skipped — missing required fields: ${validation.missingFields.join(', ')}`);
      return;
    }

    pdfOverlayMessage.value = 'Generating PDF with DocRaptor...';

    const meta: ReportMeta = {
      projectNumber: '',
      clientName: '',
      clientContactName: '',
      clientAddress: '',
      clientCityStateZip: '',
      dateIssued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      preparedBy: '',
      preparedByTitle: 'Project Manager',
      reviewedBy: 'Ronnie Long',
      reviewedByTitle: 'Assessments Director',
      logoUrl: 'https://sypjpnqrtyeielbpmdvs.supabase.co/storage/v1/object/public/report-assets/ASMLogoBlue.png',
    };

    const { pdfUrl, appendixData, propertyName, cityStateZip, projectNumber } =
      await withTimeout(generateReportPdf(reportId.value, meta), 180_000, 'PDF generation');

    pdfOverlayMessage.value = 'Building appendix pages...';

    const finalPdfBytes = await withTimeout(
      postProcessPdf(pdfUrl, {
        projectNumber,
        propertyName,
        cityStateZip,
        logoUrl: meta.logoUrl,
        appendixData,
      }),
      120_000,
      'PDF post-processing'
    );

    triggerDownload(finalPdfBytes, buildPdfFilename(projectNumber, propertyName, cityStateZip));

    await supabase.from('reports').update({ status: 'exported' }).eq('id', reportId.value);

    showSuccess('PDF exported successfully');
  } catch (err) {
    console.error('PDF export error:', err);
    showError(err instanceof Error ? err.message : 'PDF export failed');
  } finally {
    exportingPdf.value = false;
    pdfOverlayMessage.value = 'Preparing your report...';
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
}

onMounted(async () => {
  totalSteps.value = TOTAL_STEPS;
  // Initialize with empty data for now - configs will provide structure
  
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

watch(error, (msg) => {
  if (msg && !isDemoMode.value) {
    showError(msg);
  }
});

const completionPercentage = computed(() => {
  return Math.round((completedSteps.value.size / TOTAL_STEPS) * 100);
});

// Determine if current section is property-info or report style
const isPropertyInfoSection = computed(() => {
  return currentConfig.value?.type === 'property-info';
});

const isChecklistSection = computed(() => {
  return currentConfig.value?.type === 'checklist';
});

const isConditionSummarySection = computed(() => {
  return currentConfig.value?.type === 'condition-summary';
});

const isCostOpinionSection = computed(() => {
  return currentConfig.value?.type === 'cost-opinion';
});

const isAppendixSection = computed(() => {
  return currentConfig.value?.type === 'appendix';
});
</script>

<template>
  <div
    class="report-view h-screen flex flex-col transition-colors duration-150"
    :class="theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-100 text-slate-900'"
  >
    <!-- PDF Export Overlay -->
    <PdfExportOverlay :visible="exportingPdf" :message="pdfOverlayMessage" />

    <!-- Skip link -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>

    <!-- Header -->
    <header 
      class="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b transition-colors duration-150"
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
        class="flex-1 overflow-y-auto transition-colors duration-150"
        :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-[#fefefe]'"
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
          <!-- Section Header -->
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

          <!-- Property Info Section (Sections 1-4) -->
          <PropertyInfoSection
            v-if="currentConfig && isPropertyInfoSection"
            :key="currentStep"
            :config="(currentConfig.config as PropertyInfoConfig)"
            :model-value="(currentStepData as FormData) || {}"
            @update:model-value="handlePropertyInfoUpdate"
          />

          <!-- Condition Summary Section -->
          <ConditionSummarySection
            v-else-if="currentConfig && isConditionSummarySection"
            :key="currentStep"
            :config="(currentConfig.config as ConditionSummaryConfig)"
            :model-value="(currentStepData as FormData) || {}"
            @update:model-value="handlePropertyInfoUpdate"
          />

          <!-- Cost Opinion Section -->
          <CostOpinionSection
            v-else-if="currentConfig && isCostOpinionSection"
            :key="currentStep"
            :config="(currentConfig.config as CostOpinionConfig)"
            :model-value="(currentStepData as FormData) || {}"
            @update:model-value="handlePropertyInfoUpdate"
          />

          <!-- Checklist Section (10.3 ADA) -->
          <AdaChecklistSection
            v-else-if="currentConfig && isChecklistSection"
            :key="currentStep"
            :config="(currentConfig.config as ChecklistConfig)"
            :model-value="(currentStepData as FormData) || {}"
            @update:model-value="handlePropertyInfoUpdate"
          />

          <!-- Appendix Section (Step 36) -->
          <AppendixSection
            v-else-if="currentConfig && isAppendixSection"
            :key="currentStep"
            :model-value="(currentStepData as Record<string, unknown>) || {}"
            :report-id="reportId"
            :user-id="userId"
            @update:model-value="handlePropertyInfoUpdate"
          />

          <!-- Report Section (Sections 5-9) -->
          <DynamicReportSection
            v-else-if="currentConfig"
            :key="currentStep"
            :config="(currentConfig.config as SectionConfig)"
            :model-value="(currentStepData as Record<BlockType, FormData>) || {}"
            @update:model-value="handleReportSectionUpdate"
          />

          <!-- Navigation -->
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

            <p
              class="hidden md:block text-xs italic"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              Tip: Use the sidebar to jump between sections
            </p>

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
        :report-id="reportId"
        :is-collapsed="isNotesPanelCollapsed"
        @toggle-collapse="isNotesPanelCollapsed = !isNotesPanelCollapsed"
      />
    </div>
  </div>
</template>

