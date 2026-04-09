<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import type { FieldConfig, FieldValue, FormData, RepeatingTextField, DynamicTableField as DynamicTableFieldType, EquipmentField } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  field: FieldConfig;
  modelValue: FieldValue;
  formData?: FormData;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FieldValue];
}>();

const { theme } = useTheme();
const fieldId = useId();

// Get the default value from field config
const fieldDefaultValue = computed(() => {
  const field = props.field.type === 'conditional' ? props.field.innerField : props.field;
  return (field as any).defaultValue || '';
});

// For simple string values - use defaultValue as fallback
const value = computed({
  get: () => {
    // If modelValue is explicitly set (even empty string from user clearing), use it
    if (props.modelValue !== null && props.modelValue !== undefined) {
      return props.modelValue as string;
    }
    // Otherwise fall back to defaultValue
    return fieldDefaultValue.value;
  },
  set: (val) => emit('update:modelValue', val),
});

// For compound values (text with source, additional fields)
const compoundValue = computed({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return props.modelValue as Record<string, string>;
    }
    return { main: (props.modelValue as string) || '' };
  },
  set: (val) => emit('update:modelValue', val),
});

function updateCompoundField(key: string, newValue: string) {
  const updated = { ...compoundValue.value, [key]: newValue };
  emit('update:modelValue', updated);
}

const isFocused = ref(false);

const isVisible = computed(() => {
  if (props.field.type !== 'conditional') return true;
  if (!props.formData) return false;
  
  const conditionField = props.field.condition.field;
  const conditionValue = props.field.condition.value;
  const conditionMode = props.field.condition.mode || 'exact';
  const rawValue = props.formData[conditionField];
  const currentStr = (rawValue === null || rawValue === undefined) ? '' : String(rawValue);
  
  let matches: boolean;
  if (conditionMode === 'includes') {
    matches = Array.isArray(conditionValue)
      ? conditionValue.some(v => currentStr.includes(v))
      : currentStr.includes(conditionValue);
  } else {
    matches = Array.isArray(conditionValue)
      ? conditionValue.includes(currentStr)
      : currentStr === conditionValue;
  }
  
  return props.field.showWhen ? matches : !matches;
});

function insertQuickOption(text: string) {
  const current = value.value || '';
  value.value = current ? `${current} ${text}` : text;
}

function setCondition(option: string) {
  value.value = option;
}

function setBooleanOption(optionValue: string) {
  value.value = optionValue;
}

const renderField = computed(() => {
  return props.field.type === 'conditional' ? props.field.innerField : props.field;
});

// Dynamic repeating-text items management
const dynamicItems = ref<{ id: string; placeholder: string }[]>([]);

function initDynamicItems() {
  const field = renderField.value;
  if (field.type !== 'repeating-text') return;
  const rf = field as RepeatingTextField;
  const baseItems = [...(rf.items || [])];
  if (rf.dynamic) {
    const existing = compoundValue.value;
    const prefix = rf.itemPrefix || 'item';
    const knownIds = new Set(baseItems.map(i => i.id));
    const extraKeys = Object.keys(existing)
      .filter(k => k.startsWith(prefix + '-') && !knownIds.has(k) && k !== 'main' && existing[k])
      .sort((a, b) => {
        const numA = parseInt(a.split('-').pop() || '0');
        const numB = parseInt(b.split('-').pop() || '0');
        return numA - numB;
      });
    for (const key of extraKeys) {
      const n = parseInt(key.split('-').pop() || '0');
      const tpl = rf.itemPlaceholderTemplate || `Item {n}`;
      baseItems.push({ id: key, placeholder: tpl.replace('{n}', String(n)) });
    }
  }
  dynamicItems.value = baseItems;
}

watch(renderField, initDynamicItems, { immediate: true });

function addDynamicItem() {
  const field = renderField.value;
  if (field.type !== 'repeating-text') return;
  const rf = field as RepeatingTextField;
  const prefix = rf.itemPrefix || 'item';
  const maxN = dynamicItems.value.reduce((max, item) => {
    const n = parseInt(item.id.split('-').pop() || '0');
    return n > max ? n : max;
  }, 0);
  const newN = maxN + 1;
  const tpl = rf.itemPlaceholderTemplate || `Item {n}`;
  dynamicItems.value.push({
    id: `${prefix}-${newN}`,
    placeholder: tpl.replace('{n}', String(newN)),
  });
}

function removeDynamicItem(index: number) {
  const item = dynamicItems.value[index];
  if (!item) return;
  dynamicItems.value.splice(index, 1);
  const updated = { ...compoundValue.value };
  delete updated[item.id];
  emit('update:modelValue', updated);
}

