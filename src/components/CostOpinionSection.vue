<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CostOpinionConfig, FormData } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: CostOpinionConfig;
  modelValue: FormData;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormData];
}>();

const { theme } = useTheme();

interface DeficiencyRow {
  index: number;
  [key: string]: string | number;
}

const rows = ref<DeficiencyRow[]>([]);

function syncRowsFromModel() {
  const data = props.modelValue;
  const count = parseInt((data['_deficiency_count'] as string) || '0');
  const result: DeficiencyRow[] = [];
  for (let i = 1; i <= count; i++) {
    const row: DeficiencyRow = { index: i };
    for (const col of props.config.deficiencyColumns) {
      row[col.id] = (data[`def-row-${i}-${col.id}`] as string) || '';
    }
    result.push(row);
  }
  rows.value = result;
}

watch(() => props.modelValue, syncRowsFromModel, { immediate: true });

function emitUpdate(patch: Record<string, string | null>) {
  emit('update:modelValue', { ...props.modelValue, ...patch });
}

function getRowData(): Record<string, string> {
  const data: Record<string, string> = { _deficiency_count: String(rows.value.length) };
  for (const row of rows.value) {
    for (const col of props.config.deficiencyColumns) {
      data[`def-row-${row.index}-${col.id}`] = (row[col.id] as string) || '';
    }
  }
  return data;
}

function updateCell(rowIdx: number, colId: string, val: string) {
  rows.value[rowIdx][colId] = val;
  emitUpdate(getRowData());
}

function addRow() {
  const maxIdx = rows.value.reduce((m, r) => (r.index > m ? r.index : m), 0);
  const row: DeficiencyRow = { index: maxIdx + 1 };
  for (const col of props.config.deficiencyColumns) row[col.id] = '';
  rows.value.push(row);
  emitUpdate(getRowData());
}

function removeRow(rowIdx: number) {
  const removed = rows.value[rowIdx];
  rows.value.splice(rowIdx, 1);
  const data = getRowData();
  for (const col of props.config.deficiencyColumns) {
    data[`def-row-${removed.index}-${col.id}`] = '';
  }
  emitUpdate(data);
}

function getReserveField(fieldId: string): string {
  return (props.modelValue[fieldId] as string) || '';
}

function setReserveField(fieldId: string, value: string) {
  emitUpdate({ [fieldId]: value || null });
}

