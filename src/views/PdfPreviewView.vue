<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { assembleReportHtml } from '@/services/pdf/reportTemplate';
import type { ReportMeta } from '@/services/pdf/reportTemplate';
import type { ReportContentRow } from '@/types/database';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/composables/useTheme';

const route = useRoute();
const reportId = route.params.id as string | undefined;
const iframeHtml = ref('');
const loading = ref(true);
const error = ref<string | null>(null);
const { theme } = useTheme();

const demoMeta: ReportMeta = {
  projectNumber: '25DEMO01',
  clientName: 'Demo Client LLC',
  clientContactName: 'Jane Smith',
  clientAddress: '123 Main Street',
  clientCityStateZip: 'Orlando, FL 32801',
  dateIssued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  preparedBy: 'Demo Assessor',
  preparedByTitle: 'Project Manager',
  reviewedBy: 'Ronnie Long',
  reviewedByTitle: 'Assessments Director',
};

onMounted(async () => {
  try {
    let content: ReportContentRow;

    if (reportId && reportId !== 'demo') {
      const { data, error: fetchError } = await supabase
        .from('report_content')
        .select('*')
        .eq('report_id', reportId)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      content = data as ReportContentRow;
    } else {
      content = {
        id: 'demo',
        report_id: 'demo',
        section_1_summary: {},
        section_2_introduction: {},
        section_3_property: {},
        section_4_documents: {},
        section_5_site_grounds: {},
        section_6_building_envelope: {},
        section_7_mechanical: {},
        section_8_interior: {},
        section_9_fire_protection: {},
        section_10_additional: {},
        appendices: {},
        current_step: 1,
        completed_steps: [],
        last_modified: new Date().toISOString(),
      } as ReportContentRow;
    }

    iframeHtml.value = assembleReportHtml(content, demoMeta);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate preview';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div
    class="flex flex-col h-screen transition-colors duration-150"
    :class="theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-200'"
  >
    <header
      class="flex items-center gap-6 px-6 py-3 flex-shrink-0 border-b transition-colors duration-150"
      :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'"
    >
      <h1
        class="text-sm font-semibold"
        :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
      >
        PDF Template Preview
      </h1>
      <p
        class="text-xs"
        :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
      >
        {{ reportId && reportId !== 'demo' ? `Report: ${reportId}` : 'Demo Mode (empty data)' }}
      </p>
      <router-link
        to="/"
        class="ml-auto text-sm font-medium transition-colors"
        :class="theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
      >
        &larr; Back to Dashboard
      </router-link>
    </header>

    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center"
    >
      <div class="flex items-center gap-3">
        <svg
          class="w-5 h-5 animate-spin"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
          fill="none" viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span
          class="text-sm"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
        >
          Loading report data...
        </span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center">
        <svg
          class="w-10 h-10 mx-auto mb-3"
          :class="theme === 'dark' ? 'text-red-400' : 'text-red-500'"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p
          class="text-sm"
          :class="theme === 'dark' ? 'text-red-300' : 'text-red-600'"
        >
          {{ error }}
        </p>
      </div>
    </div>

    <iframe
      v-else
      :srcdoc="iframeHtml"
      class="flex-1 border-none bg-white mx-auto my-4 shadow-lg"
      style="width: 8.5in;"
      sandbox="allow-same-origin"
    />
  </div>
</template>
