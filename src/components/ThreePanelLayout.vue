<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  sidebarWidth?: string;
  notesPanelWidth?: string;
}>();

const isNotesPanelCollapsed = ref(false);

function toggleNotesPanel() {
  isNotesPanelCollapsed.value = !isNotesPanelCollapsed.value;
}
</script>

<template>
  <div class="three-panel-layout h-full flex">
    <!-- Left Sidebar - Navigation -->
    <div class="flex-shrink-0">
      <slot name="sidebar" />
    </div>

    <!-- Center - Main Form Content -->
    <main class="flex-1 overflow-y-auto bg-gray-50">
      <slot name="main" />
      <!-- Default slot also goes to main -->
      <slot />
    </main>

    <!-- Right Panel - Assessor Notes -->
    <div class="flex-shrink-0">
      <slot name="notes-panel" :is-collapsed="isNotesPanelCollapsed" :toggle="toggleNotesPanel" />
    </div>
  </div>
</template>

<style scoped>
.three-panel-layout {
  min-height: 0;
}
</style>
