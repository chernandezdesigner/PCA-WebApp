<script setup lang="ts">
import { computed } from 'vue';
import DynamicField from './DynamicField.vue';
import type { PropertyInfoConfig, FormData, FieldConfig } from '@/types/section';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  config: PropertyInfoConfig;
  modelValue: FormData;
  sectionTitle?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormData];
}>();

const { theme } = useTheme();

function getFieldValue(fieldId: string): string | Record<string, string> | null {
  return props.modelValue[fieldId] ?? null;
}

function updateFieldValue(fieldId: string, value: string | Record<string, string> | null) {
  const newData = {
    ...props.modelValue,
    [fieldId]: value,
  };
  emit('update:modelValue', newData);
}

const hasIntroText = computed(() => !!props.config.introText);
const hasFields = computed(() => props.config.fields && props.config.fields.length > 0);
const hasInterviewBlocks = computed(() => props.config.interviewBlocks && props.config.interviewBlocks.length > 0);
</script>

<template>
  <div class="property-info-section space-y-8">
    <!-- Intro Text -->
    <div 
      v-if="hasIntroText"
      class="p-4 rounded-lg border-l-2"
      :class="theme === 'dark' 
        ? 'bg-zinc-900/30 border-blue-500/50' 
        : 'bg-blue-50/50 border-blue-400'"
    >
      <p 
        class="text-sm leading-relaxed italic"
        :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
      >
        {{ config.introText }}
      </p>
    </div>

    <!-- Regular Fields -->
    <div v-if="hasFields" class="space-y-6">
      <DynamicField
        v-for="field in config.fields"
        :key="field.id"
        :field="field"
        :model-value="getFieldValue(field.id)"
        :form-data="modelValue"
        :disabled="disabled"
        @update:model-value="(val) => updateFieldValue(field.id, val)"
      />
    </div>

    <!-- Interview Blocks (special handling for interviews section) -->
    <div v-if="hasInterviewBlocks" class="space-y-8">
      <div 
        v-for="(block, blockIndex) in config.interviewBlocks" 
        :key="block.id"
        class="relative"
      >
        <!-- Block Header -->
        <div class="flex items-center gap-3 mb-4">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            :class="theme === 'dark' 
              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
              : 'bg-slate-100 text-slate-700 border border-slate-200'"
          >
            {{ blockIndex + 1 }}
          </div>
          <h4 
            class="text-sm font-semibold"
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
          >
            Interview {{ blockIndex + 1 }}
          </h4>
          <div 
            class="flex-1 h-px"
            :class="theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'"
          ></div>
        </div>

        <!-- Block Fields -->
        <div 
          class="pl-11 space-y-5 pb-6"
          :class="blockIndex < config.interviewBlocks!.length - 1 
            ? (theme === 'dark' ? 'border-b border-zinc-800/50' : 'border-b border-slate-200') 
            : ''"
        >
          <DynamicField
            v-for="field in block.fields"
            :key="field.id"
            :field="field"
            :model-value="getFieldValue(field.id)"
            :form-data="modelValue"
            :disabled="disabled"
            @update:model-value="(val) => updateFieldValue(field.id, val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
