<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import type { ConditionRating } from '@/types/fieldNotes';
import { formatCurrency, REPAIR_STATUS_LABELS } from '@/types/fieldNotes';
import { useTheme } from '@/composables/useTheme';
import { useFieldNotes, type FieldPhoto } from '@/composables/useFieldNotes';

const props = defineProps<{
  reportId: string;
  currentStep: number;
  currentSectionId?: string;
  isCollapsed?: boolean;
}>();

const emit = defineEmits<{
  'toggle-collapse': [];
  'view-photos': [photos: FieldPhoto[]];
  'view-item': [itemId: string];
}>();

const { theme } = useTheme();
const isCollapsedInternal = ref(props.isCollapsed ?? false);

// Use field notes composable
const reportIdRef = toRef(props, 'reportId');
const currentStepRef = toRef(props, 'currentStep');

const {
  fieldNotes,
  photos,
  loading,
  error,
  hasFieldNotes,
  getThumbnailUrl,
} = useFieldNotes(reportIdRef, currentStepRef);

function toggleCollapse() {
  isCollapsedInternal.value = !isCollapsedInternal.value;
  emit('toggle-collapse');
}

// Use fetched data
const displayData = computed(() => fieldNotes.value);
const hasData = computed(() => !!displayData.value && displayData.value.items.length > 0);

// Check if this is a property info section (no field notes expected)
const isPropertyInfoSection = computed(() => !hasFieldNotes.value);

function getConditionBadgeStyle(condition: ConditionRating) {
  switch (condition) {
    case 'Good': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'Fair': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Poor': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return theme.value === 'dark' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-slate-100 text-slate-500 border-slate-200';
  }
}
</script>

