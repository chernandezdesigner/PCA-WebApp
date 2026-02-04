<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FieldNoteData, FieldInspectionItem, ConditionRating } from '@/types/fieldNotes';
import { formatCurrency, REPAIR_STATUS_LABELS } from '@/types/fieldNotes';

const props = defineProps<{
  data?: FieldNoteData | null;
  currentSectionId?: string;
  isCollapsed?: boolean;
}>();

const emit = defineEmits<{
  'toggle-collapse': [];
  'view-photos': [];
  'view-item': [itemId: string];
}>();

const isCollapsedInternal = ref(props.isCollapsed ?? false);

function toggleCollapse() {
  isCollapsedInternal.value = !isCollapsedInternal.value;
  emit('toggle-collapse');
}

// Demo data (fallback)
const demoData = computed<FieldNoteData>(() => ({
  sectionId: '6.1',
  inspector: 'John Smith',
  inspectionDate: '2026-01-15',
  location: 'Building A - East Side',
  items: [
    {
      id: 'topography',
      title: 'Topography Slope',
      typeLabel: 'slope type',
      types: ['flat', 'gentle slope', 'erosion'],
      condition: 'Fair',
      repairStatus: 'IR',
      repairAmount: 33320,
    },
    {
      id: 'landscaping',
      title: 'Landscaping',
      typeLabel: 'landscaping type',
      types: ['Typical', 'Trees', 'shrubs', 'Drip irrig.', 'Grass', 'Flowerbeds'],
      condition: 'Good',
      repairStatus: 'ST',
      repairAmount: 10500,
    },
    {
      id: 'retaining-walls',
      title: 'Retaining Walls',
      typeLabel: 'wall materials',
      types: ['Timber', 'Stone', 'CMU Block'],
      condition: 'Fair',
      repairStatus: 'IR',
      repairAmount: 33320,
    },
  ],
  observations: 'Property seems to be in generally acceptable condition with some areas requiring immediate attention. The topography shows signs of erosion near the eastern boundary.',
  photoCount: 12,
}));

const displayData = computed(() => props.data || demoData.value);

function getConditionBadgeStyle(condition: ConditionRating) {
  switch (condition) {
    case 'Good': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Fair': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Poor': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
}
</script>

<template>
  <aside
    class="h-full flex flex-col bg-zinc-950 border-l border-zinc-800 transition-all duration-300"
    :class="isCollapsedInternal ? 'w-14' : 'w-[400px]'"
  >
    <!-- Collapsed State -->
    <div v-if="isCollapsedInternal" class="flex flex-col items-center py-4 h-full">
      <button 
        @click="toggleCollapse"
        class="p-2 text-zinc-400 hover:bg-zinc-800 rounded-md transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <div class="mt-8 writing-mode-vertical rotate-180 text-xs font-bold tracking-widest text-zinc-500 uppercase">
        Field Data
      </div>
      <div class="mt-auto mb-4 bg-blue-600/20 text-blue-400 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold">
        {{ displayData.photoCount }}
      </div>
    </div>

    <!-- Expanded State -->
    <template v-else>
      <!-- Header -->
      <div class="flex-shrink-0 px-5 py-4 border-b border-zinc-800 bg-zinc-950">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-bold text-zinc-100 uppercase tracking-wide">Field Notes</h2>
          <button 
            @click="toggleCollapse"
            class="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div class="flex items-center gap-2 text-xs text-zinc-500">
          <span class="font-medium text-zinc-400">{{ displayData.inspector }}</span>
          <span>•</span>
          <span>{{ displayData.inspectionDate }}</span>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
        
        <!-- Inspection Cards -->
        <div v-for="item in displayData.items" :key="item.id" class="group">
          <div class="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
            
            <!-- Card Header: Title & Condition -->
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                {{ item.title }}
              </h3>
              <span 
                class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border"
                :class="getConditionBadgeStyle(item.condition)"
              >
                {{ item.condition || 'N/A' }}
              </span>
            </div>

            <!-- Card Grid Data -->
            <div class="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              
              <!-- Materials / Types -->
              <div class="col-span-2">
                <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                  {{ item.typeLabel }}
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="type in item.types" 
                    :key="type"
                    class="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[11px]"
                  >
                    {{ type }}
                  </span>
                </div>
              </div>

              <!-- Repair Status -->
              <div class="border-t border-zinc-800 pt-3 mt-1">
                <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Repair Status</p>
                <p class="font-medium text-zinc-300">
                  {{ item.repairStatus ? REPAIR_STATUS_LABELS[item.repairStatus] : '—' }}
                </p>
              </div>

              <!-- Cost -->
              <div class="border-t border-zinc-800 pt-3 mt-1 text-right">
                <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Est. Cost</p>
                <p class="font-mono font-medium text-zinc-200 text-sm">
                  {{ formatCurrency(item.repairAmount) }}
                </p>
              </div>
            </div>

          </div>
        </div>

        <!-- Observations -->
        <div class="pt-2">
          <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Observations</h4>
          <div class="bg-zinc-900/30 border-l-2 border-blue-500/50 pl-3 py-1">
            <p class="text-sm text-zinc-400 italic leading-relaxed">
              "{{ displayData.observations }}"
            </p>
          </div>
        </div>

      </div>

      <!-- Bottom Actions -->
      <div class="flex-shrink-0 p-4 border-t border-zinc-800 bg-zinc-950">
        <button 
          @click="emit('view-photos')"
          class="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-600">
              <svg class="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-left">
              <div class="text-sm font-medium text-zinc-200">Site Photos</div>
              <div class="text-xs text-zinc-500">{{ displayData.photoCount }} images attached</div>
            </div>
          </div>
          <svg class="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
</style>
