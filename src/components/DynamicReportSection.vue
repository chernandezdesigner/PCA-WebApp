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

// Get block icon
function getBlockIcon(block: BlockType): string {
  switch (block) {
    case 'description':
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    case 'observations':
      return 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
    case 'concerns':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'recommendations':
      return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
    default:
      return 'M4 6h16M4 12h16M4 18h16';
  }
}

// Get block accent color
function getBlockAccent(block: BlockType): string {
  switch (block) {
    case 'description':
      return 'border-l-blue-500';
    case 'observations':
      return 'border-l-purple-500';
    case 'concerns':
      return 'border-l-amber-500';
    case 'recommendations':
      return 'border-l-emerald-500';
    default:
      return 'border-l-zinc-500';
  }
}

// Get field count for a block
function getFieldCount(block: BlockType): number {
  return getBlockFields(block).length;
}
</script>

<template>
  <div 
    class="dynamic-report-section space-y-8"
    role="form"
    :aria-label="sectionTitle || 'Report section form'"
  >
    <!-- Iterate through each block type -->
    <section
      v-for="block in BLOCK_TYPES"
      :key="block"
      v-show="hasBlock(block)"
      class="section-block"
      :aria-labelledby="`block-${block}-heading`"
    >
      <!-- Block Header -->
      <div 
        class="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800"
      >
        <div 
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800"
          aria-hidden="true"
        >
          <svg 
            class="w-4 h-4 text-zinc-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getBlockIcon(block)" />
          </svg>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 
            :id="`block-${block}-heading`"
            class="text-base font-semibold text-zinc-100"
          >
            {{ BLOCK_LABELS[block] }}
          </h3>
          <p class="text-xs text-zinc-500">
            {{ getFieldCount(block) }} {{ getFieldCount(block) === 1 ? 'field' : 'fields' }}
          </p>
        </div>
      </div>

      <!-- Block Fields -->
      <div 
        class="space-y-5 pl-11"
        :class="getBlockAccent(block)"
        style="border-left-width: 2px;"
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
    </section>
  </div>
</template>

<style scoped>
.dynamic-report-section {
  /* Container styles */
}

.section-block {
  /* Individual block styles */
}

/* Smooth transitions for block visibility */
.section-block {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
