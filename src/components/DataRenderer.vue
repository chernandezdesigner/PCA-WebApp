<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  data: Record<string, unknown> | null;
  depth?: number;
  sectionTitle?: string;
}>();

const { theme } = useTheme();
const depth = computed(() => props.depth ?? 0);

// Track expanded sections
const expandedSections = ref<Set<string>>(new Set());

function toggleSection(key: string) {
  if (expandedSections.value.has(key)) {
    expandedSections.value.delete(key);
  } else {
    expandedSections.value.add(key);
  }
  // Force reactivity
  expandedSections.value = new Set(expandedSections.value);
}

// Keys to skip (metadata)
const skipKeys = new Set(['id', 'assessment_id', 'created_at', 'updated_at', 'last_modified', 'current_step']);

// Keys that represent assessment metrics
const assessmentKeys = new Set(['conditions', 'condition', 'repair_status', 'cost_estimate', 'rating', 'status']);

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

// Check if a key is an assessment metric key
function isAssessmentKey(key: string): boolean {
  const keyLower = key.toLowerCase();
  return assessmentKeys.has(keyLower) || 
         keyLower.includes('condition') || 
         keyLower.includes('repair_status') ||
         keyLower.includes('cost_estimate');
}

// Check if array contains only primitive values (strings/numbers)
function isPrimitiveArray(arr: unknown[]): boolean {
  return arr.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean');
}

// Get condition badge style
function getConditionStyle(value: string): string {
  const v = value.toLowerCase();
  if (v.includes('good') || v.includes('excellent') || v === 'g') {
    return theme.value === 'dark' 
      ? 'bg-emerald-500 text-white'
      : 'bg-emerald-500 text-white';
  }
  if (v.includes('fair') || v.includes('average') || v === 'f') {
    return theme.value === 'dark'
      ? 'bg-amber-500 text-white'
      : 'bg-amber-500 text-white';
  }
  if (v.includes('poor') || v.includes('bad') || v.includes('critical') || v === 'p') {
    return theme.value === 'dark'
      ? 'bg-red-500 text-white'
      : 'bg-red-500 text-white';
  }
  return theme.value === 'dark'
    ? 'bg-zinc-700 text-zinc-200'
    : 'bg-slate-200 text-slate-700';
}

// Get repair status badge style
function getRepairStatusStyle(value: string): string {
  const v = value.toLowerCase();
  if (v === 'inv' || v.includes('invest')) {
    return theme.value === 'dark'
      ? 'bg-zinc-800 text-zinc-100 border border-zinc-600'
      : 'bg-slate-800 text-white';
  }
  if (v === 'maint' || v.includes('maintenance')) {
    return theme.value === 'dark'
      ? 'bg-blue-600 text-white'
      : 'bg-blue-500 text-white';
  }
  if (v === 'repair' || v.includes('replace')) {
    return theme.value === 'dark'
      ? 'bg-orange-600 text-white'
      : 'bg-orange-500 text-white';
  }
  return theme.value === 'dark'
    ? 'bg-zinc-700 text-zinc-200'
    : 'bg-slate-600 text-white';
}

// Format cost value
function formatCost(value: unknown): string {
  if (typeof value === 'number') {
    return `$${value.toLocaleString()}`;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(num)) {
      return `$${num.toLocaleString()}`;
    }
    return value;
  }
  return String(value);
}

// Parse section data to extract assessment metrics and other properties
interface ParsedSection {
  title: string;
  key: string;
  conditions: string | null;
  repairStatus: string | null;
  costEstimate: string | null;
  comments: string | null;
  tags: string[];
  nestedSections: ParsedSection[];
  simpleFields: Array<{ key: string; label: string; value: unknown }>;
  hasContent: boolean;
}

