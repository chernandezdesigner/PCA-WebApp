<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useReportCreation } from '@/composables/useReportCreation';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import { generateReportPdf, downloadPdf } from '@/services/pdf/pdfGenerationService';
import { postProcessPdf, triggerDownload } from '@/services/pdf/pdfPostProcessor';
import type { ReportMeta } from '@/services/pdf/reportTemplate';
import type { ReportStatus } from '@/types/database';

const router = useRouter();
const authStore = useAuthStore();
const { theme, toggleTheme } = useTheme();
const { createReportFromAssessment, loading: creatingReport, error: createError } = useReportCreation();

// Loading states
const loadingAssessments = ref(true);
const loadingReports = ref(true);

// Error states
const assessmentsError = ref<string | null>(null);
const reportsError = ref<string | null>(null);

// Data
interface PendingAssessment {
  id: string;
  status: string;
  created_at: string;
  project_summaries: {
    property_address: string | null;
    property_city: string | null;
    property_state: string | null;
    inspector_name: string | null;
    inspection_date: string | null;
    project_name: string | null;
  } | null;
}

interface ReportItem {
  id: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  source_assessment_id: string | null;
  pdf_generated_at: string | null;
  pdf_storage_path: string | null;
  // Joined data
  property_address?: string | null;
  property_city?: string | null;
  property_state?: string | null;
  project_name?: string | null;
  current_step?: number;
  completed_steps?: number[];
}

const pendingAssessments = ref<PendingAssessment[]>([]);
const reports = ref<ReportItem[]>([]);

// Status styling
const reportStatusStyles: Record<ReportStatus, { bg: string; text: string; dot: string; label: string }> = {
  draft: {
    bg: theme.value === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200',
    text: theme.value === 'dark' ? 'text-zinc-300' : 'text-slate-600',
    dot: 'bg-slate-400',
    label: 'Draft',
  },
  in_progress: {
    bg: theme.value === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-blue-50 border-blue-200',
    text: theme.value === 'dark' ? 'text-blue-300' : 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'In Progress',
  },
  review: {
    bg: theme.value === 'dark' ? 'bg-amber-950 border-amber-900' : 'bg-amber-50 border-amber-200',
    text: theme.value === 'dark' ? 'text-amber-300' : 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'In Review',
  },
  final: {
    bg: theme.value === 'dark' ? 'bg-emerald-950 border-emerald-900' : 'bg-emerald-50 border-emerald-200',
    text: theme.value === 'dark' ? 'text-emerald-300' : 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Final',
  },
  exported: {
    bg: theme.value === 'dark' ? 'bg-purple-950 border-purple-900' : 'bg-purple-50 border-purple-200',
    text: theme.value === 'dark' ? 'text-purple-300' : 'text-purple-700',
    dot: 'bg-purple-500',
    label: 'Exported',
  },
};

// Computed status styles (reactive to theme changes)
const getStatusStyle = (status: ReportStatus) => {
  const styles: Record<ReportStatus, { bg: string; text: string; dot: string; label: string }> = {
    draft: {
      bg: theme.value === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200',
      text: theme.value === 'dark' ? 'text-zinc-300' : 'text-slate-600',
      dot: 'bg-slate-400',
      label: 'Draft',
    },
    in_progress: {
      bg: theme.value === 'dark' ? 'bg-blue-950 border-blue-900' : 'bg-blue-50 border-blue-200',
      text: theme.value === 'dark' ? 'text-blue-300' : 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'In Progress',
    },
    review: {
      bg: theme.value === 'dark' ? 'bg-amber-950 border-amber-900' : 'bg-amber-50 border-amber-200',
      text: theme.value === 'dark' ? 'text-amber-300' : 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'In Review',
    },
    final: {
      bg: theme.value === 'dark' ? 'bg-emerald-950 border-emerald-900' : 'bg-emerald-50 border-emerald-200',
      text: theme.value === 'dark' ? 'text-emerald-300' : 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Final',
    },
    exported: {
      bg: theme.value === 'dark' ? 'bg-purple-950 border-purple-900' : 'bg-purple-50 border-purple-200',
      text: theme.value === 'dark' ? 'text-purple-300' : 'text-purple-700',
      dot: 'bg-purple-500',
      label: 'Exported',
    },
  };
  return styles[status];
};

