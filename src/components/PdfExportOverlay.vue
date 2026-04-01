<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  message?: string
}>()
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="props.visible"
      class="fixed inset-0 flex items-center justify-center z-[9998] bg-gray-900/60"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-md w-full mx-4">
        <div class="flex gap-2 mb-6">
          <div
            class="w-3 h-3 rounded-full animate-bounce"
            style="background-color: #0C306C; animation-delay: 0ms"
          />
          <div
            class="w-3 h-3 rounded-full animate-bounce"
            style="background-color: #0C306C; animation-delay: 150ms"
          />
          <div
            class="w-3 h-3 rounded-full animate-bounce"
            style="background-color: #0C306C; animation-delay: 300ms"
          />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Generating PDF Report</h3>
        <p class="text-gray-600 text-sm text-center mb-1">{{ message || 'Generating your PDF report...' }}</p>
        <p class="text-gray-400 text-xs text-center">Please do not close this window</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
