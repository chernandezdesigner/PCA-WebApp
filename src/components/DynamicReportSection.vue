<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DynamicField from './DynamicField.vue';
import type { SectionConfig, FormData, BlockType, FieldConfig, EquipmentField } from '@/types/section';
import { BLOCK_TYPES, BLOCK_LABELS } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: SectionConfig;
  modelValue: Record<string, FormData>;
  sectionTitle?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, FormData>];
}>();

const { theme } = useTheme();

function getFieldValue(block: BlockType, fieldId: string): string | null {
  return props.modelValue[block]?.[fieldId] ?? null;
}

function updateFieldValue(block: BlockType, fieldId: string, value: string | null) {
  const newData = {
    ...props.modelValue,
    [block]: {
      ...props.modelValue[block],
      [fieldId]: value,
    },
  };
  emit('update:modelValue', newData);
}

function hasBlock(block: BlockType): boolean {
  const fields = props.config[block];
  return Array.isArray(fields) && fields.length > 0;
}

function getBlockFields(block: BlockType): FieldConfig[] {
  return props.config[block] || [];
}

function getBlockFormData(block: BlockType): FormData {
  return props.modelValue[block] || {};
}

function getBlockIcon(block: BlockType): string {
  switch (block) {
    case 'description': return 'M4 6h16M4 12h16M4 18h7';
    case 'observations': return 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
    case 'concerns': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'recommendations': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    default: return 'M4 6h16M4 12h16M4 18h16';
  }
}

function getBlockTheme(block: BlockType) {
  switch (block) {
    case 'description':
      return { text: 'text-blue-500', wrapperDark: 'border-l-blue-600/30', wrapperLight: 'border-l-blue-400/50' };
    case 'observations':
      return { text: 'text-purple-500', wrapperDark: 'border-l-purple-600/30', wrapperLight: 'border-l-purple-400/50' };
    case 'concerns':
      return { text: 'text-amber-500', wrapperDark: 'border-l-amber-600/30', wrapperLight: 'border-l-amber-400/50' };
    case 'recommendations':
      return { text: 'text-emerald-500', wrapperDark: 'border-l-emerald-600/30', wrapperLight: 'border-l-emerald-400/50' };
    default:
      return { text: 'text-zinc-400', wrapperDark: 'border-l-zinc-600/30', wrapperLight: 'border-l-slate-300' };
  }
}

// --- Equipment list logic ---
const hasEquipmentList = computed(() => !!props.config.equipmentList);
const equipmentFields = computed<EquipmentField[]>(() => props.config.equipmentList?.fields || []);

interface EquipmentRow {
  index: number;
  [key: string]: string | number;
}

const equipmentRows = ref<EquipmentRow[]>([]);

function initEquipmentRows() {
  if (!hasEquipmentList.value) return;
  const data = (props.modelValue as Record<string, FormData>).equipmentList || {};
  const count = parseInt((data._count as string) || '0');
  const rows: EquipmentRow[] = [];
  if (count > 0) {
    for (let i = 1; i <= count; i++) {
      const row: EquipmentRow = { index: i };
      for (const f of equipmentFields.value) {
        row[f.id] = (data[`equipment-${i}-${f.id}`] as string) || '';
      }
      rows.push(row);
    }
  }
  equipmentRows.value = rows;
}

watch(() => props.config, initEquipmentRows, { immediate: true });

function getEquipmentData(): FormData {
  const data: FormData = { _count: String(equipmentRows.value.length) };
  for (const row of equipmentRows.value) {
    for (const f of equipmentFields.value) {
      data[`equipment-${row.index}-${f.id}`] = (row[f.id] as string) || '';
    }
  }
  return data;
}

function emitEquipmentUpdate() {
  emit('update:modelValue', {
    ...props.modelValue,
    equipmentList: getEquipmentData(),
  });
}

function updateEquipmentField(rowIdx: number, fieldId: string, value: string) {
  equipmentRows.value[rowIdx][fieldId] = value;
  emitEquipmentUpdate();
}

function addEquipmentRow() {
  const maxIdx = equipmentRows.value.reduce((max, r) => r.index > max ? r.index : max, 0);
  const row: EquipmentRow = { index: maxIdx + 1 };
  for (const f of equipmentFields.value) {
    row[f.id] = '';
  }
  equipmentRows.value.push(row);
  emitEquipmentUpdate();
}

function removeEquipmentRow(rowIdx: number) {
  equipmentRows.value.splice(rowIdx, 1);
  emitEquipmentUpdate();
}

