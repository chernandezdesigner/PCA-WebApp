<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import type { FieldConfig, FieldValue, FormData } from '@/types/section';

const props = defineProps<{
  field: FieldConfig;
  modelValue: FieldValue;
  formData?: FormData;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FieldValue];
}>();

const fieldId = useId();
const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isFocused = ref(false);

const isVisible = computed(() => {
  if (props.field.type !== 'conditional') return true;
  if (!props.formData) return false;
  
  const conditionField = props.field.condition.field;
  const conditionValue = props.field.condition.value;
  const currentValue = props.formData[conditionField];
  
  const matches = Array.isArray(conditionValue)
    ? conditionValue.includes(currentValue as string)
    : currentValue === conditionValue;
  
  return props.field.showWhen ? matches : !matches;
});

function insertQuickOption(text: string) {
  const current = value.value || '';
  value.value = current ? `${current} ${text}` : text;
}

function setCondition(option: string) {
  value.value = option;
}

const renderField = computed(() => {
  return props.field.type === 'conditional' ? props.field.innerField : props.field;
});

function isConditionSelected(option: string): boolean {
  return value.value === option;
}

function getConditionButtonClass(option: string): string {
  const isSelected = isConditionSelected(option);
  const baseClass = 'relative flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-blue-500';
  
  if (isSelected) {
    if (option === 'Good') return `${baseClass} bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 z-10`;
    if (option === 'Fair') return `${baseClass} bg-amber-500 text-black shadow-lg shadow-amber-900/50 z-10`;
    if (option === 'Poor') return `${baseClass} bg-red-600 text-white shadow-lg shadow-red-900/50 z-10`;
    return `${baseClass} bg-blue-600 text-white`;
  }
  
  return `${baseClass} bg-zinc-900 border-y border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg border-x-px border-x-zinc-800`;
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
        <label 
          :for="fieldId"
          class="block text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors"
        >
          {{ renderField.label }}
        </label>
        
        <div class="relative">
          <textarea
            :id="fieldId"
            v-model="value"
            :rows="renderField.rows || 3"
            :placeholder="renderField.placeholder"
            :disabled="disabled"
            class="block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 shadow-sm transition-all duration-200 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-zinc-700"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
        </div>

        <!-- Quick Options (Below Textarea) -->
        <div 
          v-if="renderField.quickOptions?.length" 
          class="pt-1"
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(option, index) in renderField.quickOptions"
              :key="index"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/30 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group/chip"
              @click="insertQuickOption(option.text)"
            >
              <svg 
                class="w-3 h-3 opacity-60 group-hover/chip:opacity-100 transition-opacity text-zinc-400 group-hover/chip:text-blue-400" 
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
        <legend class="block text-sm font-medium text-zinc-200">
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

    <!-- Text Field -->
    <template v-else-if="renderField.type === 'text'">
      <div class="space-y-2">
        <label 
          :for="fieldId"
          class="block text-sm font-medium text-zinc-200"
        >
          {{ renderField.label }}
        </label>
        
        <input
          :id="fieldId"
          v-model="value"
          type="text"
          :placeholder="renderField.placeholder"
          :disabled="disabled"
          class="block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-zinc-700"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
textarea {
  min-height: 100px;
}
</style>
