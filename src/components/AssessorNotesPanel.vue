<script setup lang="ts">
import { ref, toRef, watch } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useFieldNotes, type FieldPhoto } from '@/composables/useFieldNotes';
import DataRenderer from '@/components/DataRenderer.vue';

const props = defineProps<{
  reportId: string;
  isCollapsed?: boolean;
}>();

const emit = defineEmits<{
  'toggle-collapse': [];
  'view-photos': [photos: FieldPhoto[]];
}>();

const { theme } = useTheme();
const isCollapsedInternal = ref(props.isCollapsed ?? false);

// Sync internal collapsed state if prop changes
watch(() => props.isCollapsed, (newVal) => {
  if (newVal !== undefined) isCollapsedInternal.value = newVal;
});

// Use field notes composable
const reportIdRef = toRef(props, 'reportId');

const {
  categories,
  loading,
  error,
  hasData,
  totalPhotos,
  inspectorName,
  inspectionDate,
  currentCategory,
  currentSection,
  currentCategoryIndex,
  currentSectionIndex,
  goToCategory,
  goToSection,
  nextSection,
  prevSection,
  canGoNext,
  canGoPrev,
  getThumbnailUrl,
  allPhotos,
} = useFieldNotes(reportIdRef);

function toggleCollapse() {
  isCollapsedInternal.value = !isCollapsedInternal.value;
  emit('toggle-collapse');
}

function getCategoryIcon(icon: string) {
  const icons: Record<string, string> = {
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    landscape: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  };
  return icons[icon] || icons.building;
}

function viewAllPhotos() {
  emit('view-photos', allPhotos.value);
}
</script>

