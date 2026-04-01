import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  let toasts: ReturnType<typeof useToast>['toasts']
  let showToast: ReturnType<typeof useToast>['showToast']
  let hideToast: ReturnType<typeof useToast>['hideToast']
  let updateToast: ReturnType<typeof useToast>['updateToast']

  beforeEach(() => {
    vi.useFakeTimers()
    const toast = useToast()
    toasts = toast.toasts
    showToast = toast.showToast
    hideToast = toast.hideToast
    updateToast = toast.updateToast
    // drain any leftover toasts from previous tests
    toasts.value.splice(0)
  })

  afterEach(() => {
    toasts.value.splice(0)
    vi.useRealTimers()
  })

  it('showToast adds a toast with correct id, message, type', () => {
    showToast('Hello', 'info')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('Hello')
    expect(toasts.value[0].type).toBe('info')
    expect(toasts.value[0].id).toMatch(/^toast-\d+$/)
  })

  it('showToast returns an id string', () => {
    const id = showToast('Test')
    expect(typeof id).toBe('string')
    expect(id).toMatch(/^toast-\d+$/)
  })

  it('auto-dismisses after duration ms', () => {
    showToast('Bye', 'success', 3000)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(3000)
    expect(toasts.value).toHaveLength(0)
  })

  it('saving type does NOT auto-dismiss', () => {
    showToast('Saving...', 'saving', 3000)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(10000)
    expect(toasts.value).toHaveLength(1)
  })

  it('updateToast changes message and type of existing toast', () => {
    const id = showToast('Loading', 'saving')
    updateToast(id, 'Done!', 'success')
    expect(toasts.value[0].message).toBe('Done!')
    expect(toasts.value[0].type).toBe('success')
  })

  it('hideToast removes the correct toast, others remain', () => {
    const id1 = showToast('First', 'info')
    const id2 = showToast('Second', 'error')
    hideToast(id1)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].id).toBe(id2)
  })

  it('multiple toasts coexist in array', () => {
    showToast('A', 'success')
    showToast('B', 'error')
    showToast('C', 'info')
    expect(toasts.value).toHaveLength(3)
    expect(toasts.value.map(t => t.message)).toEqual(['A', 'B', 'C'])
  })
})
