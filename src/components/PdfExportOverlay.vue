<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  visible: boolean
  message?: string
}>();

const { theme } = useTheme();
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="props.visible"
      class="fixed inset-0 flex items-center justify-center z-[9998]"
      :class="theme === 'dark' ? 'bg-black/70' : 'bg-gray-900/60'"
    >
      <div
        class="rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md w-full mx-4 transition-colors"
        :class="theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'"
      >
        <div class="flex gap-2 mb-6">
          <div
            class="w-2.5 h-2.5 rounded-full animate-bounce"
            :class="theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'"
            style="animation-delay: 0ms"
          />
          <div
            class="w-2.5 h-2.5 rounded-full animate-bounce"
            :class="theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'"
            style="animation-delay: 150ms"
          />
          <div
            class="w-2.5 h-2.5 rounded-full animate-bounce"
            :class="theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'"
            style="animation-delay: 300ms"
          />
        </div>
        <h3
          class="text-lg font-bold mb-2"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          Generating PDF Report
        </h3>
        <p
          class="text-sm text-center mb-1"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'"
        >
          {{ message || 'Generating your PDF report...' }}
        </p>
        <p
          class="text-xs text-center"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >
          Please do not close this window
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