function getEquipmentConditionClass(option: string, currentValue: string): string {
  const isSelected = currentValue === option;
  const isDark = theme.value === 'dark';
  const baseClass = 'flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  if (isSelected) {
    if (option === 'Good') return `${baseClass} bg-emerald-600 text-white shadow-sm z-10`;
    if (option === 'Fair') return `${baseClass} bg-amber-500 text-black shadow-sm z-10`;
    if (option === 'Poor') return `${baseClass} bg-red-600 text-white shadow-sm z-10`;
    return `${baseClass} bg-blue-600 text-white`;
  }

  if (isDark) {
    return `${baseClass} bg-zinc-900 border-y border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-zinc-800`;
  }
  return `${baseClass} bg-white border-y border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 first:border-l first:rounded-l-md last:border-r last:rounded-r-md border-x-px border-x-slate-200`;
}
</script>

<template>
  <div class="dynamic-report-section space-y-12">
    <!-- Equipment List (above standard blocks) -->
    <div v-if="hasEquipmentList" class="section-block relative">
      <div class="flex items-center gap-3 mb-6">
        <div 
          class="p-2 rounded-lg border"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
        >
          <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 
          class="text-lg font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          {{ config.equipmentList!.label }}
        </h3>
        <div 
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        ></div>
      </div>

      <!-- Column Headers (desktop) -->
      <div 
        v-if="equipmentRows.length > 0"
        class="hidden md:flex items-center gap-2 mb-2 pl-8 pr-10"
      >
        <div
          v-for="ef in equipmentFields"
          :key="ef.id"
          class="text-xs font-medium"
          :class="[
            ef.width || 'flex-1',
            theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
          ]"
        >
          {{ ef.label }}
        </div>
      </div>

      <!-- Equipment Rows -->
      <div class="space-y-3">
        <TransitionGroup name="eq-row">
          <div 
            v-for="(row, rowIdx) in equipmentRows"
            :key="row.index"
            class="flex flex-col md:flex-row items-start md:items-center gap-2"
          >
            <span 
              class="w-6 text-center text-xs font-medium shrink-0 pt-2 md:pt-0"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ rowIdx + 1 }}
            </span>

            <template v-for="ef in equipmentFields" :key="ef.id">
              <!-- Condition selector inline -->
              <div 
                v-if="ef.type === 'condition-selector'" 
                :class="ef.width || 'flex-1'"
                class="w-full md:w-auto"
              >
                <label 
                  class="md:hidden block text-xs font-medium mb-1"
                  :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
                >
                  {{ ef.label }}
                </label>
                <div class="flex rounded-md shadow-sm">
                  <button
                    v-for="opt in (ef.options || [])"
                    :key="opt"
                    type="button"
                    :class="getEquipmentConditionClass(opt, (row[ef.id] as string) || '')"
                    :disabled="disabled"
                    @click="updateEquipmentField(rowIdx, ef.id, opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>

              <!-- Text input -->
              <div 
                v-else 
                :class="ef.width || 'flex-1'"
                class="w-full md:w-auto"
              >
                <label 
                  class="md:hidden block text-xs font-medium mb-1"
                  :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
                >
                  {{ ef.label }}
                </label>
                <input
                  :value="(row[ef.id] as string) || ''"
                  type="text"
                  :placeholder="ef.placeholder"
                  :disabled="disabled"
                  class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  :class="theme === 'dark' 
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
                    : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
                  @input="updateEquipmentField(rowIdx, ef.id, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </template>

            <button
              type="button"
              class="shrink-0 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              :class="theme === 'dark' 
                ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
              :disabled="disabled"
              @click="removeEquipmentRow(rowIdx)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>

      <!-- Add Equipment Button -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-4 rounded-lg border border-dashed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        :class="theme === 'dark' 
          ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50' 
          : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50'"
        :disabled="disabled"
        @click="addEquipmentRow"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Equipment
      </button>
    </div>

    <!-- Standard Block Types -->
    <div 
      v-for="block in BLOCK_TYPES"
      :key="block"
      v-show="hasBlock(block)"
      class="section-block relative"
    >
      <!-- Header Row -->
      <div class="flex items-center gap-3 mb-6">
        <!-- Icon -->
        <div 
          class="p-2 rounded-lg border"
          :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'"
        >
          <svg 
            class="w-5 h-5" 
            :class="getBlockTheme(block).text"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getBlockIcon(block)" />
          </svg>
        </div>

        <!-- Title -->
        <h3 
          class="text-lg font-bold tracking-tight"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          {{ BLOCK_LABELS[block] }}
        </h3>

        <!-- Line -->
        <div 
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        ></div>
      </div>

      <!-- Fields Container -->
      <div 
        class="pl-6 ml-3 space-y-10 border-l-2"
        :class="theme === 'dark' ? getBlockTheme(block).wrapperDark : getBlockTheme(block).wrapperLight"
      >
        <DynamicField
          v-for="field in getBlockFields(block)"
          :key="field.id"
          :field="field"
          :model-value="getFieldValue(block, field.id)"
          :form-data="getBlockFormData(block)"
          :disabled="disabled"
          @update:model-value="(val) => updateFieldValue(block, field.id, val)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.eq-row-enter-active,
.eq-row-leave-active {
  transition: all 0.2s ease;
}
.eq-row-enter-from,
.eq-row-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
