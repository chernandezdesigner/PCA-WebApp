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

// Generate unique IDs for accessibility
const fieldId = useId();
const descriptionId = `${fieldId}-desc`;
const errorId = `${fieldId}-error`;

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Track focus state for styling
const isFocused = ref(false);

// Check if conditional field should be visible
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

// Insert quick option text
function insertQuickOption(text: string) {
  const current = value.value || '';
  value.value = current ? `${current} ${text}` : text;
}

// Set condition value
function setCondition(option: string) {
  value.value = option;
}

// Get the actual field to render
const renderField = computed(() => {
  return props.field.type === 'conditional' ? props.field.innerField : props.field;
});

// Check if a condition option is selected
function isConditionSelected(option: string): boolean {
  return value.value === option;
}

// Get condition button styling based on option and selection state
function getConditionButtonClass(option: string): string {
  const isSelected = isConditionSelected(option);
  const baseClass = 'relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-blue-500';
  
  if (isSelected) {
    // Different colors based on condition type
    if (option === 'Good') {
      return `${baseClass} bg-emerald-600 text-white hover:bg-emerald-500`;
    } else if (option === 'Fair') {
      return `${baseClass} bg-amber-500 text-white hover:bg-amber-400`;
    } else if (option === 'Poor') {
      return `${baseClass} bg-red-600 text-white hover:bg-red-500`;
    }
    return `${baseClass} bg-blue-600 text-white hover:bg-blue-500`;
  }
  
  return `${baseClass} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100`;
}
</script>

<template>
  <div 
    v-if="isVisible" 
    class="dynamic-field"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <!-- Textarea Field -->
    <template v-if="renderField.type === 'textarea'">
      <div class="space-y-2">
        <label 
          :for="fieldId"
          class="block text-sm font-medium text-zinc-200"
        >
          {{ renderField.label }}
        </label>
        
        <!-- Quick Options -->
        <div 
          v-if="renderField.quickOptions?.length" 
          class="flex flex-wrap gap-1.5"
          role="group"
          :aria-label="`Quick insert options for ${renderField.label}`"
        >
          <button
            v-for="(option, index) in renderField.quickOptions"
            :key="index"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 hover:border-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950"
            :aria-label="`Insert: ${option.label}`"
            @click="insertQuickOption(option.text)"
          >
            <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ option.label }}
          </button>
        </div>
        
        <!-- Textarea -->
        <div class="relative">
          <textarea
            :id="fieldId"
            v-model="value"
            :rows="renderField.rows || 3"
            :placeholder="renderField.placeholder"
            :disabled="disabled"
            :aria-describedby="renderField.placeholder ? descriptionId : undefined"
            class="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
        </div>
      </div>
    </template>

    <!-- Condition Selector -->
    <template v-else-if="renderField.type === 'condition-selector'">
      <fieldset class="space-y-2">
        <legend class="block text-sm font-medium text-zinc-200">
          {{ renderField.label }}
        </legend>
        
        <div 
          class="inline-flex rounded-lg overflow-hidden border border-zinc-700"
          role="radiogroup"
          :aria-label="renderField.label"
        >
          <button
            v-for="(option, index) in renderField.options"
            :key="option"
            type="button"
            role="radio"
            :aria-checked="isConditionSelected(option)"
            :class="[
              getConditionButtonClass(option),
              index === 0 ? 'rounded-l-lg' : '',
              index === renderField.options.length - 1 ? 'rounded-r-lg' : '',
              index > 0 ? '-ml-px' : ''
            ]"
            :disabled="disabled"
            @click="setCondition(option)"
          >
            <!-- Selection indicator -->
            <span 
              v-if="isConditionSelected(option)"
              class="absolute inset-0 flex items-center justify-start pl-2"
              aria-hidden="true"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <span :class="{ 'pl-4': isConditionSelected(option) }">{{ option }}</span>
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
          class="block w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.dynamic-field {
  /* Consistent spacing handled by parent */
}

/* Ensure proper textarea sizing */
textarea {
  min-height: 80px;
  max-height: 400px;
}

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}
</style>
