<script setup lang="ts">
import { ref } from 'vue';
import type { ChecklistConfig, FormData } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: ChecklistConfig;
  modelValue: FormData;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormData];
}>();

const { theme } = useTheme();

const expandedComments = ref<Set<string>>(new Set());

function getAnswer(questionId: string): string | null {
  const val = props.modelValue[questionId];
  if (typeof val === 'object' && val !== null) return val.answer || null;
  return null;
}

function getComment(questionId: string): string {
  const val = props.modelValue[questionId];
  if (typeof val === 'object' && val !== null) return val.comment || '';
  return '';
}

function setAnswer(questionId: string, answer: string) {
  const current = props.modelValue[questionId];
  const existing = typeof current === 'object' && current !== null ? current : {};
  const currentAnswer = existing.answer || null;

  emit('update:modelValue', {
    ...props.modelValue,
    [questionId]: {
      ...existing,
      answer: currentAnswer === answer ? null : answer,
      comment: existing.comment || '',
    },
  });
}

function setComment(questionId: string, comment: string) {
  const current = props.modelValue[questionId];
  const existing = typeof current === 'object' && current !== null ? current : {};

  emit('update:modelValue', {
    ...props.modelValue,
    [questionId]: {
      ...existing,
      answer: existing.answer || null,
      comment,
    },
  });
}

function toggleComment(questionId: string) {
  if (expandedComments.value.has(questionId)) {
    expandedComments.value.delete(questionId);
  } else {
    expandedComments.value.add(questionId);
  }
}

function isCommentVisible(questionId: string): boolean {
  return expandedComments.value.has(questionId) || getComment(questionId).length > 0;
}

function getToggleClass(questionId: string, option: string): string {
  const selected = getAnswer(questionId) === option;
  const isDark = theme.value === 'dark';
  const base = 'flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer';

  if (selected) {
    return `${base} bg-blue-600 text-white shadow-sm z-10`;
  }

  if (isDark) {
    return `${base} bg-zinc-900 border-y border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg border-x-px border-x-zinc-800`;
  }
  return `${base} bg-white border-y border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg border-x-px border-x-slate-200`;
}
</script>

<template>
  <div class="ada-checklist-section space-y-10">
    <div
      v-for="category in config.categories"
      :key="category.id"
      class="category-block"
    >
      <!-- Category Header -->
      <div class="flex items-center gap-3 mb-5">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          :class="theme === 'dark'
            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
            : 'bg-blue-50 text-blue-700 border border-blue-200'"
        >
          {{ category.letter }}
        </div>
        <h3
          class="text-base font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          {{ category.title }}
        </h3>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        ></div>
      </div>

      <!-- Questions -->
      <div class="space-y-3 pl-2">
        <div
          v-for="(question, qIdx) in category.questions"
          :key="question.id"
          class="rounded-lg border transition-colors"
          :class="theme === 'dark'
            ? 'bg-zinc-900/40 border-zinc-800/60'
            : 'bg-white border-slate-200'"
        >
          <!-- Question Row -->
          <div class="flex items-start gap-3 px-4 py-3">
            <!-- Number -->
            <span
              class="text-xs font-medium pt-2 shrink-0 w-5 text-right"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ qIdx + 1 }}
            </span>

            <!-- Question Text -->
            <p
              class="flex-1 text-sm leading-relaxed pt-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              {{ question.text }}
            </p>

            <!-- Yes / No / N/A Toggle -->
            <div class="flex rounded-lg shadow-sm shrink-0 w-56">
              <button
                v-for="option in ['Yes', 'No', 'N/A']"
                :key="option"
                type="button"
                :class="getToggleClass(question.id, option)"
                :disabled="disabled"
                @click="setAnswer(question.id, option)"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Comment Toggle + Textarea -->
          <div class="px-4 pb-3">
            <button
              v-if="!isCommentVisible(question.id)"
              type="button"
              class="inline-flex items-center gap-1.5 text-xs font-medium transition-colors ml-8"
              :class="theme === 'dark'
                ? 'text-zinc-600 hover:text-zinc-400'
                : 'text-slate-400 hover:text-slate-600'"
              @click="toggleComment(question.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add comment
            </button>

            <div v-else class="ml-8">
              <textarea
                :value="getComment(question.id)"
                rows="2"
                placeholder="Add comment..."
                :disabled="disabled"
                class="block w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                :class="theme === 'dark'
                  ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
                @input="setComment(question.id, ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="section-block relative">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-2 rounded-lg border"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
        >
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3
          class="text-lg font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          Recommendations
        </h3>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        ></div>
      </div>

      <div
        class="pl-6 ml-3 border-l-2"
        :class="theme === 'dark' ? 'border-l-emerald-600/30' : 'border-l-emerald-400/50'"
      >
        <label
          class="block text-sm font-medium mb-3 transition-colors"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          Recommendations
        </label>
        <textarea
          :value="(modelValue['_recommendations'] as string) || ''"
          rows="4"
          placeholder="Enter ADA recommendations..."
          :disabled="disabled"
          class="block w-full px-4 py-3 rounded-lg text-sm shadow-sm transition-all duration-150 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          :class="theme === 'dark'
            ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
            : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
          @input="emit('update:modelValue', { ...modelValue, _recommendations: ($event.target as HTMLTextAreaElement).value })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  min-height: 48px;
}
</style>
