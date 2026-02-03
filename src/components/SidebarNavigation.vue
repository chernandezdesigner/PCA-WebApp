<script setup lang="ts">
import { ref, computed, watch } from 'vue';

export interface NavSubsection {
  id: string;
  title: string;
  step: number;
}

export interface NavSection {
  id: string;
  title: string;
  subsections: NavSubsection[];
}

const props = defineProps<{
  sections: NavSection[];
  currentSection: string;
  currentStep: number;
  completedSteps?: Set<number>;
}>();

const emit = defineEmits<{
  'navigate': [sectionId: string, step: number];
}>();

// Track expanded sections
const expandedSections = ref<Set<string>>(new Set());

// Auto-expand section containing current step
watch(
  () => props.currentStep,
  () => {
    for (const section of props.sections) {
      if (section.subsections.some((sub) => sub.step === props.currentStep)) {
        expandedSections.value.add(section.id);
      }
    }
  },
  { immediate: true }
);

function toggleSection(sectionId: string) {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId);
  } else {
    expandedSections.value.add(sectionId);
  }
}

function isExpanded(sectionId: string): boolean {
  return expandedSections.value.has(sectionId);
}

function isActiveSubsection(step: number): boolean {
  return props.currentStep === step;
}

function isCompleted(step: number): boolean {
  return props.completedSteps?.has(step) ?? false;
}

function handleNavigate(sectionId: string, step: number) {
  emit('navigate', sectionId, step);
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent, sectionId: string) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleSection(sectionId);
  }
}

function handleSubsectionKeydown(event: KeyboardEvent, sectionId: string, step: number) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleNavigate(sectionId, step);
  }
}

// Calculate section progress
function getSectionProgress(section: NavSection): { completed: number; total: number } {
  const total = section.subsections.length;
  const completed = section.subsections.filter((sub) => 
    props.completedSteps?.has(sub.step)
  ).length;
  return { completed, total };
}
</script>

<template>
  <nav
    class="sidebar-nav h-full flex flex-col bg-zinc-950 border-r border-zinc-800"
    role="navigation"
    aria-label="Report sections navigation"
  >
    <!-- Header -->
    <div class="flex-shrink-0 px-4 py-5 border-b border-zinc-800">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Report Sections
      </h2>
    </div>

    <!-- Scrollable section list -->
    <div class="flex-1 overflow-y-auto py-2" role="tree" aria-label="Sections">
      <div
        v-for="section in sections"
        :key="section.id"
        class="section-group"
        role="treeitem"
        :aria-expanded="isExpanded(section.id)"
      >
        <!-- Section Header -->
        <button
          type="button"
          class="section-header group w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          :class="{ 'bg-zinc-900': isExpanded(section.id) }"
          :aria-controls="`section-${section.id}-content`"
          :aria-expanded="isExpanded(section.id)"
          @click="toggleSection(section.id)"
          @keydown="handleKeydown($event, section.id)"
        >
          <div class="flex-1 min-w-0">
            <span class="block text-sm font-medium text-zinc-200 truncate">
              {{ section.title }}
            </span>
            <!-- Progress indicator -->
            <span class="block text-xs text-zinc-500 mt-0.5">
              {{ getSectionProgress(section).completed }} of {{ getSectionProgress(section).total }} complete
            </span>
          </div>
          
          <!-- Expand/collapse icon -->
          <svg
            class="flex-shrink-0 w-4 h-4 text-zinc-500 transition-transform duration-200"
            :class="{ '-rotate-180': isExpanded(section.id) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Subsections -->
        <div
          v-show="isExpanded(section.id)"
          :id="`section-${section.id}-content`"
          class="subsections"
          role="group"
          :aria-label="`${section.title} subsections`"
        >
          <button
            v-for="subsection in section.subsections"
            :key="subsection.id"
            type="button"
            role="treeitem"
            :aria-current="isActiveSubsection(subsection.step) ? 'page' : undefined"
            class="subsection-item group w-full flex items-center gap-3 px-4 py-2.5 pl-5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            :class="[
              isActiveSubsection(subsection.step)
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            ]"
            @click="handleNavigate(section.id, subsection.step)"
            @keydown="handleSubsectionKeydown($event, section.id, subsection.step)"
          >
            <!-- Status indicator -->
            <span 
              class="flex-shrink-0 w-2 h-2 rounded-full transition-colors"
              :class="[
                isActiveSubsection(subsection.step)
                  ? 'bg-white'
                  : isCompleted(subsection.step)
                  ? 'bg-emerald-500'
                  : 'bg-zinc-700 group-hover:bg-zinc-600'
              ]"
              :aria-label="isCompleted(subsection.step) ? 'Completed' : 'Not completed'"
            />
            
            <span class="flex-1 min-w-0 text-sm truncate">
              {{ subsection.title }}
            </span>

            <!-- Completed checkmark -->
            <svg
              v-if="isCompleted(subsection.step) && !isActiveSubsection(subsection.step)"
              class="flex-shrink-0 w-4 h-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer with overall progress -->
    <div class="flex-shrink-0 px-4 py-4 border-t border-zinc-800">
      <div class="flex items-center justify-between text-xs text-zinc-500 mb-2">
        <span>Overall Progress</span>
        <span>{{ completedSteps?.size || 0 }} / {{ sections.reduce((acc, s) => acc + s.subsections.length, 0) }}</span>
      </div>
      <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="completedSteps?.size || 0" :aria-valuemax="sections.reduce((acc, s) => acc + s.subsections.length, 0)">
        <div 
          class="h-full bg-emerald-500 transition-all duration-300"
          :style="{ width: `${((completedSteps?.size || 0) / sections.reduce((acc, s) => acc + s.subsections.length, 0)) * 100}%` }"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  width: 280px;
  min-width: 280px;
}

/* Custom scrollbar */
.sidebar-nav ::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav ::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav ::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}

.sidebar-nav ::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
