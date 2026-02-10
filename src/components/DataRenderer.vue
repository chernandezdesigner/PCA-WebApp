<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  data: Record<string, unknown> | null;
  depth?: number;
  title?: string;
}>();

const { theme } = useTheme();
const depth = computed(() => props.depth ?? 0);

// Keys to skip (metadata)
const skipKeys = new Set(['id', 'assessment_id', 'created_at', 'updated_at', 'last_modified', 'current_step']);

// Format key to readable label
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Check if value is an object (but not array or null)
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Check if object has displayable content
function hasContent(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).some(k => !skipKeys.has(k) && hasContent(value[k]));
  return true;
}

// Get display type for a value
function getValueType(key: string, value: unknown): 'condition' | 'cost' | 'date' | 'boolean' | 'array' | 'object' | 'text' | 'number' | 'long-text' {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes('condition') || keyLower.includes('rating') || keyLower.includes('status')) {
    if (typeof value === 'string') return 'condition';
  }
  if (keyLower.includes('cost') || keyLower.includes('amount') || keyLower.includes('price') || keyLower.includes('estimate')) {
    if (typeof value === 'number') return 'cost';
  }
  if (keyLower.includes('date') || keyLower.includes('time')) {
    return 'date';
  }
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (isObject(value)) return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && value.length > 60) return 'long-text';
  return 'text';
}

// Get condition badge style
function getConditionStyle(value: string): string {
  const v = value.toLowerCase();
  if (v.includes('good') || v.includes('excellent') || v.includes('new')) {
    return theme.value === 'dark' 
      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
  }
  if (v.includes('fair') || v.includes('average') || v.includes('satisfactory')) {
    return theme.value === 'dark'
      ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
  }
  if (v.includes('poor') || v.includes('bad') || v.includes('critical') || v.includes('fail')) {
    return theme.value === 'dark'
      ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
      : 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
  }
  return theme.value === 'dark'
    ? 'bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700'
    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

// Format value for display
function formatValue(key: string, value: unknown): string {
  const type = getValueType(key, value);
  
  switch (type) {
    case 'cost':
      return `$${Number(value).toLocaleString()}`;
    case 'date':
      try {
        const date = new Date(value as string);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch {
        return String(value);
      }
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}

// Get entries to display
const entries = computed(() => {
  if (!props.data) return [];
  return Object.entries(props.data)
    .filter(([key, value]) => !skipKeys.has(key) && hasContent(value))
    .map(([key, value]) => ({
      key,
      label: formatKey(key),
      value,
      type: getValueType(key, value),
    }));
});

// Split entries into primitives (grid) and complex (blocks)
const primitives = computed(() => entries.value.filter(e => !['array', 'object'].includes(e.type)));
const complex = computed(() => entries.value.filter(e => ['array', 'object'].includes(e.type)));
</script>

<template>
  <div v-if="data && entries.length > 0" class="flex flex-col gap-6">
    <!-- Section Title (if provided and nested) -->
    <h4 
      v-if="title && depth > 0" 
      class="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-2"
      :class="theme === 'dark' ? 'text-zinc-400 border-zinc-800' : 'text-slate-500 border-slate-200'"
    >
      {{ title }}
    </h4>

    <!-- Primitives Grid -->
    <div v-if="primitives.length > 0" class="grid grid-cols-2 gap-x-4 gap-y-5">
      <div 
        v-for="entry in primitives" 
        :key="entry.key"
        :class="{ 'col-span-2': entry.type === 'long-text' }"
      >
        <!-- Label -->
        <dt 
          class="text-[10px] uppercase tracking-wider font-semibold mb-1"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >
          {{ entry.label }}
        </dt>

        <!-- Value -->
        <dd class="text-sm leading-relaxed">
          <!-- Condition Badge -->
          <span 
            v-if="entry.type === 'condition'"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="getConditionStyle(String(entry.value))"
          >
            {{ entry.value }}
          </span>

          <!-- Boolean -->
          <span 
            v-else-if="entry.type === 'boolean'"
            class="flex items-center gap-1.5 font-medium"
            :class="entry.value 
              ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
              : theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
          >
            <svg v-if="entry.value" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ entry.value ? 'Yes' : 'No' }}
          </span>

          <!-- Cost -->
          <span 
            v-else-if="entry.type === 'cost'"
            class="font-mono font-medium"
            :class="theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'"
          >
            {{ formatValue(entry.key, entry.value) }}
          </span>
          
           <!-- Long Text -->
           <div 
            v-else-if="entry.type === 'long-text'"
            class="whitespace-pre-wrap rounded-md p-3 text-sm border"
            :class="theme === 'dark' 
              ? 'bg-zinc-800/50 border-zinc-800 text-zinc-300' 
              : 'bg-slate-50 border-slate-100 text-slate-700'"
          >
            {{ entry.value }}
          </div>

          <!-- Default Text -->
          <span 
            v-else 
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-900'"
          >
            {{ formatValue(entry.key, entry.value) }}
          </span>
        </dd>
      </div>
    </div>

    <!-- Complex Items (Arrays/Objects) -->
    <div v-if="complex.length > 0" class="flex flex-col gap-6">
      <div 
        v-for="entry in complex" 
        :key="entry.key"
        class="rounded-xl border overflow-hidden"
        :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50/50'"
      >
        <!-- Header for complex item -->
        <div 
          class="px-4 py-2 border-b flex items-center justify-between"
          :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'"
        >
          <span 
            class="text-xs font-bold uppercase tracking-wider"
            :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
          >
            {{ entry.label }}
          </span>
          <span 
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'"
          >
             {{ entry.type === 'array' ? `${(entry.value as unknown[]).length} items` : 'Section' }}
          </span>
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Nested Object -->
          <DataRenderer 
            v-if="entry.type === 'object'" 
            :data="entry.value as Record<string, unknown>" 
            :depth="depth + 1" 
          />

          <!-- Nested Array -->
          <div v-else-if="entry.type === 'array'" class="space-y-4">
            <template v-for="(item, idx) in (entry.value as unknown[])" :key="idx">
              <!-- Array Item Wrapper -->
              <div 
                class="relative pl-4"
                :class="{ 'border-t pt-4 mt-4': idx > 0, 'border-slate-200': theme !== 'dark', 'border-zinc-800': theme === 'dark' }"
              >
                 <!-- Item Index Marker -->
                 <div 
                  class="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                  :class="[
                    idx > 0 ? 'top-4' : 'top-0', // Adjust top for first item vs subsequent
                    theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-300'
                  ]"
                ></div>

                <div v-if="isObject(item)">
                  <DataRenderer :data="item" :depth="depth + 1" />
                </div>
                <div v-else class="text-sm" :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'">
                  {{ item }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>