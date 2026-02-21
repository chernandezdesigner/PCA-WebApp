<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { assembleReportHtml } from '@/services/pdf/reportTemplate';
import type { ReportMeta } from '@/services/pdf/reportTemplate';
import type { ReportContentRow } from '@/types/database';
import { supabase } from '@/services/supabase';

const route = useRoute();
const reportId = route.params.id as string | undefined;
const iframeHtml = ref('');
const loading = ref(true);
const error = ref<string | null>(null);

const demoMeta: ReportMeta = {
  projectNumber: '25DEMO01',
  clientName: 'Demo Client LLC',
  clientAddress: '123 Main Street',
  clientCityStateZip: 'Orlando, FL 32801',
  dateIssued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  preparedBy: 'Demo Assessor',
  preparedByTitle: 'Project Manager',
  reviewedBy: 'Demo Reviewer',
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
  <div class="preview-container">
    <header class="preview-header">
      <h1>PDF Template Preview</h1>
      <p v-if="reportId && reportId !== 'demo'">Report: {{ reportId }}</p>
      <p v-else>Demo Mode (empty data)</p>
      <router-link to="/" class="back-link">&larr; Back to Dashboard</router-link>
    </header>

    <div v-if="loading" class="loading-state">Loading report data...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <iframe
      v-else
      :srcdoc="iframeHtml"
      class="preview-iframe"
      sandbox="allow-same-origin"
    />
  </div>
</template>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a2e;
}
.preview-header {
  padding: 12px 24px;
  background: #16213e;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}
.preview-header h1 {
  font-size: 16px;
  margin: 0;
}
.preview-header p {
  font-size: 13px;
  margin: 0;
  color: #888;
}
.back-link {
  margin-left: auto;
  color: #64b5f6;
  text-decoration: none;
  font-size: 13px;
}
.back-link:hover { text-decoration: underline; }
.loading-state, .error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #ccc;
  font-size: 18px;
}
.error-state { color: #ef5350; }
.preview-iframe {
  flex: 1;
  border: none;
  background: white;
  margin: 16px auto;
  width: 8.5in;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
}
</style>
