<script setup lang="ts">
import { ref, watch } from 'vue';

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

const expandedSections = ref<Set<string>>(new Set());

// Auto-expand logic
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

function isActive(step: number): boolean {
  return props.currentStep === step;
}

function isCompleted(step: number): boolean {
  return props.completedSteps?.has(step) ?? false;
}
</script>

<template>
  <nav
    class="sidebar-nav h-full flex flex-col bg-zinc-950 border-r border-zinc-800"
    role="navigation"
    aria-label="Progress tracker"
  >
    <!-- Header -->
    <div class="flex-shrink-0 px-6 py-6">
      <h2 class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
        Assessment Progress
      </h2>
      <div class="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mt-2">
        <div 
          class="h-full bg-blue-600 transition-all duration-500 ease-out"
          :style="{ width: `${((completedSteps?.size || 0) / sections.reduce((acc, s) => acc + s.subsections.length, 0)) * 100}%` }"
        />
      </div>
    </div>

    <!-- Timeline Scroll Area -->
    <div class="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
      <div class="space-y-1">
        <div v-for="section in sections" :key="section.id" class="relative">
          
          <!-- Section Header -->
          <button
            @click="toggleSection(section.id)"
            class="w-full flex items-center justify-between py-3 px-2 group focus:outline-none"
          >
            <span 
              class="text-sm font-semibold transition-colors duration-200"
              :class="isExpanded(section.id) ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-300'"
            >
              {{ section.title }}
            </span>
            <svg
              class="w-4 h-4 text-zinc-600 transition-transform duration-200"
              :class="{ 'rotate-180': isExpanded(section.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Subsection Timeline -->
          <div 
            v-show="isExpanded(section.id)"
            class="relative ml-2 pl-4 border-l-2 border-zinc-800 space-y-1 pb-2 transition-all duration-300"
          >
            <button
              v-for="sub in section.subsections"
              :key="sub.id"
              @click="emit('navigate', section.id, sub.step)"
              class="group relative w-full flex items-center py-2 px-3 rounded-md text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              :class="isActive(sub.step) ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'"
            >
              <!-- Timeline Dot -->
              <div 
                class="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 z-10"
                :class="[
                  isActive(sub.step) 
                    ? 'bg-blue-600 border-blue-600 ring-4 ring-zinc-950' 
                    : isCompleted(sub.step)
                      ? 'bg-zinc-950 border-emerald-500'
                      : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'
                ]"
              >
                <!-- Checkmark for completed -->
                <svg 
                  v-if="isCompleted(sub.step) && !isActive(sub.step)"
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="4"
                >
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <!-- Text Content -->
              <span 
                class="text-sm transition-colors duration-200"
                :class="[
                  isActive(sub.step) 
                    ? 'text-blue-400 font-medium' 
                    : isCompleted(sub.step)
                      ? 'text-zinc-300'
                      : 'text-zinc-500 group-hover:text-zinc-400'
                ]"
              >
                {{ sub.title }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
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
