<script setup lang="ts">
import { ref, toRef } from 'vue';
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
    class="h-full flex flex-col border-l transition-all duration-300"
    :class="[
      isCollapsedInternal ? 'w-14' : 'w-[420px]',
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
        Field Notes
      </div>
      <div 
        v-if="totalPhotos > 0"
        class="mt-auto mb-4 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold"
        :class="theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'"
      >
        {{ totalPhotos }}
      </div>
    </div>

    <!-- Expanded State -->
    <template v-else>
      <!-- Header -->
      <div 
        class="flex-shrink-0 px-4 py-3 border-b"
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
          v-if="inspectorName || inspectionDate"
          class="flex items-center gap-2 text-xs"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >
          <span v-if="inspectorName" class="font-medium">{{ inspectorName }}</span>
          <span v-if="inspectorName && inspectionDate">•</span>
          <span v-if="inspectionDate">{{ inspectionDate }}</span>
        </div>
      </div>

      <!-- Category Tabs -->
      <div 
        class="flex-shrink-0 border-b overflow-x-auto"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-100/50'"
      >
        <div class="flex px-2 py-2 gap-1">
          <button
            v-for="(category, idx) in categories"
            :key="category.id"
            @click="goToCategory(idx)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
            :class="[
              currentCategoryIndex === idx
                ? theme === 'dark'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'bg-white text-slate-900 shadow-sm'
                : theme === 'dark'
                  ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            ]"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(category.icon)" />
            </svg>
            {{ category.title.split(' ')[0] }}
            <span 
              v-if="category.comingSoon"
              class="ml-0.5 px-1.5 py-0.5 rounded text-[10px]"
              :class="theme === 'dark' ? 'bg-amber-600/20 text-amber-400' : 'bg-amber-100 text-amber-600'"
            >
              Soon
            </span>
            <span 
              v-else-if="category.totalPhotos > 0"
              class="ml-0.5 px-1.5 py-0.5 rounded text-[10px]"
              :class="theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'"
            >
              {{ category.totalPhotos }}
            </span>
          </button>
        </div>
      </div>

      <!-- Section Selector -->
      <div 
        v-if="currentCategory && currentCategory.sections.length > 1 && !currentCategory.comingSoon"
        class="flex-shrink-0 px-4 py-2 border-b"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <select
          :value="currentSectionIndex"
          @change="(e) => goToSection(currentCategoryIndex, parseInt((e.target as HTMLSelectElement).value))"
          class="w-full px-3 py-1.5 rounded-md text-sm border transition-colors"
          :class="theme === 'dark'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-200 focus:border-zinc-600'
            : 'bg-white border-slate-200 text-slate-700 focus:border-slate-400'"
        >
          <option
            v-for="(section, idx) in currentCategory.sections"
            :key="section.id"
            :value="idx"
          >
            {{ section.title }}
            {{ section.hasData ? '' : '(empty)' }}
          </option>
        </select>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12 px-4">
          <svg 
            class="w-8 h-8 animate-spin mb-4"
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
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12 px-4">
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

        <!-- Coming Soon State -->
        <div v-else-if="currentCategory?.comingSoon" class="flex flex-col items-center justify-center py-12 px-4">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-amber-950/50' : 'bg-amber-50'"
          >
            <svg 
              class="w-8 h-8"
              :class="theme === 'dark' ? 'text-amber-400' : 'text-amber-500'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-semibold mb-1"
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
          >
            Coming Soon
          </h3>
          <p 
            class="text-xs text-center max-w-[220px]"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Interior conditions forms are still being developed in the mobile app.
          </p>
        </div>

        <!-- Section Content -->
        <div v-else-if="currentSection" class="px-4 py-4 space-y-4">
          <!-- Section Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 
                class="text-sm font-semibold"
                :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
              >
                {{ currentSection.title }}
              </h3>
              <p 
                class="text-xs mt-0.5"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                {{ currentCategory?.title }}
              </p>
            </div>
            <div 
              v-if="!currentSection.hasData"
              class="px-2 py-1 rounded text-xs"
              :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'"
            >
              No data
            </div>
          </div>

          <!-- Data Renderer -->
          <DataRenderer :data="currentSection.rawData" />

          <!-- Photos -->
          <div v-if="currentSection.photos.length > 0" class="pt-4 border-t" :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'">
            <div class="flex items-center justify-between mb-3">
              <h4 
                class="text-xs font-semibold uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
              >
                Photos
              </h4>
              <span 
                class="text-xs"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                {{ currentSection.photos.length }}
              </span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(photo, idx) in currentSection.photos.slice(0, 8)"
                :key="photo.id"
                class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                :class="theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'"
              >
                <img
                  :src="getThumbnailUrl(photo)"
                  :alt="photo.filename || `Photo ${idx + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-if="currentSection.photos.length > 8"
                class="aspect-square rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-500'"
                @click="emit('view-photos', currentSection.photos)"
              >
                +{{ currentSection.photos.length - 8 }}
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-12 px-4">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100'"
          >
            <svg 
              class="w-8 h-8"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-semibold mb-1"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            No Field Data
          </h3>
          <p 
            class="text-xs text-center max-w-[200px]"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            This report doesn't have linked field assessment data yet.
          </p>
        </div>
      </div>

      <!-- Footer Navigation -->
      <div 
        v-if="!loading && !error && hasData && !currentCategory?.comingSoon"
        class="flex-shrink-0 px-4 py-3 border-t"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'"
      >
        <div class="flex items-center justify-between">
          <button
            @click="prevSection"
            :disabled="!canGoPrev()"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'"
          >
            ← Previous
          </button>
          
          <button
            v-if="totalPhotos > 0"
            @click="viewAllPhotos"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="theme === 'dark'
              ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'"
          >
            All Photos ({{ totalPhotos }})
          </button>

          <button
            @click="nextSection"
            :disabled="!canGoNext()"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'"
          >
            Next →
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
</style>