<template>
  <aside
    class="h-full flex flex-col border-l transition-all duration-300 shadow-xl z-20"
    :class="[
      isCollapsedInternal ? 'w-14' : 'w-[450px]', // Increased width slightly
      theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
    ]"
  >
    <!-- Collapsed State -->
    <div v-if="isCollapsedInternal" class="flex flex-col items-center py-4 h-full">
      <button 
        @click="toggleCollapse"
        class="p-2 rounded-lg transition-colors hover:bg-opacity-80"
        :class="theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-400 hover:bg-slate-100'"
        aria-label="Expand field notes panel"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <div 
        class="mt-12 writing-mode-vertical rotate-180 text-xs font-bold tracking-[0.2em] uppercase"
        :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
      >
        Field Notes
      </div>
      <div 
        v-if="totalPhotos > 0"
        class="mt-auto mb-6 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold shadow-sm"
        :class="theme === 'dark' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'"
      >
        {{ totalPhotos }}
      </div>
    </div>

    <!-- Expanded State -->
    <template v-else>
      <!-- Header -->
      <div 
        class="flex-shrink-0 px-5 py-4 border-b flex flex-col gap-3"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-100 bg-white'"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 
              class="text-base font-bold tracking-tight"
              :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
            >
              Field Notes
            </h2>
            <span 
              v-if="hasData" 
              class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
              :class="theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'"
            >
              Live Data
            </span>
          </div>
          <button 
            @click="toggleCollapse"
            class="p-1.5 rounded-md transition-colors"
            :class="theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'"
            aria-label="Collapse field notes panel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Inspector Info -->
        <div 
          v-if="inspectorName || inspectionDate"
          class="flex items-center gap-3 text-xs"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">{{ inspectorName || 'Unknown Inspector' }}</span>
          </div>
          <div v-if="inspectionDate" class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ inspectionDate }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Categories) -->
      <div 
        class="flex-shrink-0 border-b overflow-x-auto no-scrollbar"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'"
      >
        <div class="flex px-4 py-2 gap-2 min-w-max">
          <button
            v-for="(category, idx) in categories"
            :key="category.id"
            @click="goToCategory(idx)"
            class="group flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all min-w-[70px]"
            :class="[
              currentCategoryIndex === idx
                ? theme === 'dark'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm ring-1 ring-zinc-700'
                  : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                : theme === 'dark'
                  ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            ]"
          >
            <div class="relative">
              <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(category.icon)" />
              </svg>
              <span 
                v-if="category.totalPhotos > 0"
                class="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1"
                :class="theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'"
              >
                {{ category.totalPhotos }}
              </span>
            </div>
            <span>{{ category.title.split(' ')[0] }}</span>
          </button>
        </div>
      </div>

      <!-- Section Navigator (Sticky-ish) -->
      <div 
        v-if="currentCategory && !currentCategory.comingSoon"
        class="flex-shrink-0 px-5 py-3 border-b flex items-center justify-between gap-4"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-white'"
      >
        <button
          @click="prevSection"
          :disabled="!canGoPrev()"
          class="p-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex-1 text-center overflow-hidden">
          <div class="text-[10px] uppercase tracking-wider font-semibold mb-0.5 opacity-60">
            {{ currentCategory.title }}
          </div>
          <div class="text-sm font-semibold truncate">
            {{ currentSection?.title }}
          </div>
           <!-- Optional: Dots Indicator for sections -->
           <div class="flex justify-center gap-1 mt-1.5">
             <button 
              v-for="(_, idx) in currentCategory.sections" 
              :key="idx"
              @click="goToSection(currentCategoryIndex, idx)"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300"
              :class="[
                idx === currentSectionIndex 
                  ? theme === 'dark' ? 'bg-zinc-200 scale-125' : 'bg-blue-600 scale-125'
                  : theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-600' : 'bg-slate-200 hover:bg-slate-300'
              ]"
              :aria-label="`Go to section ${idx + 1}`"
             ></button>
           </div>
        </div>

        <button
          @click="nextSection"
          :disabled="!canGoNext()"
          class="p-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto min-h-0 bg-opacity-50" :class="theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-50'">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 px-4">
          <svg 
            class="w-10 h-10 animate-spin mb-4 opacity-50"
            :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-400'"
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm font-medium opacity-60">Syncing data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-sm font-medium mb-1">Unable to load notes</p>
          <p class="text-xs opacity-60">{{ error }}</p>
        </div>

        <!-- Coming Soon State -->
        <div v-else-if="currentCategory?.comingSoon" class="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            :class="theme === 'dark' ? 'bg-amber-900/20 text-amber-500' : 'bg-amber-50 text-amber-600'"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-base font-semibold mb-2">Coming Soon</h3>
          <p class="text-sm opacity-60">This section is being developed for the mobile app.</p>
        </div>

        <!-- Section Content -->
        <div v-else-if="currentSection" class="p-5 space-y-8">
          <!-- Data Renderer -->
          <div v-if="currentSection.hasData">
            <DataRenderer :data="currentSection.rawData" />
          </div>
          <div v-else class="py-8 text-center rounded-xl border border-dashed" :class="theme === 'dark' ? 'border-zinc-800 text-zinc-500' : 'border-slate-300 text-slate-500'">
            <p class="text-sm">No data recorded for this section</p>
          </div>

          <!-- Photos Grid -->
          <div v-if="currentSection.photos.length > 0">
             <div class="flex items-center justify-between mb-4">
              <h4 
                class="text-xs font-bold uppercase tracking-wider"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
              >
                Photos ({{ currentSection.photos.length }})
              </h4>
             </div>
            
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="(photo, idx) in currentSection.photos.slice(0, 6)"
                :key="photo.id"
                class="group relative aspect-square rounded-lg overflow-hidden cursor-pointer ring-1 ring-black/5"
                @click="emit('view-photos', currentSection.photos)"
              >
                <img
                  :src="getThumbnailUrl(photo)"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              
              <!-- More Photos Indicator -->
              <div
                v-if="currentSection.photos.length > 6"
                class="aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold cursor-pointer transition-colors border-2 border-dashed"
                :class="theme === 'dark' ? 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700'"
                @click="emit('view-photos', currentSection.photos)"
              >
                <span class="text-lg mb-1">+{{ currentSection.photos.length - 6 }}</span>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State (Global) -->
        <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'"
          >
            <svg 
              class="w-8 h-8 opacity-40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold mb-2">No Data Available</h3>
          <p class="text-xs opacity-60">
            This report doesn't have any field data associated with it yet.
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div 
        v-if="!loading && !error && hasData && !currentCategory?.comingSoon"
        class="flex-shrink-0 px-5 py-3 border-t flex items-center justify-between gap-4"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-100 bg-white'"
      >
        <button
          v-if="totalPhotos > 0"
          @click="viewAllPhotos"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
          :class="theme === 'dark'
            ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Gallery View ({{ totalPhotos }})
        </button>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
}

/* Hide scrollbar for category tabs */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>