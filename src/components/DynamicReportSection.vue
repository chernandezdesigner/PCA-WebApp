<script setup lang="ts">
import { computed } from 'vue';
import DynamicField from './DynamicField.vue';
import type { SectionConfig, FormData, BlockType, FieldConfig } from '@/types/section';
import { BLOCK_TYPES, BLOCK_LABELS } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: SectionConfig;
  modelValue: Record<BlockType, FormData>;
  sectionTitle?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<BlockType, FormData>];
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
</script>

<template>
  <div class="dynamic-report-section space-y-12">
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
