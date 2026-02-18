<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
const hasInterviewBlocks = computed(() => activeBlocks.value.length > 0);

// Dynamic interview blocks
const FIELD_ID_MAP: Record<string, string> = {
  'Interviewee': 'interviewee',
  'Pertinent Information': 'pertinent-info',
  'Concerns': 'concerns',
};

const activeBlocks = ref<{ id: string; fields: FieldConfig[] }[]>([]);

function buildBlockFromTemplate(index: number): { id: string; fields: FieldConfig[] } {
  const suffix = index;
  const tpl = props.config.interviewTemplate;
  if (!tpl) return { id: `interview-${suffix}`, fields: [] };
  const fields = tpl.fields.map((f) => {
    const baseId = FIELD_ID_MAP[(f as any).label] || (f as any).label?.toLowerCase().replace(/\s+/g, '-') || 'field';
    return { ...f, id: `${baseId}-${suffix}` } as FieldConfig;
  });
  return { id: `interview-${suffix}`, fields };
}

function initBlocks() {
  const configBlocks = props.config.interviewBlocks || [];
  const base = configBlocks.map(b => ({ ...b, fields: [...b.fields] }));

  if (props.config.dynamicInterviews && props.config.interviewTemplate) {
    const knownSuffixes = new Set(base.map((_, i) => i + 1));
    const keys = Object.keys(props.modelValue);
    for (const key of keys) {
      const match = key.match(/^interviewee-(\d+)$/);
      if (match) {
        const n = parseInt(match[1]);
        if (!knownSuffixes.has(n)) {
          base.push(buildBlockFromTemplate(n));
          knownSuffixes.add(n);
        }
      }
    }
    base.sort((a, b) => {
      const aNum = parseInt(a.id.split('-').pop() || '0');
      const bNum = parseInt(b.id.split('-').pop() || '0');
      return aNum - bNum;
    });
  }

  activeBlocks.value = base;
}

watch(() => props.config, initBlocks, { immediate: true });

function addInterviewBlock() {
  const maxN = activeBlocks.value.reduce((max, b) => {
    const n = parseInt(b.id.split('-').pop() || '0');
    return n > max ? n : max;
  }, 0);
  activeBlocks.value.push(buildBlockFromTemplate(maxN + 1));
}

function removeInterviewBlock(index: number) {
  const block = activeBlocks.value[index];
  if (!block) return;
  activeBlocks.value.splice(index, 1);
  const newData = { ...props.modelValue };
  for (const field of block.fields) {
    delete newData[field.id];
  }
  emit('update:modelValue', newData);
}
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

    <!-- Interview Blocks -->
    <div v-if="hasInterviewBlocks" class="space-y-8">
      <TransitionGroup name="block">
        <div 
          v-for="(block, blockIndex) in activeBlocks" 
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
            <button
              v-if="config.dynamicInterviews && activeBlocks.length > 1"
              type="button"
              class="shrink-0 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              :class="theme === 'dark' 
                ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
              :disabled="disabled"
              @click="removeInterviewBlock(blockIndex)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Block Fields -->
          <div 
            class="pl-11 space-y-5 pb-6"
            :class="blockIndex < activeBlocks.length - 1 
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
      </TransitionGroup>

      <!-- Add Interview Button -->
      <button
        v-if="config.dynamicInterviews"
        type="button"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        :class="theme === 'dark' 
          ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50' 
          : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50'"
        :disabled="disabled"
        @click="addInterviewBlock"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Interview
      </button>
    </div>
  </div>
</template>

<style scoped>
.block-enter-active,
.block-leave-active {
  transition: all 0.2s ease;
}
.block-enter-from,
.block-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