<template>
  <aside
    class="h-full flex flex-col border-l transition-all duration-300"
    :class="[
      isCollapsedInternal ? 'w-14' : 'w-[400px]',
      theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
    ]"
  >
    <!-- Collapsed State -->
    <div v-if="isCollapsedInternal" class="flex flex-col items-center py-4 h-full">
      <button 
        @click="toggleCollapse"
        class="p-2 rounded-md transition-colors"
        :class="theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-400 hover:bg-slate-200'"
        aria-label="Expand field notes panel"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <div 
        class="mt-8 writing-mode-vertical rotate-180 text-xs font-bold tracking-widest uppercase"
        :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
      >
        Field Data
      </div>
      <div 
        v-if="hasData"
        class="mt-auto mb-4 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold"
        :class="theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'"
      >
        {{ displayData?.photoCount || 0 }}
      </div>
    </div>

    <!-- Expanded State -->
    <template v-else>
      <!-- Header -->
      <div 
        class="flex-shrink-0 px-5 py-4 border-b"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 
            class="text-sm font-bold uppercase tracking-wide"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Field Notes
          </h2>
          <button 
            @click="toggleCollapse"
            class="p-1.5 rounded transition-colors"
            :class="theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
            aria-label="Collapse field notes panel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div 
          v-if="hasData"
          class="flex items-center gap-2 text-xs"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >
          <span 
            class="font-medium"
            :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
          >
            {{ displayData?.inspector }}
          </span>
          <span>•</span>
          <span>{{ displayData?.inspectionDate }}</span>
        </div>
        <div 
          v-else
          class="text-xs"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >
          Section {{ currentSectionId || '—' }}
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
        
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <svg 
            class="w-6 h-6 animate-spin mb-3"
            :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p 
            class="text-xs"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Loading field notes...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-red-950' : 'bg-red-50'"
          >
            <svg 
              class="w-6 h-6"
              :class="theme === 'dark' ? 'text-red-400' : 'text-red-500'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-medium mb-1"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            Failed to load
          </h3>
          <p 
            class="text-xs text-center max-w-[200px]"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ error }}
          </p>
        </div>

        <!-- Property Info Section (no field notes expected) -->
        <div v-else-if="isPropertyInfoSection" class="flex flex-col items-center justify-center py-12">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'"
          >
            <svg 
              class="w-6 h-6"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-medium mb-1"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            No field notes for this section
          </h3>
          <p 
            class="text-xs text-center max-w-[200px]"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            This section contains property information that's authored in the web app, not collected during field inspections.
          </p>
        </div>

        <!-- Empty State (field notes section but no data) -->
        <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-12">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'"
          >
            <svg 
              class="w-6 h-6"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-medium mb-1"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            No field notes yet
          </h3>
          <p 
            class="text-xs text-center max-w-[200px]"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Field inspection data will appear here once synced from the mobile assessment.
          </p>
        </div>
        
        <!-- Inspection Cards (when data exists) -->
        <template v-else>
          <div v-for="item in displayData?.items" :key="item.id" class="group">
            <div 
              class="relative rounded-xl p-4 border transition-all duration-200 cursor-pointer"
              :class="theme === 'dark' 
                ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'"
              @click="emit('view-item', item.id)"
            >
              <div class="flex items-start justify-between mb-4">
                <h3 
                  class="text-sm font-semibold transition-colors"
                  :class="theme === 'dark' ? 'text-zinc-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'"
                >
                  {{ item.title }}
                </h3>
                <span 
                  class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border"
                  :class="getConditionBadgeStyle(item.condition)"
                >
                  {{ item.condition || 'N/A' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                <div class="col-span-2">
                  <p 
                    class="text-[10px] uppercase tracking-wider mb-1.5"
                    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                  >
                    {{ item.typeLabel }}
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span 
                      v-for="type in item.types" 
                      :key="type"
                      class="px-2 py-0.5 rounded text-[11px]"
                      :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ type }}
                    </span>
                  </div>
                </div>

                <div 
                  class="border-t pt-3 mt-1"
                  :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'"
                >
                  <p 
                    class="text-[10px] uppercase tracking-wider mb-0.5"
                    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                  >
                    Repair Status
                  </p>
                  <p 
                    class="font-medium"
                    :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
                  >
                    {{ item.repairStatus ? REPAIR_STATUS_LABELS[item.repairStatus] : '—' }}
                  </p>
                </div>

                <div 
                  class="border-t pt-3 mt-1 text-right"
                  :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'"
                >
                  <p 
                    class="text-[10px] uppercase tracking-wider mb-0.5"
                    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                  >
                    Est. Cost
                  </p>
                  <p 
                    class="font-mono font-medium text-sm"
                    :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-900'"
                  >
                    {{ formatCurrency(item.repairAmount) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Observations -->
          <div v-if="displayData?.observations" class="pt-2">
            <h4 
              class="text-xs font-bold uppercase tracking-wider mb-3"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Observations
            </h4>
            <div 
              class="border-l-2 pl-3 py-1"
              :class="theme === 'dark' ? 'bg-zinc-900/30 border-blue-500/50' : 'bg-blue-50/50 border-blue-400'"
            >
              <p 
                class="text-sm italic leading-relaxed"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
              >
                "{{ displayData.observations }}"
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- Photos Section -->
      <div 
        v-if="hasFieldNotes"
        class="flex-shrink-0 border-t"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'"
      >
        <!-- Photo Thumbnails Grid -->
        <div v-if="photos.length > 0" class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 
              class="text-xs font-bold uppercase tracking-wider"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Site Photos
            </h4>
            <span 
              class="text-xs"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ photos.length }} image{{ photos.length === 1 ? '' : 's' }}
            </span>
          </div>
          
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(photo, index) in photos.slice(0, 8)"
              :key="photo.id"
              @click="emit('view-photos', photos)"
              class="aspect-square rounded-lg overflow-hidden border transition-all hover:ring-2 hover:ring-blue-500"
              :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'"
            >
              <img 
                :src="getThumbnailUrl(photo)" 
                :alt="photo.notes || `Photo ${index + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
            
            <!-- Show more indicator -->
            <button
              v-if="photos.length > 8"
              @click="emit('view-photos', photos)"
              class="aspect-square rounded-lg overflow-hidden border flex items-center justify-center transition-all hover:ring-2 hover:ring-blue-500"
              :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'"
            >
              <span 
                class="text-sm font-medium"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
              >
                +{{ photos.length - 8 }}
              </span>
            </button>
          </div>
        </div>

        <!-- No Photos State -->
        <div v-else class="p-4">
          <button 
            @click="emit('view-photos', [])"
            class="w-full flex items-center justify-between p-3 rounded-lg border transition-all group"
            :class="theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
              : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'"
            disabled
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-md flex items-center justify-center border"
                :class="theme === 'dark' 
                  ? 'bg-zinc-950 border-zinc-800' 
                  : 'bg-white border-slate-200'"
              >
                <svg 
                  class="w-5 h-5"
                  :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="text-left">
                <div 
                  class="text-sm font-medium"
                  :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
                >
                  Site Photos
                </div>
                <div 
                  class="text-xs"
                  :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
                >
                  No photos for this section
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}
:global(.light) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
</style>
