<script setup lang="ts">
import { computed } from 'vue';
import type { ConditionSummaryConfig, FormData } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: ConditionSummaryConfig;
  modelValue: FormData;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormData];
}>();

const { theme } = useTheme();

function getCondition(rowId: string): string | null {
  const val = props.modelValue[`${rowId}-condition`];
  return typeof val === 'string' ? val : null;
}

function getAction(rowId: string): string {
  const val = props.modelValue[`${rowId}-action`];
  return typeof val === 'string' ? val : '';
}

function setCondition(rowId: string, value: string) {
  const current = getCondition(rowId);
  emit('update:modelValue', {
    ...props.modelValue,
    [`${rowId}-condition`]: current === value ? null : value,
  });
}

function setAction(rowId: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [`${rowId}-action`]: value || null,
  });
}

function isRowComplete(rowId: string): boolean {
  return !!getCondition(rowId) && !!getAction(rowId);
}

const completionCount = computed(() =>
  props.config.rows.filter(r => isRowComplete(r.id)).length
);

function conditionBtnClass(rowId: string, option: string): string {
  const selected = getCondition(rowId) === option;
  const isDark = theme.value === 'dark';
  const base = 'flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 cursor-pointer';
  const offset = isDark ? 'focus-visible:ring-offset-zinc-950' : 'focus-visible:ring-offset-white';

  if (selected) {
    if (option === 'Good') return `${base} ${offset} bg-emerald-600 text-white shadow-sm z-10`;
    if (option === 'Fair') return `${base} ${offset} bg-amber-500 text-black shadow-sm z-10`;
    if (option === 'Poor') return `${base} ${offset} bg-red-600 text-white shadow-sm z-10`;
    return `${base} ${offset} bg-blue-600 text-white shadow-sm z-10`;
  }

  if (isDark) {
    return `${base} ${offset} bg-zinc-900 border-y border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-zinc-800`;
  }
  return `${base} ${offset} bg-white border-y border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-slate-200`;
}
</script>

<template>
  <div
    class="condition-summary-section"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <!-- Progress + Legend header -->
    <div class="flex items-start justify-between gap-4 mb-6">
      <div
        class="flex-1 p-4 rounded-lg border text-xs"
        :class="theme === 'dark'
          ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
          : 'bg-slate-50 border-slate-200 text-slate-500'"
      >
        <p
          class="font-semibold mb-1.5"
          :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-600'"
        >
          Indicators of Recommended Action
        </p>
        <div class="flex flex-wrap gap-x-5 gap-y-1">
          <span v-for="opt in config.actionOptions" :key="opt.value">
            <strong :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'">{{ opt.value }}</strong>
            = {{ opt.label }}
          </span>
        </div>
      </div>

      <div
        class="shrink-0 px-4 py-3 rounded-lg border text-center"
        :class="theme === 'dark'
          ? 'bg-zinc-900/40 border-zinc-800/60'
          : 'bg-slate-50 border-slate-200'"
      >
        <div
          class="text-2xl font-bold tabular-nums"
          :class="completionCount === config.rows.length
            ? 'text-emerald-500'
            : (theme === 'dark' ? 'text-zinc-300' : 'text-slate-700')"
        >
          {{ completionCount }}/{{ config.rows.length }}
        </div>
        <div
          class="text-[10px] font-medium uppercase tracking-wider mt-0.5"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
        >
          Complete
        </div>
      </div>
    </div>

    <!-- Column Headers -->
    <div
      class="hidden md:grid items-center gap-3 px-4 py-2 mb-1"
      :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
      style="grid-template-columns: 2rem 1fr 11rem 9rem 1.5rem;"
    >
      <div></div>
      <div class="text-xs font-semibold uppercase tracking-wider">Construction System</div>
      <div class="text-xs font-semibold uppercase tracking-wider text-center">Condition</div>
      <div class="text-xs font-semibold uppercase tracking-wider text-center">Action</div>
      <div></div>
    </div>

    <!-- Rows -->
    <fieldset class="space-y-1.5">
      <legend class="sr-only">Property Condition Summary for all construction systems</legend>

      <div
        v-for="(row, idx) in config.rows"
        :key="row.id"
        class="grid items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors"
        :class="[
          isRowComplete(row.id)
            ? (theme === 'dark' ? 'border-emerald-800/40 bg-emerald-950/20' : 'border-emerald-200/60 bg-emerald-50/30')
            : (theme === 'dark' ? 'border-zinc-800/60 bg-zinc-900/30' : 'border-slate-200 bg-white'),
          theme === 'dark' ? 'hover:bg-zinc-900/60' : 'hover:bg-slate-50',
        ]"
        style="grid-template-columns: 2rem 1fr 11rem 9rem 1.5rem;"
      >
        <!-- Row number -->
        <span
          class="text-xs font-medium text-right tabular-nums"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >
          {{ idx + 1 }}
        </span>

        <!-- System label -->
        <div
          class="text-sm font-medium truncate"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
          :title="`${row.id.replace('-', '.')} ${row.label}`"
        >
          <span
            class="text-xs mr-1.5"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
          >{{ row.id.replace('-', '.') }}</span>{{ row.label }}
        </div>

        <!-- Condition toggles -->
        <div
          class="flex rounded-md shadow-sm"
          role="radiogroup"
          :aria-label="`Condition rating for ${row.label}`"
        >
          <button
            v-for="cond in config.conditionOptions"
            :key="cond"
            type="button"
            role="radio"
            :aria-checked="getCondition(row.id) === cond"
            :class="conditionBtnClass(row.id, cond)"
            :disabled="disabled"
            @click="setCondition(row.id, cond)"
          >
            {{ cond }}
          </button>
        </div>

        <!-- Action dropdown -->
        <select
          :value="getAction(row.id)"
          :disabled="disabled"
          :aria-label="`Recommended action for ${row.label}`"
          class="w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-no-repeat"
          :class="[
            theme === 'dark'
              ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 hover:border-zinc-700 focus:border-blue-500/50'
              : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300 focus:border-blue-500/50',
            !getAction(row.id) && (theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'),
          ]"
          style="background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.5rem center; background-size: 1.25em 1.25em; padding-right: 2rem;"
          @change="setAction(row.id, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Select...</option>
          <option
            v-for="opt in config.actionOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.value }} &mdash; {{ opt.label }}
          </option>
        </select>

        <!-- Completion dot -->
        <div class="flex justify-center">
          <div
            v-if="isRowComplete(row.id)"
            class="w-2 h-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
        </div>
      </div>
    </fieldset>
  </div>
</template>