function parseSection(key: string, data: Record<string, unknown>): ParsedSection {
  const result: ParsedSection = {
    title: formatKey(key),
    key,
    conditions: null,
    repairStatus: null,
    costEstimate: null,
    comments: null,
    tags: [],
    nestedSections: [],
    simpleFields: [],
    hasContent: false,
  };

  for (const [propKey, propValue] of Object.entries(data)) {
    if (skipKeys.has(propKey) || !hasContent(propValue)) continue;

    const keyLower = propKey.toLowerCase();
    
    // Extract assessment metrics
    if (keyLower === 'conditions' || keyLower === 'condition' || keyLower === 'rating') {
      result.conditions = String(propValue);
      result.hasContent = true;
    }
    else if (keyLower === 'repair_status' || keyLower === 'repairstatus') {
      result.repairStatus = String(propValue);
      result.hasContent = true;
    }
    else if (keyLower === 'cost_estimate' || keyLower === 'costestimate' || keyLower.includes('cost')) {
      result.costEstimate = formatCost(propValue);
      result.hasContent = true;
    }
    // Comments / long text
    else if (keyLower === 'comments' || keyLower === 'notes' || keyLower === 'description') {
      result.comments = String(propValue);
      result.hasContent = true;
    }
    // Arrays of primitives become tags
    else if (Array.isArray(propValue) && isPrimitiveArray(propValue)) {
      result.tags.push(...propValue.map(String));
      result.hasContent = true;
    }
    // Nested objects become nested sections
    else if (isObject(propValue)) {
      const nestedSection = parseSection(propKey, propValue);
      if (nestedSection.hasContent) {
        result.nestedSections.push(nestedSection);
        result.hasContent = true;
      }
    }
    // Arrays of objects
    else if (Array.isArray(propValue) && propValue.length > 0 && isObject(propValue[0])) {
      propValue.forEach((item, idx) => {
        if (isObject(item)) {
          const nestedSection = parseSection(`${propKey} ${idx + 1}`, item);
          if (nestedSection.hasContent) {
            result.nestedSections.push(nestedSection);
            result.hasContent = true;
          }
        }
      });
    }
    // Simple fields
    else {
      result.simpleFields.push({
        key: propKey,
        label: formatKey(propKey),
        value: propValue,
      });
      result.hasContent = true;
    }
  }

  return result;
}

// Parse root level data
const parsedSections = computed(() => {
  if (!props.data) return [];
  
  const sections: ParsedSection[] = [];
  
  for (const [key, value] of Object.entries(props.data)) {
    if (skipKeys.has(key) || !hasContent(value)) continue;
    
    if (isObject(value)) {
      const section = parseSection(key, value);
      if (section.hasContent) {
        sections.push(section);
      }
    }
  }
  
  return sections;
});

// Get simple fields from root level (non-object values)
const rootSimpleFields = computed(() => {
  if (!props.data) return [];
  
  const fields: Array<{ key: string; label: string; value: unknown; type: string }> = [];
  
  for (const [key, value] of Object.entries(props.data)) {
    if (skipKeys.has(key) || !hasContent(value)) continue;
    
    if (!isObject(value) && !Array.isArray(value)) {
      const keyLower = key.toLowerCase();
      let type = 'text';
      
      if (keyLower.includes('condition') || keyLower.includes('rating')) type = 'condition';
      else if (keyLower.includes('cost') || keyLower.includes('estimate')) type = 'cost';
      else if (keyLower.includes('repair_status')) type = 'status';
      else if (typeof value === 'boolean') type = 'boolean';
      
      fields.push({
        key,
        label: formatKey(key),
        value,
        type,
      });
    }
  }
  
  return fields;
});

// Get root level tags (arrays of primitives at root)
const rootTags = computed(() => {
  if (!props.data) return { label: '', items: [] as string[] };
  
  for (const [key, value] of Object.entries(props.data)) {
    if (skipKeys.has(key)) continue;
    
    if (Array.isArray(value) && isPrimitiveArray(value) && value.length > 0) {
      return {
        label: formatKey(key),
        items: value.map(String),
      };
    }
  }
  
  return { label: '', items: [] };
});

// Get root level comments
const rootComments = computed(() => {
  if (!props.data) return null;
  
  for (const [key, value] of Object.entries(props.data)) {
    const keyLower = key.toLowerCase();
    if ((keyLower === 'comments' || keyLower === 'notes' || keyLower === 'description') && typeof value === 'string' && value.trim()) {
      return { label: formatKey(key), value: value.trim() };
    }
  }
  
  return null;
});

// Format display value
function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}
</script>

