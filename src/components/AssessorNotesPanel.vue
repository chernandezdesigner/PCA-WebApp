<script setup lang="ts">
import { ref, toRef, computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useFieldNotes, type FieldPhoto, type SearchResult } from '@/composables/useFieldNotes';
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
const showSearchResults = ref(false);

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
  searchQuery,
  searchResults,
} = useFieldNotes(reportIdRef);

// Show search results dropdown when there's a query and results
const hasSearchResults = computed(() => searchQuery.value.length >= 2 && searchResults.value.length > 0);


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

function clearSearch() {
  searchQuery.value = '';
  showSearchResults.value = false;
}

function getLayoutMode(sectionTitle: string): 'default' | 'two-column' | 'documentation' {
  const title = sectionTitle.toLowerCase();
  if (title.includes('general info') || title.includes('unit info')) {
    return 'two-column';
  }
  if (title.includes('documentation')) {
    return 'documentation';
  }
  return 'default';
}

function handleSearchFocus() {
  if (searchQuery.value.length >= 2 && searchResults.value.length > 0) {
    showSearchResults.value = true;
  }
}

function handleSearchInput() {
  showSearchResults.value = searchQuery.value.length >= 2;
}

function selectSearchResult(result: SearchResult) {
  goToSection(result.categoryIndex, result.sectionIndex);
  showSearchResults.value = false;
}