// Fetch pending assessments (submitted, not yet linked to a report)
async function fetchPendingAssessments() {
  loadingAssessments.value = true;
  assessmentsError.value = null;

  try {
    // First, get all assessment IDs that already have reports
    const { data: existingReports, error: reportsError } = await supabase
      .from('reports')
      .select('source_assessment_id')
      .not('source_assessment_id', 'is', null);

    if (reportsError) throw reportsError;

    const linkedAssessmentIds = (existingReports || [])
      .map(r => r.source_assessment_id)
      .filter(Boolean);

    // Fetch submitted assessments that aren't linked
    let query = supabase
      .from('assessments')
      .select(`
        id,
        status,
        created_at,
        project_summaries (
          property_address,
          property_city,
          property_state,
          inspector_name,
          inspection_date,
          project_name
        )
      `)
      .in('status', ['submitted', 'synced'])
      .order('created_at', { ascending: false });

    // Exclude already-linked assessments
    if (linkedAssessmentIds.length > 0) {
      query = query.not('id', 'in', `(${linkedAssessmentIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    pendingAssessments.value = (data || []) as PendingAssessment[];
  } catch (err) {
    console.error('Error fetching assessments:', err);
    assessmentsError.value = err instanceof Error ? err.message : 'Failed to load assessments';
  } finally {
    loadingAssessments.value = false;
  }
}

// Fetch user's reports
async function fetchReports() {
  loadingReports.value = true;
  reportsError.value = null;

  try {
    // Fetch reports with joined assessment data
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        source_assessment_id,
        pdf_generated_at,
        pdf_storage_path,
        report_content (
          current_step,
          completed_steps
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // For reports with source_assessment_id, fetch property info
    const reportsWithDetails: ReportItem[] = [];

    for (const report of data || []) {
      const reportItem: ReportItem = {
        id: report.id,
        status: report.status as ReportStatus,
        created_at: report.created_at,
        updated_at: report.updated_at,
        source_assessment_id: report.source_assessment_id,
        pdf_generated_at: report.pdf_generated_at,
        pdf_storage_path: report.pdf_storage_path,
        current_step: (report.report_content as any)?.current_step,
        completed_steps: (report.report_content as any)?.completed_steps,
      };

      // Fetch property info if linked to assessment
      if (report.source_assessment_id) {
        const { data: projectData } = await supabase
          .from('project_summaries')
          .select('property_address, property_city, property_state, project_name')
          .eq('assessment_id', report.source_assessment_id)
          .single();

        if (projectData) {
          reportItem.property_address = projectData.property_address;
          reportItem.property_city = projectData.property_city;
          reportItem.property_state = projectData.property_state;
          reportItem.project_name = projectData.project_name;
        }
      }

      reportsWithDetails.push(reportItem);
    }

    reports.value = reportsWithDetails;
  } catch (err) {
    console.error('Error fetching reports:', err);
    reportsError.value = err instanceof Error ? err.message : 'Failed to load reports';
  } finally {
    loadingReports.value = false;
  }
}

// Date formatting
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Actions
async function handleCreateReport(assessmentId: string) {
  const result = await createReportFromAssessment(assessmentId);

  if (result.success && result.reportId) {
    // Refresh lists and navigate to report editor
    await Promise.all([fetchPendingAssessments(), fetchReports()]);
    router.push({ name: 'report-editor', params: { id: result.reportId } });
  } else {
    // Show error (you could add a toast notification here)
    console.error('Failed to create report:', result.error);
    alert(result.error || 'Failed to create report');
  }
}

function handleContinueEditing(reportId: string) {
  console.log('Continue editing report:', reportId);
  router.push({ name: 'report-editor', params: { id: reportId } });
}

function handleViewReport(reportId: string) {
  console.log('View report:', reportId);
  router.push({ name: 'report-editor', params: { id: reportId } });
}

const exportingPdf = ref<string | null>(null);
const downloadingPdf = ref<string | null>(null);
const pdfError = ref<string | null>(null);

async function handleExportPdf(reportId: string) {
  exportingPdf.value = reportId;
  pdfError.value = null;

  try {
    const meta: ReportMeta = {
      projectNumber: '',
      clientName: '',
      clientContactName: '',
      clientAddress: '',
      clientCityStateZip: '',
      dateIssued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      preparedBy: '',
      preparedByTitle: 'Project Manager',
      reviewedBy: '',
      reviewedByTitle: 'Assessments Director',
    };

    const { pdfUrl, appendixData, propertyName, cityStateZip } = await generateReportPdf(reportId, meta);

    const finalPdfBytes = await postProcessPdf(pdfUrl, {
      projectNumber: meta.projectNumber,
      propertyName,
      cityStateZip,
      logoUrl: meta.logoUrl,
      appendixData,
    });

    triggerDownload(finalPdfBytes, `PCA-Report-${reportId}.pdf`);

    await supabase
      .from('reports')
      .update({ status: 'exported' })
      .eq('id', reportId);

    await fetchReports();
  } catch (err) {
    console.error('PDF export error:', err);
    pdfError.value = err instanceof Error ? err.message : 'PDF export failed';
    alert(`PDF Export Error: ${pdfError.value}`);
  } finally {
    exportingPdf.value = null;
  }
}

async function handleDownloadPdf(reportId: string, storagePath: string | null) {
  if (!storagePath) {
    alert('No PDF has been generated yet. Use Export PDF first.');
    return;
  }

  downloadingPdf.value = reportId;
  try {
    const url = await downloadPdf(storagePath);
    window.open(url, '_blank');
  } catch (err) {
    console.error('PDF download error:', err);
    alert(err instanceof Error ? err.message : 'Download failed');
  } finally {
    downloadingPdf.value = null;
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

// Progress calculation
function getProgress(report: ReportItem): number {
  const totalSteps = 37;
  const completed = report.completed_steps?.length || 0;
  return Math.min(100, Math.round((completed / totalSteps) * 100));
}

// Lifecycle
onMounted(() => {
  fetchPendingAssessments();
  fetchReports();
});
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-100'"
  >
    <!-- Header -->
    <nav
      class="sticky top-0 z-40 border-b transition-colors duration-300"
      :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <h1
              class="text-xl font-bold"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              PCA Report Dashboard
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg transition-colors"
              :class="theme === 'dark'
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'"
            >
              <svg v-if="theme === 'dark'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <span
              class="text-sm hidden sm:inline"
              :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
            >
              {{ authStore.user?.email }}
            </span>

            <button
              @click="handleLogout"
              class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
              :class="theme === 'dark'
                ? 'text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- Section 1: Pending Field Assessments -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2
              class="text-lg font-semibold"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              Pending Field Assessments
            </h2>
            <p
              class="text-sm mt-0.5"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Submitted assessments ready for report authoring
            </p>
          </div>
          <button
            @click="fetchPendingAssessments"
            :disabled="loadingAssessments"
            class="p-2 rounded-lg transition-colors"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-50'"
          >
            <svg class="w-5 h-5" :class="{ 'animate-spin': loadingAssessments }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Card Container -->
        <div
          class="rounded-xl border transition-colors duration-300 overflow-hidden"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'"
        >
          <!-- Loading State -->
          <div v-if="loadingAssessments" class="p-8 flex items-center justify-center">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'">Loading assessments...</span>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="assessmentsError" class="p-6">
            <div
              class="flex items-center gap-3 p-4 rounded-lg"
              :class="theme === 'dark' ? 'bg-red-950/50 text-red-300' : 'bg-red-50 text-red-700'"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm">{{ assessmentsError }}</span>
              <button @click="fetchPendingAssessments" class="ml-auto text-sm font-medium underline">Retry</button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="pendingAssessments.length === 0" class="p-12 text-center">
            <svg
              class="w-12 h-12 mx-auto mb-4"
              :class="theme === 'dark' ? 'text-zinc-700' : 'text-slate-300'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p
              class="font-medium"
              :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
            >
              No pending assessments
            </p>
            <p
              class="text-sm mt-1"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              All submitted field assessments have been processed
            </p>
          </div>

          <!-- Assessments List -->
          <div v-else class="divide-y" :class="theme === 'dark' ? 'divide-zinc-800' : 'divide-slate-100'">
            <div
              v-for="assessment in pendingAssessments"
              :key="assessment.id"
              class="p-4 flex items-center justify-between gap-4 transition-colors"
              :class="theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="font-medium truncate"
                    :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
                  >
                    {{ assessment.project_summaries?.property_address || 'No address' }}
                  </span>
                  <span
                    v-if="assessment.status !== 'submitted'"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="theme === 'dark' ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-700'"
                  >
                    In Progress
                  </span>
                </div>
                <div
                  class="text-sm flex items-center gap-3"
                  :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                >
                  <span v-if="assessment.project_summaries?.property_city">
                    {{ assessment.project_summaries.property_city }}{{ assessment.project_summaries.property_state ? `, ${assessment.project_summaries.property_state}` : '' }}
                  </span>
                  <span v-if="assessment.project_summaries?.inspector_name" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ assessment.project_summaries.inspector_name }}
                  </span>
                  <span v-if="assessment.project_summaries?.inspection_date">
                    {{ formatDate(assessment.project_summaries.inspection_date) }}
                  </span>
                </div>
              </div>
              <button
                @click="handleCreateReport(assessment.id)"
                :disabled="assessment.status !== 'submitted' || creatingReport"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
                :class="assessment.status === 'submitted' && !creatingReport
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              >
                <svg v-if="creatingReport" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ creatingReport ? 'Creating...' : 'Create Report' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: My Reports -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2
              class="text-lg font-semibold"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              My Reports
            </h2>
            <p
              class="text-sm mt-0.5"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Reports you're authoring or have completed
            </p>
          </div>
          <button
            @click="fetchReports"
            :disabled="loadingReports"
            class="p-2 rounded-lg transition-colors"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-50'"
          >
            <svg class="w-5 h-5" :class="{ 'animate-spin': loadingReports }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Card Container -->
        <div
          class="rounded-xl border transition-colors duration-300 overflow-hidden"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'"
        >
          <!-- Loading State -->
          <div v-if="loadingReports" class="p-8 flex items-center justify-center">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'">Loading reports...</span>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="reportsError" class="p-6">
            <div
              class="flex items-center gap-3 p-4 rounded-lg"
              :class="theme === 'dark' ? 'bg-red-950/50 text-red-300' : 'bg-red-50 text-red-700'"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm">{{ reportsError }}</span>
              <button @click="fetchReports" class="ml-auto text-sm font-medium underline">Retry</button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="reports.length === 0" class="p-12 text-center">
            <svg
              class="w-12 h-12 mx-auto mb-4"
              :class="theme === 'dark' ? 'text-zinc-700' : 'text-slate-300'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p
              class="font-medium"
              :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
            >
              No reports yet
            </p>
            <p
              class="text-sm mt-1"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              Create a report from a pending assessment above
            </p>
          </div>

          <!-- Reports List -->
          <div v-else class="divide-y" :class="theme === 'dark' ? 'divide-zinc-800' : 'divide-slate-100'">
            <div
              v-for="report in reports"
              :key="report.id"
              class="p-4 transition-colors"
              :class="theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <!-- Title and Status Row -->
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="font-medium truncate"
                      :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
                    >
                      {{ report.project_name || report.property_address || 'Untitled Report' }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                      :class="[getStatusStyle(report.status).bg, getStatusStyle(report.status).text]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusStyle(report.status).dot"></span>
                      {{ getStatusStyle(report.status).label }}
                    </span>
                  </div>

                  <!-- Location -->
                  <div
                    class="text-sm mb-2"
                    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                  >
                    <span v-if="report.property_city">
                      {{ report.property_city }}{{ report.property_state ? `, ${report.property_state}` : '' }}
                    </span>
                    <span v-else class="italic">No location</span>
                    <span class="mx-2">·</span>
                    <span>Updated {{ formatDateRelative(report.updated_at) }}</span>
                  </div>

                  <!-- Progress Bar (for draft/in_progress) -->
                  <div v-if="report.status === 'draft' || report.status === 'in_progress'" class="flex items-center gap-3">
                    <div
                      class="flex-1 h-1.5 rounded-full overflow-hidden"
                      :class="theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'"
                    >
                      <div
                        class="h-full bg-blue-500 rounded-full transition-all"
                        :style="{ width: `${getProgress(report)}%` }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-medium"
                      :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                    >
                      {{ getProgress(report) }}%
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- Draft / In Progress: Continue Editing -->
                  <template v-if="report.status === 'draft' || report.status === 'in_progress'">
                    <button
                      @click="handleContinueEditing(report.id)"
                      class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Continue Editing
                    </button>
                  </template>

                  <!-- Review: Continue Editing (different label could be used) -->
                  <template v-else-if="report.status === 'review'">
                    <button
                      @click="handleViewReport(report.id)"
                      class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                      :class="theme === 'dark'
                        ? 'text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
                    >
                      Review
                    </button>
                  </template>

                  <!-- Final: Edit + Export PDF -->
                  <template v-else-if="report.status === 'final'">
                    <button
                      @click="handleContinueEditing(report.id)"
                      class="px-3 py-2 text-sm font-medium rounded-lg border transition-colors"
                      :class="theme === 'dark'
                        ? 'text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleExportPdf(report.id)"
                      :disabled="exportingPdf === report.id"
                      class="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
                    >
                      <svg v-if="exportingPdf === report.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {{ exportingPdf === report.id ? 'Exporting...' : 'Export PDF' }}
                    </button>
                  </template>

                  <!-- Exported: Edit + Download PDF -->
                  <template v-else-if="report.status === 'exported'">
                    <button
                      @click="handleContinueEditing(report.id)"
                      class="px-3 py-2 text-sm font-medium rounded-lg border transition-colors"
                      :class="theme === 'dark'
                        ? 'text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleDownloadPdf(report.id, report.pdf_storage_path)"
                      :disabled="downloadingPdf === report.id"
                      class="px-3 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
                    >
                      <svg v-if="downloadingPdf === report.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {{ downloadingPdf === report.id ? 'Downloading...' : 'Download PDF' }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>
