<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import type { FieldConfig, FieldValue, FormData } from '@/types/section';
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

function setBooleanOption(optionValue: string) {
  value.value = optionValue;
}

const renderField = computed(() => {
  return props.field.type === 'conditional' ? props.field.innerField : props.field;
});

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
  const baseClass = 'relative flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';
  
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
            class="block w-full px-4 py-3 rounded-lg text-sm shadow-sm transition-all duration-200 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            :value="renderField.sourceLabel ? compoundValue.main : value"
            type="text"
            :placeholder="renderField.placeholder"
            :disabled="disabled"
            class="flex-[2] min-w-0 px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            :class="theme === 'dark' 
              ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
              : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
            @input="renderField.sourceLabel ? updateCompoundField('main', ($event.target as HTMLInputElement).value) : (value = ($event.target as HTMLInputElement).value)"
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
              class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <input
              :value="compoundValue[addField.id] || ''"
              type="text"
              :placeholder="addField.placeholder"
              :disabled="disabled"
              class="w-full px-3 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
          <div 
            v-for="(item, index) in renderField.items" 
            :key="item.id"
            class="flex items-center gap-2"
          >
            <span 
              class="w-6 text-center text-xs font-medium"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ index + 1 }}
            </span>
            <input
              :value="compoundValue[item.id] || ''"
              type="text"
              :placeholder="item.placeholder"
              :disabled="disabled"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="theme === 'dark' 
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700' 
                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 hover:border-slate-300'"
              @input="updateCompoundField(item.id, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
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
</style>