// Dynamic table rows management
interface TableRow {
  index: number;
  [key: string]: string | number;
}
const tableRows = ref<TableRow[]>([]);

function initTableRows() {
  const field = renderField.value;
  if (field.type !== 'dynamic-table') return;
  const data = compoundValue.value;
  const count = parseInt(data._count || '0');
  const cols = (field as DynamicTableFieldType).columns;
  const rows: TableRow[] = [];
  for (let i = 1; i <= count; i++) {
    const row: TableRow = { index: i };
    for (const c of cols) row[c.id] = data[`row-${i}-${c.id}`] || '';
    rows.push(row);
  }
  tableRows.value = rows;
}

watch(renderField, (f) => { if (f.type === 'dynamic-table') initTableRows(); }, { immediate: true });

function getTableData(): Record<string, string> {
  const field = renderField.value as DynamicTableFieldType;
  const data: Record<string, string> = { _count: String(tableRows.value.length) };
  for (const row of tableRows.value) {
    for (const c of field.columns) data[`row-${row.index}-${c.id}`] = (row[c.id] as string) || '';
  }
  return data;
}

function updateTableCell(rowIdx: number, colId: string, val: string) {
  tableRows.value[rowIdx][colId] = val;
  emit('update:modelValue', getTableData());
}

function addTableRow() {
  const field = renderField.value as DynamicTableFieldType;
  const maxIdx = tableRows.value.reduce((m, r) => r.index > m ? r.index : m, 0);
  const row: TableRow = { index: maxIdx + 1 };
  for (const c of field.columns) row[c.id] = '';
  tableRows.value.push(row);
  emit('update:modelValue', getTableData());
}

function removeTableRow(rowIdx: number) {
  tableRows.value.splice(rowIdx, 1);
  emit('update:modelValue', getTableData());
}

function getTableConditionClass(option: string, current: string): string {
  const isSelected = current === option;
  const isDark = theme.value === 'dark';
  const base = 'flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  if (isSelected) {
    if (option === 'Good') return `${base} bg-emerald-600 text-white shadow-sm z-10`;
    if (option === 'Fair') return `${base} bg-amber-500 text-black shadow-sm z-10`;
    if (option === 'Poor') return `${base} bg-red-600 text-white shadow-sm z-10`;
    return `${base} bg-blue-600 text-white`;
  }
  if (isDark) return `${base} bg-zinc-900 border-y border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-zinc-800`;
  return `${base} bg-white border-y border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-slate-200`;
}

// Normalize quickOptions to always be an array (handles both single object and array formats)
const normalizedQuickOptions = computed(() => {
  const field = renderField.value as any;
  if (!field.quickOptions) return [];
  if (Array.isArray(field.quickOptions)) return field.quickOptions;
  // Single object format - wrap in array
  return [field.quickOptions];
});

function isConditionSelected(option: string): boolean {
  return value.value === option;
}

function getConditionButtonClass(option: string): string {
  const isSelected = isConditionSelected(option);
  const isDark = theme.value === 'dark';
  const baseClass = 'relative flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';
  
  if (isSelected) {
    if (option === 'Good') return `${baseClass} bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 z-10`;
    if (option === 'Fair') return `${baseClass} bg-amber-500 text-black shadow-lg shadow-amber-900/50 z-10`;
    if (option === 'Poor') return `${baseClass} bg-red-600 text-white shadow-lg shadow-red-900/50 z-10`;
    return `${baseClass} bg-blue-600 text-white`;
  }
  
  if (isDark) {
    return `${baseClass} bg-zinc-900 border-y border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg border-x-px border-x-zinc-800 focus-visible:ring-offset-zinc-950`;
  }
  return `${baseClass} bg-white border-y border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg border-x-px border-x-slate-200 focus-visible:ring-offset-white`;
}
</script>