<template>
  <div v-if="data" class="space-y-4">
    
    <!-- Root Comments Block -->
    <div 
      v-if="rootComments"
      class="rounded-lg p-3"
      :class="theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-100'"
    >
      <div 
        class="text-xs font-medium uppercase tracking-wide mb-2"
        :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
      >
        {{ rootComments.label }}
      </div>
      <p 
        class="text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto scrollbar-thin"
        :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
      >
        {{ rootComments.value }}
      </p>
    </div>

    <!-- Root Simple Fields as Assessment Row -->
    <div 
      v-if="rootSimpleFields.length > 0"
      class="flex flex-wrap items-center gap-3"
    >
      <template v-for="field in rootSimpleFields" :key="field.key">
        <!-- Condition Badge -->
        <div v-if="field.type === 'condition'" class="flex flex-col gap-1">
          <span 
            class="text-[10px] font-medium uppercase tracking-wide"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ field.label }}
          </span>
          <span 
            class="px-3 py-1.5 text-xs font-bold rounded-md text-center min-w-[60px]"
            :class="getConditionStyle(String(field.value))"
          >
            {{ field.value }}
          </span>
        </div>
        
        <!-- Status Badge -->
        <div v-else-if="field.type === 'status'" class="flex flex-col gap-1">
          <span 
            class="text-[10px] font-medium uppercase tracking-wide"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ field.label }}
          </span>
          <span 
            class="px-3 py-1.5 text-xs font-bold rounded-md text-center min-w-[50px]"
            :class="getRepairStatusStyle(String(field.value))"
          >
            {{ field.value }}
          </span>
        </div>
        
        <!-- Cost Badge -->
        <div v-else-if="field.type === 'cost'" class="flex flex-col gap-1">
          <span 
            class="text-[10px] font-medium uppercase tracking-wide"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ field.label }}
          </span>
          <span 
            class="px-3 py-1.5 text-sm font-bold rounded-md"
            :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-white text-slate-900 border border-slate-300'"
          >
            {{ formatCost(field.value) }}
          </span>
        </div>
        
        <!-- Boolean -->
        <div v-else-if="field.type === 'boolean'" class="flex items-center gap-2">
          <span 
            class="w-5 h-5 rounded-full flex items-center justify-center"
            :class="field.value 
              ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              : theme === 'dark' ? 'bg-zinc-700 text-zinc-500' : 'bg-slate-200 text-slate-400'"
          >
            <svg v-if="field.value" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <span 
            class="text-sm"
            :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
          >
            {{ field.label }}
          </span>
        </div>
        
        <!-- Default Text -->
        <div v-else class="flex flex-col gap-1">
          <span 
            class="text-[10px] font-medium uppercase tracking-wide"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ field.label }}
          </span>
          <span 
            class="text-sm font-medium overflow-x-auto scrollbar-thin"
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
          >
            {{ formatValue(field.value) }}
          </span>
        </div>
      </template>
    </div>

    <!-- Root Tags -->
    <div v-if="rootTags.items.length > 0">
      <div 
        class="text-[10px] font-medium uppercase tracking-wide mb-2"
        :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
      >
        {{ rootTags.label }}
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="(tag, idx) in rootTags.items"
          :key="idx"
          class="px-2.5 py-1 text-xs font-medium rounded-md"
          :class="theme === 'dark' 
            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            : 'bg-slate-100 text-slate-700 border border-slate-200'"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Nested Sections as Accordions -->
    <div v-if="parsedSections.length > 0" class="space-y-2">
      <div 
        v-for="section in parsedSections" 
        :key="section.key"
        class="rounded-lg border overflow-hidden"
        :class="theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'"
      >
        <!-- Section Header -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
          :class="theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'"
          @click="toggleSection(section.key)"
          :aria-expanded="expandedSections.has(section.key)"
        >
          <span 
            class="text-sm font-semibold"
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
          >
            {{ section.title }}
          </span>
          <svg 
            class="w-4 h-4 transition-transform duration-200"
            :class="[
              expandedSections.has(section.key) ? 'rotate-180' : '',
              theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
            ]"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Section Content -->
        <div 
          v-show="expandedSections.has(section.key)"
          class="px-4 pb-4 space-y-4"
        >
          <!-- Assessment Metrics Row -->
          <div 
            v-if="section.conditions || section.repairStatus || section.costEstimate"
            class="flex flex-wrap items-end gap-4 pt-1"
          >
            <!-- Conditions -->
            <div v-if="section.conditions" class="flex flex-col gap-1">
              <span 
                class="text-[10px] font-medium uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                Conditions
              </span>
              <span 
                class="px-3 py-1.5 text-xs font-bold rounded-md text-center min-w-[60px]"
                :class="getConditionStyle(section.conditions)"
              >
                {{ section.conditions }}
              </span>
            </div>
            
            <!-- Repair Status -->
            <div v-if="section.repairStatus" class="flex flex-col gap-1">
              <span 
                class="text-[10px] font-medium uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                Repair Status
              </span>
              <span 
                class="px-3 py-1.5 text-xs font-bold rounded-md text-center min-w-[50px]"
                :class="getRepairStatusStyle(section.repairStatus)"
              >
                {{ section.repairStatus }}
              </span>
            </div>
            
            <!-- Cost Estimate -->
            <div v-if="section.costEstimate" class="flex flex-col gap-1">
              <span 
                class="text-[10px] font-medium uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                Cost Estimate
              </span>
              <span 
                class="px-3 py-1.5 text-sm font-bold rounded-md"
                :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-white text-slate-900 border border-slate-300 shadow-sm'"
              >
                {{ section.costEstimate }}
              </span>
            </div>
          </div>
          
          <!-- Tags -->
          <div v-if="section.tags.length > 0">
            <div 
              class="text-[10px] font-medium uppercase tracking-wide mb-2"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Type
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(tag, idx) in section.tags"
                :key="idx"
                class="px-2.5 py-1 text-xs font-medium rounded-md"
                :class="theme === 'dark' 
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- Comments -->
          <div 
            v-if="section.comments"
            class="rounded-lg p-3"
            :class="theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-50'"
          >
            <div 
              class="text-[10px] font-medium uppercase tracking-wide mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              Comments
            </div>
            <p 
              class="text-sm leading-relaxed whitespace-pre-wrap"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              {{ section.comments }}
            </p>
          </div>
          
          <!-- Simple Fields -->
          <div v-if="section.simpleFields.length > 0" class="space-y-3">
            <div
              v-for="field in section.simpleFields"
              :key="field.key"
              class="space-y-1"
            >
              <div 
                class="text-xs font-medium uppercase tracking-wide"
                :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
              >
                {{ field.label }}
              </div>
              <div 
                class="text-sm font-medium overflow-x-auto scrollbar-thin"
                :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
              >
                {{ formatValue(field.value) }}
              </div>
            </div>
          </div>
          
          <!-- Nested Sections (flat display - no cards, no accordion) -->
          <div v-if="section.nestedSections.length > 0" class="space-y-5 pt-2">
            <div 
              v-for="nested in section.nestedSections" 
              :key="nested.key"
              class="space-y-3"
            >
              <!-- Nested Section Title (plain text, no accordion) -->
              <div 
                class="text-sm font-semibold pl-3 border-l-2"
                :class="theme === 'dark' ? 'text-zinc-300 border-zinc-700' : 'text-slate-700 border-slate-300'"
              >
                {{ nested.title }}
              </div>
              
              <!-- Nested Assessment Row -->
              <div 
                v-if="nested.conditions || nested.repairStatus || nested.costEstimate"
                class="flex flex-wrap items-end gap-3"
              >
                <div v-if="nested.conditions" class="flex flex-col gap-1">
                  <span class="text-[10px] font-medium uppercase tracking-wide" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'">Conditions</span>
                  <span class="px-2.5 py-1 text-xs font-bold rounded-md text-center" :class="getConditionStyle(nested.conditions)">{{ nested.conditions }}</span>
                </div>
                <div v-if="nested.repairStatus" class="flex flex-col gap-1">
                  <span class="text-[10px] font-medium uppercase tracking-wide" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'">Repair Status</span>
                  <span class="px-2.5 py-1 text-xs font-bold rounded-md text-center" :class="getRepairStatusStyle(nested.repairStatus)">{{ nested.repairStatus }}</span>
                </div>
                <div v-if="nested.costEstimate" class="flex flex-col gap-1">
                  <span class="text-[10px] font-medium uppercase tracking-wide" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'">Cost Estimate</span>
                  <span class="px-2.5 py-1 text-sm font-bold rounded-md" :class="theme === 'dark' ? 'bg-zinc-700 text-zinc-100 border border-zinc-600' : 'bg-white text-slate-900 border border-slate-300'">{{ nested.costEstimate }}</span>
                </div>
              </div>
              
              <!-- Nested Tags -->
              <div v-if="nested.tags.length > 0">
                <div 
                  class="text-[10px] font-medium uppercase tracking-wide mb-1.5"
                  :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                >
                  Type
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, idx) in nested.tags"
                    :key="idx"
                    class="px-2 py-0.5 text-xs font-medium rounded"
                    :class="theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <!-- Nested Comments -->
              <div v-if="nested.comments">
                <div 
                  class="text-[10px] font-medium uppercase tracking-wide mb-1.5"
                  :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                >
                  Comments
                </div>
                <div 
                  class="text-sm leading-relaxed p-2.5 rounded overflow-x-auto scrollbar-thin"
                  :class="theme === 'dark' ? 'bg-zinc-700/50 text-zinc-300' : 'bg-slate-100 text-slate-700'"
                >
                  {{ nested.comments }}
                </div>
              </div>
              
              <!-- Nested Simple Fields -->
              <div v-if="nested.simpleFields.length > 0" class="space-y-2.5">
                <div
                  v-for="field in nested.simpleFields"
                  :key="field.key"
                  class="space-y-1"
                >
                  <div 
                    class="text-[10px] font-medium uppercase tracking-wide"
                    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
                  >
                    {{ field.label }}
                  </div>
                  <div 
                    class="text-sm font-medium overflow-x-auto scrollbar-thin"
                    :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
                  >
                    {{ formatValue(field.value) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div 
    v-else 
    class="flex flex-col items-center justify-center py-8"
    :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
  >
    <svg class="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p class="text-sm">No data recorded for this section</p>
  </div>
</template>

<style scoped>
/* Custom thin scrollbar for horizontal overflow */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* Dark theme scrollbar */
:global(.dark) .scrollbar-thin {
  scrollbar-color: rgba(82, 82, 91, 0.5) transparent;
}

:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(82, 82, 91, 0.5);
}

:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(82, 82, 91, 0.7);
}
</style>