function closeSearchResults() {
  // Small delay to allow click events to register
  setTimeout(() => {
    showSearchResults.value = false;
  }, 150);
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
        <div class="flex items-center justify-between mb-1">
          <h2 
            class="text-base font-bold"
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
          <span v-if="inspectorName && inspectionDate">·</span>
          <span v-if="inspectionDate">{{ inspectionDate }}</span>
        </div>
      </div>

      <!-- Search Bar -->
      <div 
        class="flex-shrink-0 px-4 py-3 border-b relative"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              class="w-4 h-4" 
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search sections and data..."
            class="w-full pl-9 pr-8 py-2 rounded-lg text-sm border-0 focus:ring-2 transition-colors"
            :class="theme === 'dark' 
              ? 'bg-zinc-900 text-zinc-200 placeholder-zinc-500 focus:ring-zinc-700'
              : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:ring-slate-300'"
            @focus="handleSearchFocus"
            @blur="closeSearchResults"
            @input="handleSearchInput"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            :class="theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <div 
          v-if="showSearchResults && hasSearchResults"
          class="absolute left-4 right-4 top-full mt-1 rounded-lg shadow-lg border overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'"
        >
          <div 
            class="px-3 py-2 text-xs font-medium border-b"
            :class="theme === 'dark' ? 'bg-zinc-800/50 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'"
          >
            {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }} found
          </div>
          
          <div class="py-1">
            <button
              v-for="(result, idx) in searchResults"
              :key="`${result.categoryIndex}-${result.sectionIndex}-${idx}`"
              @mousedown.prevent="selectSearchResult(result)"
              class="w-full px-3 py-2.5 text-left transition-colors flex flex-col gap-1 border-b last:border-b-0"
              :class="theme === 'dark'
                ? 'hover:bg-zinc-800 border-zinc-800/50'
                : 'hover:bg-slate-50 border-slate-100'"
            >
              <!-- Section/Category info -->
              <div class="flex items-center gap-2">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                  :class="result.matchType === 'section'
                    ? theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    : theme === 'dark' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'"
                >
                  {{ result.matchType === 'section' ? 'Section' : 'Data' }}
                </span>
                <span 
                  class="text-xs font-medium"
                  :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
                >
                  {{ result.categoryTitle }}
                </span>
                <span 
                  class="text-xs"
                  :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
                >
                  •
                </span>
                <span 
                  class="text-xs"
                  :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
                >
                  {{ result.sectionTitle }}
                </span>
              </div>
              
              <!-- Match preview -->
              <div 
                v-if="result.preview"
                class="text-sm line-clamp-2"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
              >
                {{ result.preview }}
              </div>
            </button>
          </div>

          <!-- No results state -->
          <div 
            v-if="searchQuery.length >= 2 && searchResults.length === 0"
            class="px-4 py-8 text-center"
          >
            <svg 
              class="w-8 h-8 mx-auto mb-2 opacity-30"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p 
              class="text-sm"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              No results found
            </p>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div 
        class="flex-shrink-0 border-b"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50'"
      >
        <div class="flex justify-around px-2 py-2.5">
          <button
            v-for="(category, idx) in categories"
            :key="category.id"
            @click="goToCategory(idx)"
            class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[56px]"
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
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getCategoryIcon(category.icon)" />
            </svg>
            <span class="truncate max-w-[60px]">{{ category.title.split(' ')[0] }}</span>
          </button>
        </div>
      </div>

      <!-- Section Pills (Horizontal Scroll) -->
      <div 
        v-if="currentCategory && currentCategory.sections.length > 1 && !currentCategory.comingSoon"
        class="flex-shrink-0 border-b"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <div class="overflow-x-auto scrollbar-visible">
          <div class="flex gap-2 px-4 py-2.5 min-w-min">
            <button
              v-for="(section, idx) in currentCategory.sections"
              :key="section.id"
              @click="goToSection(currentCategoryIndex, idx)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              :class="[
                currentSectionIndex === idx
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : section.hasData
                    ? theme === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : theme === 'dark'
                      ? 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              ]"
            >
              <span 
                v-if="currentSectionIndex === idx"
                class="w-1.5 h-1.5 rounded-full bg-current opacity-80"
              ></span>
              {{ section.title }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16 px-4">
          <div class="relative">
            <svg 
              class="w-10 h-10 animate-spin"
              :class="theme === 'dark' ? 'text-zinc-700' : 'text-slate-300'"
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
              <path 
                class="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
              />
            </svg>
          </div>
          <p 
            class="text-sm mt-4"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Loading field notes...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-16 px-4">
          <div 
            class="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-red-950/50' : 'bg-red-50'"
          >
            <svg 
              class="w-7 h-7"
              :class="theme === 'dark' ? 'text-red-400' : 'text-red-500'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 
            class="text-sm font-semibold mb-1"
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
        <div v-else-if="currentCategory?.comingSoon" class="flex flex-col items-center justify-center py-16 px-4">
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
        <div v-else-if="currentSection" class="px-4 py-4">
          <!-- Section Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 
                class="text-lg font-semibold"
                :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
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
              class="px-2.5 py-1 rounded-full text-xs font-medium"
              :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'"
            >
              No data
            </div>
          </div>

          <!-- Data Renderer -->
          <DataRenderer 
            :data="currentSection.rawData" 
            :section-title="currentSection.title"
            :layout-mode="getLayoutMode(currentSection.title)"
          />

          <!-- Photos -->
          <div 
            v-if="currentSection.photos.length > 0" 
            class="mt-6 pt-4 border-t" 
            :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 
                class="text-xs font-semibold uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
              >
                Photos
              </h4>
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'"
              >
                {{ currentSection.photos.length }}
              </span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(photo, idx) in currentSection.photos.slice(0, 8)"
                :key="photo.id"
                class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ring-1"
                :class="theme === 'dark' ? 'bg-zinc-800 ring-zinc-700' : 'bg-slate-200 ring-slate-300'"
                @click="emit('view-photos', currentSection.photos)"
              >
                <img
                  :src="getThumbnailUrl(photo)"
                  :alt="photo.filename || `Photo ${idx + 1}`"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <button
                v-if="currentSection.photos.length > 8"
                class="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'"
                @click="emit('view-photos', currentSection.photos)"
              >
                <span class="text-lg">+{{ currentSection.photos.length - 8 }}</span>
                <span class="text-[10px] opacity-70">more</span>
              </button>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-16 px-4">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            :class="theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-100'"
          >
            <svg 
              class="w-8 h-8"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
            class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:bg-zinc-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <button
            v-if="totalPhotos > 0"
            @click="viewAllPhotos"
            class="px-3 py-2 rounded-lg text-xs font-medium transition-all"
            :class="theme === 'dark'
              ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'"
          >
            All Photos ({{ totalPhotos }})
          </button>

          <button
            @click="nextSection"
            :disabled="!canGoNext()"
            class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :class="theme === 'dark'
              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:bg-zinc-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200'"
          >
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
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

/* Visible but subtle scrollbar for horizontal section pills */
.scrollbar-visible {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

.scrollbar-visible::-webkit-scrollbar {
  height: 8px;
}

.scrollbar-visible::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-visible::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 4px;
}

.scrollbar-visible::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

/* Dark theme scrollbar */
:global(.dark) .scrollbar-visible {
  scrollbar-color: rgba(82, 82, 91, 0.6) transparent;
}

:global(.dark) .scrollbar-visible::-webkit-scrollbar-thumb {
  background-color: rgba(82, 82, 91, 0.6);
}

:global(.dark) .scrollbar-visible::-webkit-scrollbar-thumb:hover {
  background-color: rgba(82, 82, 91, 0.8);
}
</style>
