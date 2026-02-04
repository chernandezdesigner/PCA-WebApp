<script setup lang="ts">
import { computed } from 'vue';
import DynamicField from './DynamicField.vue';
import type { SectionConfig, FormData, BlockType, FieldConfig } from '@/types/section';
import { BLOCK_TYPES, BLOCK_LABELS } from '@/types/section';

const props = defineProps<{
  config: SectionConfig;
  modelValue: Record<BlockType, FormData>;
  sectionTitle?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<BlockType, FormData>];
}>();

// Get field value from nested structure
function getFieldValue(block: BlockType, fieldId: string): string | null {
  return props.modelValue[block]?.[fieldId] ?? null;
}

// Update field value in nested structure
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

// Check if block has fields
function hasBlock(block: BlockType): boolean {
  const fields = props.config[block];
  return Array.isArray(fields) && fields.length > 0;
}

// Get fields for a block
function getBlockFields(block: BlockType): FieldConfig[] {
  return props.config[block] || [];
}

// Get form data for a block
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

// More sophisticated block styling
function getBlockStyles(block: BlockType) {
  switch (block) {
    case 'description':
      return { 
        header: 'text-blue-400', 
        bg: 'bg-blue-500/5', 
        border: 'border-blue-500/20' 
      };
    case 'observations':
      return { 
        header: 'text-purple-400', 
        bg: 'bg-purple-500/5', 
        border: 'border-purple-500/20' 
      };
    case 'concerns':
      return { 
        header: 'text-amber-400', 
        bg: 'bg-amber-500/5', 
        border: 'border-amber-500/20' 
      };
    case 'recommendations':
      return { 
        header: 'text-emerald-400', 
        bg: 'bg-emerald-500/5', 
        border: 'border-emerald-500/20' 
      };
    default:
      return { 
        header: 'text-zinc-400', 
        bg: 'bg-zinc-800/20', 
        border: 'border-zinc-800' 
      };
  }
}
</script>

<template>
  <div class="dynamic-report-section space-y-6">
    <div 
      v-for="block in BLOCK_TYPES"
      :key="block"
      v-show="hasBlock(block)"
      class="section-block rounded-xl border overflow-hidden transition-all duration-300"
      :class="[getBlockStyles(block).bg, getBlockStyles(block).border]"
    >
      <!-- Block Header -->
      <div class="px-5 py-4 flex items-center gap-3 border-b border-zinc-800/50 bg-zinc-900/30">
        <svg 
          class="w-5 h-5" 
          :class="getBlockStyles(block).header"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getBlockIcon(block)" />
        </svg>
        <h3 class="text-sm font-bold uppercase tracking-wide text-zinc-200">
          {{ BLOCK_LABELS[block] }}
        </h3>
      </div>

      <!-- Fields Container -->
      <div class="p-5 space-y-6">
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
