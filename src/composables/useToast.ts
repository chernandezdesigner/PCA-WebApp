import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'saving'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

let counter = 0
const toasts = ref<Toast[]>([])

export function useToast() {
  const showToast = (message: string, type: ToastType = 'success', duration = 3000): string => {
    const id = `toast-${++counter}`
    toasts.value.push({ id, message, type })
    if (type !== 'saving' && duration > 0) {
      setTimeout(() => hideToast(id), duration)
    }
    return id
  }

  const hideToast = (id: string) => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  const updateToast = (id: string, message: string, type: ToastType) => {
    const t = toasts.value.find(t => t.id === id)
    if (t) { t.message = message; t.type = type }
  }

  const showError = (message: string) => showToast(message, 'error', 7000)
  const showSuccess = (message: string) => showToast(message, 'success', 3000)
  const showInfo = (message: string) => showToast(message, 'info', 4000)

  return { toasts, showToast, hideToast, updateToast, showError, showSuccess, showInfo }
}