<template>
  <div 
    v-if="isVisible" 
    class="dynamic-field group"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <!-- Textarea Field -->
    <template v-if="renderField.type === 'textarea'">
      <div class="space-y-3">
        <div>
          <label 
            :for="fieldId"
            class="block text-sm font-medium transition-colors"
            :class="theme === 'dark' ? 'text-zinc-200 group-hover:text-zinc-100' : 'text-slate-700 group-hover:text-slate-900'"
          >
            {{ renderField.label }}
          </label>
          <p 
            v-if="renderField.helperText"
            class="mt-1 text-xs"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ renderField.helperText }}
          </p>
        </div>
        
        <div class="relative">
          <textarea
            :id="fieldId"
            v-model="value"
            :rows="renderField.rows || 3"
            :placeholder="renderField.placeholder"
            :disabled="disabled"
            class="block w-full px-4 py-3 rounded-lg text-sm shadow-sm transition-all duration-150 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            :class="theme === 'dark' 
              ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
              : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
        </div>

        <!-- Quick Options -->
        <div 
          v-if="normalizedQuickOptions.length" 
          class="pt-1"
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(option, index) in normalizedQuickOptions"
              :key="index"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group/chip"
              :class="theme === 'dark'
                ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/30'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'"
              @click="insertQuickOption(option.text)"
            >
              <svg 
                class="w-3 h-3 opacity-60 group-hover/chip:opacity-100 transition-opacity" 
                :class="theme === 'dark' ? 'text-zinc-400 group-hover/chip:text-blue-400' : 'text-slate-400 group-hover/chip:text-blue-600'"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Condition Selector -->
    <template v-else-if="renderField.type === 'condition-selector'">
      <fieldset class="space-y-3">
        <legend 
          class="block text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          {{ renderField.label }}
        </legend>
        
        <div 
          class="flex rounded-lg shadow-sm"
          role="radiogroup"
        >
          <button
            v-for="option in renderField.options"
            :key="option"
            type="button"
            role="radio"
            :aria-checked="isConditionSelected(option)"
            :class="getConditionButtonClass(option)"
            :disabled="disabled"
            @click="setCondition(option)"
          >
            {{ option }}
          </button>
        </div>
      </fieldset>
    </template>

    <!-- Text Field (with optional source and additional fields) -->
    <template v-else-if="renderField.type === 'text'">
      <div class="space-y-2">
        <label 
          :for="fieldId"
          class="block text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          {{ renderField.label }}
        </label>
        
        <!-- Main field row -->
        <div class="flex gap-3">
          <input
            :id="fieldId"
            :value="(renderField.sourceLabel || renderField.additionalFields?.length) ? compoundValue.main : value"
            type="text"
            :placeholder="renderField.placeholder"
            :disabled="disabled"
            class="flex-[2] min-w-0 px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            :class="theme === 'dark'
              ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
              : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
            @input="(renderField.sourceLabel || renderField.additionalFields?.length) ? updateCompoundField('main', ($event.target as HTMLInputElement).value) : (value = ($event.target as HTMLInputElement).value)"
          />
          
          <!-- Source field -->
          <div v-if="renderField.sourceLabel" class="flex items-center gap-2 flex-1 min-w-0">
            <span 
              class="text-xs font-medium whitespace-nowrap"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              {{ renderField.sourceLabel }}
            </span>
            <input
              :value="compoundValue.source || ''"
              type="text"
              :placeholder="renderField.sourcePlaceholder"
              :disabled="disabled"
              class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="theme === 'dark' 
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50' 
                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50'"
              @input="updateCompoundField('source', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Additional fields (like # Spaces, # ADA Spaces) -->
        <div v-if="renderField.additionalFields?.length" class="flex gap-3 mt-2">
          <div
            v-for="addField in renderField.additionalFields"
            :key="addField.id"
            class="flex-1"
          >
            <label
              v-if="addField.label"
              class="block text-sm font-medium mb-1"
              :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
            >
              {{ addField.label }}
            </label>
            <input
              :value="compoundValue[addField.id] || ''"
              type="text"
              :placeholder="addField.placeholder"
              :disabled="disabled"
              class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50'
                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50'"
              @input="updateCompoundField(addField.id, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Repeating Text Field -->
    <template v-else-if="renderField.type === 'repeating-text'">
      <fieldset class="space-y-3">
        <legend 
          class="block text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          {{ renderField.label }}
        </legend>
        
        <div class="space-y-2">
          <TransitionGroup name="list">
            <div 
              v-for="(item, index) in dynamicItems" 
              :key="item.id"
              class="flex items-center gap-2"
            >
              <span 
                class="w-6 text-center text-xs font-medium shrink-0"
                :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              >
                {{ index + 1 }}
              </span>
              <input
                :value="compoundValue[item.id] || ''"
                type="text"
                :placeholder="item.placeholder"
                :disabled="disabled"
                class="flex-1 px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                :class="theme === 'dark' 
                  ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
                  : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
                @input="updateCompoundField(item.id, ($event.target as HTMLInputElement).value)"
              />
              <button
                v-if="renderField.dynamic && index >= (renderField.minItems ?? renderField.items.length)"
                type="button"
                class="shrink-0 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                :class="theme === 'dark' 
                  ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' 
                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
                :disabled="disabled"
                @click="removeDynamicItem(index)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </TransitionGroup>
        </div>

        <button
          v-if="renderField.dynamic"
          type="button"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          :class="theme === 'dark' 
            ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50' 
            : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50'"
          :disabled="disabled"
          @click="addDynamicItem"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </fieldset>
    </template>

    <!-- Dynamic Table -->
    <template v-else-if="renderField.type === 'dynamic-table'">
      <fieldset class="space-y-3">
        <legend 
          class="block text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          {{ renderField.label }}
        </legend>

        <!-- Column Headers (desktop) -->
        <div 
          v-if="tableRows.length > 0"
          class="hidden md:flex items-center gap-2 pl-8 pr-10"
        >
          <div
            v-for="col in renderField.columns"
            :key="col.id"
            class="text-xs font-medium"
            :class="[col.width || 'flex-1', theme === 'dark' ? 'text-zinc-500' : 'text-slate-400']"
          >
            {{ col.label }}
          </div>
        </div>

        <div class="space-y-3">
          <TransitionGroup name="list">
            <div 
              v-for="(row, rowIdx) in tableRows"
              :key="row.index"
              class="flex flex-col md:flex-row items-start md:items-center gap-2"
            >
              <span 
                class="w-6 text-center text-xs font-medium shrink-0 pt-2 md:pt-0"
                :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              >
                {{ rowIdx + 1 }}
              </span>

              <template v-for="col in renderField.columns" :key="col.id">
                <!-- Condition selector column -->
                <div v-if="col.type === 'condition-selector'" :class="col.width || 'flex-1'" class="w-full md:w-auto">
                  <label class="md:hidden block text-xs font-medium mb-1" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'">{{ col.label }}</label>
                  <div class="flex rounded-md shadow-sm">
                    <button
                      v-for="opt in (col.options || [])"
                      :key="opt"
                      type="button"
                      :class="getTableConditionClass(opt, (row[col.id] as string) || '')"
                      :disabled="disabled"
                      @click="updateTableCell(rowIdx, col.id, opt)"
                    >{{ opt }}</button>
                  </div>
                </div>

                <!-- Checkbox column (custom toggle) -->
                <div v-else-if="col.type === 'checkbox'" :class="col.width || 'flex-1'" class="w-full md:w-auto flex items-center gap-2 md:justify-center">
                  <span class="md:hidden text-xs font-medium" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'">{{ col.label }}</span>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="(row[col.id] as string) === 'true'"
                    :disabled="disabled"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="[
                      (row[col.id] as string) === 'true'
                        ? 'bg-blue-600'
                        : theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-300',
                      theme === 'dark' ? 'focus-visible:ring-offset-zinc-950' : 'focus-visible:ring-offset-white'
                    ]"
                    @click="updateTableCell(rowIdx, col.id, (row[col.id] as string) === 'true' ? 'false' : 'true')"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-150 ease-in-out"
                      :class="(row[col.id] as string) === 'true' ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>

                <!-- Text input column -->
                <div v-else :class="col.width || 'flex-1'" class="w-full md:w-auto">
                  <label class="md:hidden block text-xs font-medium mb-1" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'">{{ col.label }}</label>
                  <input
                    :value="(row[col.id] as string) || ''"
                    type="text"
                    :placeholder="col.placeholder"
                    :disabled="disabled"
                    class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    :class="theme === 'dark' 
                      ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
                      : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
                    @input="updateTableCell(rowIdx, col.id, ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </template>

              <button
                type="button"
                class="shrink-0 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                :class="theme === 'dark' ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
                :disabled="disabled"
                @click="removeTableRow(rowIdx)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </TransitionGroup>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          :class="theme === 'dark' 
            ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50' 
            : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50'"
          :disabled="disabled"
          @click="addTableRow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      </fieldset>
    </template>

    <!-- Boolean Select -->
    <template v-else-if="renderField.type === 'boolean-select'">
      <fieldset class="space-y-3">
        <legend 
          class="block text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
        >
          {{ renderField.label }}
        </legend>
        
        <div class="space-y-2">
          <label 
            v-for="option in renderField.options" 
            :key="option.value"
            class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
            :class="[
              value === option.value
                ? (theme === 'dark' ? 'bg-blue-600/10 border-blue-500/50' : 'bg-blue-50 border-blue-300')
                : (theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-slate-300')
            ]"
          >
            <input
              type="radio"
              :name="fieldId"
              :value="option.value"
              :checked="value === option.value"
              :disabled="disabled"
              class="mt-0.5 w-4 h-4 text-blue-600 border-zinc-600 focus:ring-blue-500 focus:ring-offset-0"
              :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-white'"
              @change="setBooleanOption(option.value)"
            />
            <div class="flex-1 min-w-0">
              <span 
                class="block text-sm font-medium"
                :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
              >
                {{ option.label }}
              </span>
              <span 
                class="block mt-1 text-xs leading-relaxed"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                {{ option.text }}
              </span>
            </div>
          </label>
        </div>
      </fieldset>
    </template>
  </div>
</template>

<style scoped>
textarea {
  min-height: 80px;
}
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
