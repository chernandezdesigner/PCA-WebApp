<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, hideToast } = useToast()

const typeClasses: Record<string, string> = {
  error: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
  info: 'bg-blue-600 text-white',
  saving: 'bg-gray-600 text-white',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm min-w-[280px]',
          typeClasses[toast.type],
        ]"
      >
        <p class="flex-1">{{ toast.message }}</p>
        <button
          class="ml-auto shrink-0 opacity-80 hover:opacity-100"
          @click="hideToast(toast.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
