<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from '@/composables/useTheme';

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

const { theme } = useTheme();
const expandedSections = ref<Set<string>>(new Set());

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
    class="sidebar-nav h-full flex flex-col transition-colors duration-300"
    :class="theme === 'dark' ? 'bg-zinc-950 border-r border-zinc-800' : 'bg-slate-50 border-r border-slate-200'"
    role="navigation"
    aria-label="Progress tracker"
  >
    <!-- Header -->
    <div class="flex-shrink-0 px-5 pt-6 pb-2">
      <h2 
        class="text-[11px] font-extrabold uppercase tracking-widest mb-4 pl-1"
        :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
      >
        Assessment Progress
      </h2>
    </div>

    <!-- Timeline Scroll Area -->
    <div class="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
      <div class="relative">
        
        <!-- Continuous vertical rail line -->
        <div 
          class="absolute left-[11px] top-2 bottom-2 w-px z-0"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-300'"
        ></div>

        <div v-for="section in sections" :key="section.id" class="relative z-10 mb-1">
          
          <!-- Section Header Node -->
          <div class="group">
            <button
              @click="toggleSection(section.id)"
              class="w-full flex items-center gap-3 py-2 text-left focus:outline-none"
            >
              <!-- Section Anchor Dot -->
              <div class="relative flex items-center justify-center flex-shrink-0 w-6 h-6">
                <div 
                  class="w-2.5 h-2.5 rounded-full border-2 transition-all duration-300"
                  :class="[
                    theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-50',
                    isExpanded(section.id) 
                      ? (theme === 'dark' ? 'border-zinc-100 bg-zinc-100 scale-110' : 'border-slate-900 bg-slate-900 scale-110')
                      : (theme === 'dark' ? 'border-zinc-600 group-hover:border-zinc-400' : 'border-slate-400 group-hover:border-slate-600')
                  ]"
                ></div>
              </div>

              <!-- Section Label -->
              <div class="flex-1 flex items-center justify-between">
                <span 
                  class="text-sm font-semibold transition-colors duration-200"
                  :class="[
                    isExpanded(section.id) 
                      ? (theme === 'dark' ? 'text-zinc-100' : 'text-slate-900')
                      : (theme === 'dark' ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-slate-500 group-hover:text-slate-700')
                  ]"
                >
                  {{ section.title }}
                </span>
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="[
                    { 'rotate-180': isExpanded(section.id) },
                    theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Subsections Timeline -->
          <div 
            v-show="isExpanded(section.id)"
            class="flex flex-col space-y-0.5 mt-0.5 mb-2"
          >
            <button
              v-for="sub in section.subsections"
              :key="sub.id"
              @click="emit('navigate', section.id, sub.step)"
              class="group flex items-center gap-3 py-1.5 w-full text-left focus:outline-none"
            >
              <!-- Timeline Dot Container -->
              <div class="relative flex items-center justify-center flex-shrink-0 w-6 h-6">
                <div 
                  class="relative z-10 rounded-full transition-all duration-300 flex items-center justify-center"
                  :class="[
                    isActive(sub.step) 
                      ? 'w-3.5 h-3.5 bg-blue-600 ring-2 ring-blue-500/30 shadow-[0_0_8px_rgba(37,99,235,0.5)]' 
                      : isCompleted(sub.step)
                        ? 'w-3 h-3 bg-emerald-500'
                        : theme === 'dark'
                          ? 'w-1.5 h-1.5 bg-zinc-700 group-hover:bg-zinc-500 ring-4 ring-zinc-950'
                          : 'w-1.5 h-1.5 bg-slate-400 group-hover:bg-slate-500 ring-4 ring-slate-50'
                  ]"
                >
                  <svg 
                    v-if="isCompleted(sub.step) && !isActive(sub.step)"
                    class="w-2 h-2"
                    :class="theme === 'dark' ? 'text-zinc-950' : 'text-white'"
                    viewBox="0 0 24 24"
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="4"
                  >
                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>

              <!-- Label Container -->
              <div 
                class="flex-1 py-1.5 px-3 rounded-md transition-all duration-200"
                :class="[
                  isActive(sub.step) 
                    ? (theme === 'dark' ? 'bg-zinc-900' : 'bg-blue-50')
                    : (theme === 'dark' ? 'group-hover:bg-zinc-900/50' : 'group-hover:bg-slate-100')
                ]"
              >
                <span 
                  class="text-xs font-medium transition-colors duration-200 block truncate"
                  :class="[
                    isActive(sub.step) 
                      ? 'text-blue-400' 
                      : isCompleted(sub.step)
                        ? (theme === 'dark' ? 'text-zinc-300' : 'text-slate-700')
                        : (theme === 'dark' ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-slate-500 group-hover:text-slate-700')
                  ]"
                >
                  {{ sub.title }}
                </span>
              </div>
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

:global(.light) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
:global(.light) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
