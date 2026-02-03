<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  leftPanelTitle?: string;
  rightPanelTitle?: string;
}>();

const isLeftPanelCollapsed = ref(false);

function toggleLeftPanel() {
  isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value;
}
</script>

<template>
  <div class="two-panel-layout h-full flex">
    <!-- Left Panel - Mobile Data Reference -->
    <aside
      :class="[
        'left-panel flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all duration-300',
        isLeftPanelCollapsed ? 'w-0 opacity-0' : 'w-[450px]'
      ]"
    >
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 v-if="leftPanelTitle" class="text-lg font-semibold text-gray-800">
            {{ leftPanelTitle }}
          </h2>
          <button
            type="button"
            class="p-1 text-gray-500 hover:text-gray-700"
            @click="toggleLeftPanel"
            aria-label="Collapse panel"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <slot name="left-panel" />
      </div>
    </aside>

    <!-- Collapse Toggle (when collapsed) -->
    <button
      v-if="isLeftPanelCollapsed"
      type="button"
      class="flex-shrink-0 w-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-r border-gray-200"
      @click="toggleLeftPanel"
      aria-label="Expand panel"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Right Panel - Form Content -->
    <main class="right-panel flex-1 overflow-y-auto">
      <div class="p-4">
        <h2 v-if="rightPanelTitle" class="text-lg font-semibold text-gray-800 mb-4">
          {{ rightPanelTitle }}
        </h2>
        <slot name="right-panel" />
        <!-- Default slot goes to right panel -->
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.two-panel-layout {
  min-height: 0; /* Allow flex children to shrink */
}

.left-panel {
  min-width: 0;
}

.right-panel {
  min-width: 0;
}
</style>