function parseCurrency(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function formatCurrencyInput(val: string): string {
  const num = parseCurrency(val);
  if (num === 0 && val.replace(/[^0-9]/g, '') === '') return '';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function handleCurrencyInput(rowIdx: number, colId: string, raw: string) {
  // Store the raw value so parseCurrency works for totals
  updateCell(rowIdx, colId, raw);
}

function handleCurrencyBlur(rowIdx: number, colId: string) {
  const raw = (rows.value[rowIdx][colId] as string) || '';
  if (raw.trim() === '') return;
  const formatted = formatCurrencyInput(raw);
  updateCell(rowIdx, colId, formatted);
}

function handleReserveBlur(fieldId: string) {
  const raw = getReserveField(fieldId);
  if (raw.trim() === '') return;
  const formatted = formatCurrencyInput(raw);
  setReserveField(fieldId, formatted);
}

const immediateCostTotal = computed(() =>
  rows.value.reduce((sum, r) => sum + parseCurrency((r['immediate-cost'] as string) || ''), 0)
);

const shortTermCostTotal = computed(() =>
  rows.value.reduce((sum, r) => sum + parseCurrency((r['short-term-cost'] as string) || ''), 0)
);

const grandTotal = computed(() => immediateCostTotal.value + shortTermCostTotal.value);

function fmtDollar(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const inputClass = computed(() =>
  theme.value === 'dark'
    ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
    : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'
);
</script>

<template>
  <div
    class="cost-opinion-section space-y-10"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <!-- ============================================================ -->
    <!-- TABLE 1: Deficiency Items                                     -->
    <!-- ============================================================ -->
    <section>
      <div class="flex items-center gap-3 mb-5">
        <div
          class="p-2 rounded-lg border"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
        >
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3
          class="text-lg font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          Physical Deficiencies / Deferred Maintenance
        </h3>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>

      <fieldset>
        <legend class="sr-only">Deficiency items with immediate and short-term costs</legend>

        <!-- Column headers -->
        <div
          v-if="rows.length > 0"
          class="hidden md:grid items-center gap-3 px-4 py-2 mb-1"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
          style="grid-template-columns: 2rem 1fr 10rem 10rem 2rem;"
        >
          <div></div>
          <div class="text-xs font-semibold uppercase tracking-wider">Item</div>
          <div class="text-xs font-semibold uppercase tracking-wider text-right">Immediate Costs</div>
          <div class="text-xs font-semibold uppercase tracking-wider text-right">Short-Term Costs</div>
          <div></div>
        </div>

        <!-- Rows -->
        <TransitionGroup name="list" tag="div" class="space-y-1.5">
          <div
            v-for="(row, rowIdx) in rows"
            :key="row.index"
            class="grid items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors"
            :class="theme === 'dark'
              ? 'border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/60'
              : 'border-slate-200 bg-white hover:bg-slate-50'"
            style="grid-template-columns: 2rem 1fr 10rem 10rem 2rem;"
          >
            <span
              class="text-xs font-medium text-right tabular-nums"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >{{ rowIdx + 1 }}</span>

            <!-- Item description -->
            <input
              :value="(row['item'] as string) || ''"
              type="text"
              placeholder="Describe deficiency item..."
              :disabled="disabled"
              :aria-label="`Item ${rowIdx + 1} description`"
              class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="inputClass"
              @input="updateCell(rowIdx, 'item', ($event.target as HTMLInputElement).value)"
            />

            <!-- Immediate cost -->
            <input
              :value="(row['immediate-cost'] as string) || ''"
              type="text"
              inputmode="decimal"
              placeholder="$0"
              :disabled="disabled"
              :aria-label="`Item ${rowIdx + 1} immediate cost`"
              class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="inputClass"
              @input="handleCurrencyInput(rowIdx, 'immediate-cost', ($event.target as HTMLInputElement).value)"
              @blur="handleCurrencyBlur(rowIdx, 'immediate-cost')"
            />

            <!-- Short-term cost -->
            <input
              :value="(row['short-term-cost'] as string) || ''"
              type="text"
              inputmode="decimal"
              placeholder="$0"
              :disabled="disabled"
              :aria-label="`Item ${rowIdx + 1} short-term cost`"
              class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="inputClass"
              @input="handleCurrencyInput(rowIdx, 'short-term-cost', ($event.target as HTMLInputElement).value)"
              @blur="handleCurrencyBlur(rowIdx, 'short-term-cost')"
            />

            <!-- Remove -->
            <button
              type="button"
              class="shrink-0 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              :class="theme === 'dark'
                ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10'
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
              :disabled="disabled"
              :aria-label="`Remove item ${rowIdx + 1}`"
              @click="removeRow(rowIdx)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </TransitionGroup>

        <!-- Add row button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-lg border border-dashed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          :class="theme === 'dark'
            ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50'
            : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50'"
          :disabled="disabled"
          @click="addRow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Deficiency Item
        </button>
      </fieldset>

      <!-- Totals -->
      <div class="mt-4 space-y-2">
        <div
          class="grid items-center gap-3 px-4 py-3 rounded-lg"
          :class="theme === 'dark' ? 'bg-zinc-800/40' : 'bg-slate-100'"
          style="grid-template-columns: 2rem 1fr 10rem 10rem 2rem;"
        >
          <div></div>
          <div
            class="text-sm font-semibold text-right"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-600'"
          >
            Sub-Total of Estimated Costs
          </div>
          <div
            class="text-sm font-bold text-right tabular-nums"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            {{ fmtDollar(immediateCostTotal) }}
          </div>
          <div
            class="text-sm font-bold text-right tabular-nums"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            {{ fmtDollar(shortTermCostTotal) }}
          </div>
          <div></div>
        </div>

        <div
          class="grid items-center gap-3 px-4 py-3 rounded-lg border-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700' : 'bg-slate-100 border-slate-300'"
          style="grid-template-columns: 2rem 1fr 20rem 2rem;"
        >
          <div></div>
          <div
            class="text-sm font-bold"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Total Estimated Physical Deficiencies / Deferred Maintenance
          </div>
          <div
            class="text-base font-bold text-right tabular-nums"
            :class="grandTotal > 0
              ? 'text-amber-500'
              : (theme === 'dark' ? 'text-zinc-100' : 'text-slate-900')"
          >
            {{ fmtDollar(grandTotal) }}
          </div>
          <div></div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TABLE 2: Capital Replacement Reserves                         -->
    <!-- ============================================================ -->
    <section>
      <div class="flex items-center gap-3 mb-5">
        <div
          class="p-2 rounded-lg border"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
        >
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3
          class="text-lg font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          12-Year Capital Replacement Reserves Summary
        </h3>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="field in config.reserveFields" :key="field.id">
            <label
              :for="`reserve-${field.id}`"
              class="block text-sm font-medium mb-2"
              :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
            >
              {{ field.label }}
            </label>
            <input
              :id="`reserve-${field.id}`"
              :value="getReserveField(field.id)"
              type="text"
              inputmode="decimal"
              :placeholder="field.placeholder || '$0'"
              :disabled="disabled"
              class="w-full px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all duration-200 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="inputClass"
              @input="setReserveField(field.id, ($event.target as HTMLInputElement).value)"
              @blur="handleReserveBlur(field.id)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Disclaimers -->
    <div
      class="p-4 rounded-lg border text-xs leading-relaxed space-y-2"
      :class="theme === 'dark'
        ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500'
        : 'bg-slate-50 border-slate-200 text-slate-500'"
    >
      <p>Conditions noted in the Property Condition Assessment Summary are representative of the overall conditions of the property. There may be more detail on specific assessment components in the Report text, therefore the Property Condition Assessment Summary should not be used as a standalone document.</p>
      <p>Costs shown in tables are rough approximations of cost and should not be used for budgeting purposes. If more detailed, thorough, or accurate estimated costs are desired, the services of a professional cost estimator should be engaged.</p>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
