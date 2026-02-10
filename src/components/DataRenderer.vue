<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  data: Record<string, unknown> | null;
  depth?: number;
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
function getValueType(key: string, value: unknown): 'condition' | 'cost' | 'date' | 'boolean' | 'array' | 'object' | 'text' | 'number' {
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
  return 'text';
}

// Get condition badge style
function getConditionStyle(value: string): string {
  const v = value.toLowerCase();
  if (v.includes('good') || v.includes('excellent')) {
    return theme.value === 'dark' 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (v.includes('fair') || v.includes('average')) {
    return theme.value === 'dark'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (v.includes('poor') || v.includes('bad') || v.includes('critical')) {
    return theme.value === 'dark'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-red-50 text-red-700 border-red-200';
  }
  return theme.value === 'dark'
    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
    : 'bg-slate-100 text-slate-600 border-slate-200';
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
</script>

<template>
  <div v-if="data && entries.length > 0" class="space-y-2">
    <div 
      v-for="entry in entries" 
      :key="entry.key"
      class="rounded-lg border transition-colors"
      :class="[
        depth === 0 
          ? theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
          : theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-slate-50 border-slate-100',
        depth > 0 ? 'ml-3' : ''
      ]"
    >
      <!-- Object (nested) -->
      <details v-if="entry.type === 'object'" class="group">
        <summary 
          class="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
          :class="theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'"
        >
          <svg 
            class="w-4 h-4 transition-transform group-open:rotate-90"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span 
            class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            {{ entry.label }}
          </span>
          <span 
            class="text-xs px-1.5 py-0.5 rounded"
            :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'"
          >
            {{ Object.keys(entry.value as object).length }} fields
          </span>
        </summary>
        <div class="px-3 pb-3">
          <DataRenderer :data="entry.value as Record<string, unknown>" :depth="depth + 1" />
        </div>
      </details>

      <!-- Array -->
      <details v-else-if="entry.type === 'array'" class="group">
        <summary 
          class="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
          :class="theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'"
        >
          <svg 
            class="w-4 h-4 transition-transform group-open:rotate-90"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span 
            class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
          >
            {{ entry.label }}
          </span>
          <span 
            class="text-xs px-1.5 py-0.5 rounded"
            :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'"
          >
            {{ (entry.value as unknown[]).length }} items
          </span>
        </summary>
        <div class="px-3 pb-3 space-y-2">
          <template v-for="(item, idx) in (entry.value as unknown[])" :key="idx">
            <!-- Array of objects -->
            <div 
              v-if="isObject(item)"
              class="rounded border"
              :class="theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-slate-50 border-slate-100'"
            >
              <div 
                class="px-3 py-1.5 border-b text-xs font-medium"
                :class="theme === 'dark' ? 'border-zinc-700/50 text-zinc-500' : 'border-slate-100 text-slate-500'"
              >
                #{{ idx + 1 }}
              </div>
              <div class="p-2">
                <DataRenderer :data="item" :depth="depth + 1" />
              </div>
            </div>
            <!-- Array of primitives -->
            <div 
              v-else
              class="flex items-center gap-2 px-3 py-1.5 rounded"
              :class="theme === 'dark' ? 'bg-zinc-800/30' : 'bg-slate-50'"
            >
              <span 
                class="text-xs"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
              >
                {{ idx + 1 }}.
              </span>
              <span 
                class="text-sm"
                :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'"
              >
                {{ item }}
              </span>
            </div>
          </template>
        </div>
      </details>

      <!-- Condition (special styling) -->
      <div v-else-if="entry.type === 'condition'" class="flex items-center justify-between px-3 py-2">
        <span 
          class="text-sm"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ entry.label }}
        </span>
        <span 
          class="px-2 py-0.5 text-xs font-semibold rounded border"
          :class="getConditionStyle(String(entry.value))"
        >
          {{ entry.value }}
        </span>
      </div>

      <!-- Boolean (checkmark style) -->
      <div v-else-if="entry.type === 'boolean'" class="flex items-center justify-between px-3 py-2">
        <span 
          class="text-sm"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ entry.label }}
        </span>
        <span 
          class="flex items-center gap-1 text-sm font-medium"
          :class="entry.value 
            ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            : theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
        >
          <svg 
            v-if="entry.value" 
            class="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg 
            v-else 
            class="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ entry.value ? 'Yes' : 'No' }}
        </span>
      </div>

      <!-- Cost (currency format) -->
      <div v-else-if="entry.type === 'cost'" class="flex items-center justify-between px-3 py-2">
        <span 
          class="text-sm"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ entry.label }}
        </span>
        <span 
          class="text-sm font-semibold"
          :class="theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'"
        >
          {{ formatValue(entry.key, entry.value) }}
        </span>
      </div>

      <!-- Long text (expandable) -->
      <div 
        v-else-if="entry.type === 'text' && String(entry.value).length > 100" 
        class="px-3 py-2"
      >
        <div 
          class="text-sm mb-1"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ entry.label }}
        </div>
        <div 
          class="text-sm p-2 rounded whitespace-pre-wrap"
          :class="theme === 'dark' ? 'bg-zinc-800/50 text-zinc-200' : 'bg-slate-50 text-slate-700'"
        >
          {{ entry.value }}
        </div>
      </div>

      <!-- Default (key: value) -->
      <div v-else class="flex items-center justify-between px-3 py-2">
        <span 
          class="text-sm"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ entry.label }}
        </span>
        <span 
          class="text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
        >
          {{ formatValue(entry.key, entry.value) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div 
    v-else 
    class="text-center py-6"
    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
  >
    <p class="text-sm">No data recorded for this section</p>
  </div>
</template>
