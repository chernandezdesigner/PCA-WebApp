<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useTheme } from '@/composables/useTheme'

const { toasts, hideToast } = useToast()
const { theme } = useTheme()

const typeConfig: Record<string, {
  dark: string;
  light: string;
  icon: string;
}> = {
  error: {
    dark: 'bg-red-950 border-red-900 text-red-200',
    light: 'bg-red-50 border-red-200 text-red-800',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  success: {
    dark: 'bg-emerald-950 border-emerald-900 text-emerald-200',
    light: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    dark: 'bg-blue-950 border-blue-900 text-blue-200',
    light: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  saving: {
    dark: 'bg-zinc-900 border-zinc-800 text-zinc-300',
    light: 'bg-slate-50 border-slate-200 text-slate-700',
    icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
  },
}

function getToastClasses(type: string): string {
  const config = typeConfig[type] || typeConfig.info
  return theme.value === 'dark' ? config.dark : config.light
}

function getIcon(type: string): string {
  return (typeConfig[type] || typeConfig.info).icon
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-lg shadow-lg border px-4 py-3 flex items-start gap-3 max-w-sm min-w-[280px]',
          getToastClasses(toast.type),
        ]"
        role="alert"
      >
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(toast.type)" />
        </svg>
        <p class="flex-1 text-sm">{{ toast.message }}</p>
        <button
          class="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          @click="hideToast(toast.id)"
          aria-label="Dismiss notification"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
