<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FieldNoteData, FieldInspectionItem } from '@/types/fieldNotes';
import { 
  formatCurrency, 
  getConditionClasses, 
  REPAIR_STATUS_LABELS 
} from '@/types/fieldNotes';

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

// Demo data matching the mockup structure
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
  observations: 'Property seems to be in generally acceptable condition with some areas requiring immediate attention. The topography shows signs of erosion near the eastern boundary. Landscaping is well-maintained with drip irrigation functioning properly. Retaining walls show minor deterioration and should be addressed.',
  photoCount: 12,
}));

const displayData = computed(() => props.data || demoData.value);

// Split types into columns for display
function getTypeColumns(types: string[]): [string[], string[]] {
  const mid = Math.ceil(types.length / 2);
  return [types.slice(0, mid), types.slice(mid)];
}
</script>

<template>
  <aside
    class="notes-panel h-full flex flex-col border-l transition-all duration-300 ease-in-out"
    :class="isCollapsedInternal ? 'w-12 bg-zinc-900 border-zinc-800' : 'w-[380px] bg-zinc-900 border-zinc-800'"
    role="complementary"
    aria-label="Field inspection notes"
  >
    <!-- Collapsed state -->
    <div v-if="isCollapsedInternal" class="h-full flex flex-col items-center py-4">
      <button
        type="button"
        class="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Expand field notes panel"
        @click="toggleCollapse"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      
      <div class="mt-4 flex-1 flex items-start">
        <span 
          class="text-xs font-medium text-zinc-500 uppercase tracking-widest"
          style="writing-mode: vertical-rl; text-orientation: mixed;"
        >
          Field Notes
        </span>
      </div>

      <div 
        v-if="displayData.photoCount > 0"
        class="mt-auto mb-2 w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg"
      >
        <span class="text-xs font-medium text-zinc-400">{{ displayData.photoCount }}</span>
      </div>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header -->
      <div class="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
        <div>
          <h3 class="text-sm font-semibold text-zinc-100">Field Notes</h3>
          <p class="text-xs text-zinc-500">{{ displayData.inspector }} · {{ displayData.inspectionDate }}</p>
        </div>
        <button
          type="button"
          class="p-2 -mr-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Collapse field notes panel"
          @click="toggleCollapse"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Inspection items -->
        <div class="divide-y divide-zinc-800/50">
          <article
            v-for="item in displayData.items"
            :key="item.id"
            class="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
            role="button"
            tabindex="0"
            :aria-label="`${item.title}: ${item.condition} condition`"
            @click="emit('view-item', item.id)"
            @keydown.enter="emit('view-item', item.id)"
          >
            <!-- Item title -->
            <h4 class="text-sm font-semibold text-zinc-100 mb-3">
              {{ item.title }}
            </h4>

            <!-- Two column layout -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Left: Types/Materials -->
              <div class="space-y-1.5">
                <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  {{ item.typeLabel }}
                </span>
                <div class="flex gap-4">
                  <ul class="space-y-0.5">
                    <li 
                      v-for="type in getTypeColumns(item.types)[0]" 
                      :key="type"
                      class="flex items-center gap-1.5 text-xs text-zinc-300"
                    >
                      <span class="w-1 h-1 rounded-full bg-zinc-600" aria-hidden="true" />
                      {{ type }}
                    </li>
                  </ul>
                  <ul v-if="getTypeColumns(item.types)[1].length" class="space-y-0.5">
                    <li 
                      v-for="type in getTypeColumns(item.types)[1]" 
                      :key="type"
                      class="flex items-center gap-1.5 text-xs text-zinc-300"
                    >
                      <span class="w-1 h-1 rounded-full bg-zinc-600" aria-hidden="true" />
                      {{ type }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Right: Condition & Repair -->
              <div class="space-y-2">
                <!-- Condition badge -->
                <div>
                  <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                    condition
                  </span>
                  <div 
                    class="mt-1 px-3 py-1.5 rounded text-center text-xs font-semibold"
                    :class="[getConditionClasses(item.condition).bg, getConditionClasses(item.condition).text]"
                  >
                    {{ item.condition || '—' }}
                  </div>
                </div>

                <!-- Repair status -->
                <div class="flex items-center justify-between text-xs">
                  <span class="text-zinc-500">repair status</span>
                  <span 
                    class="font-semibold text-zinc-200"
                    :title="item.repairStatus ? REPAIR_STATUS_LABELS[item.repairStatus] : undefined"
                  >
                    {{ item.repairStatus || '—' }}
                  </span>
                </div>

                <!-- Amount to repair -->
                <div class="flex items-center justify-between text-xs">
                  <span class="text-zinc-500">amount to repair</span>
                  <span class="font-semibold text-zinc-100">
                    {{ formatCurrency(item.repairAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Observations section -->
        <div class="p-4 border-t border-zinc-800">
          <h4 class="text-sm font-semibold text-zinc-100 mb-2">
            Observations & Comments
          </h4>
          <p 
            v-if="displayData.observations"
            class="text-xs text-zinc-400 leading-relaxed italic"
          >
            "{{ displayData.observations }}"
          </p>
          <p v-else class="text-xs text-zinc-500 italic">
            No observations recorded.
          </p>
        </div>
      </div>

      <!-- Footer: Photos -->
      <div class="flex-shrink-0 p-3 border-t border-zinc-800 bg-zinc-950/50">
        <button
          type="button"
          class="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="emit('view-photos')"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 flex items-center justify-center bg-zinc-700 rounded-lg">
              <svg class="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-left">
              <span class="block text-sm font-medium text-zinc-200">Site Photos</span>
              <span class="block text-xs text-zinc-500">{{ displayData.photoCount }} photos attached</span>
            </div>
          </div>
          <svg class="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.notes-panel ::-webkit-scrollbar {
  width: 6px;
}

.notes-panel ::-webkit-scrollbar-track {
  background: transparent;
}

.notes-panel ::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}

.notes-panel ::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
