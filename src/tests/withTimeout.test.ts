import { withTimeout } from '@/utils/withTimeout'

describe('withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves with the value when promise settles before timeout', async () => {
    const result = await withTimeout(Promise.resolve('hello'), 1000, 'test')
    expect(result).toBe('hello')
  })

  it('rejects with an Error when timeout fires first', async () => {
    vi.useFakeTimers()
    const slow = new Promise(() => {}) // never resolves
    const p = withTimeout(slow, 5000, 'myOp')
    const rejection = p.catch((e) => e)
    await vi.runAllTimersAsync()
    const err = await rejection
    expect(err).toBeInstanceOf(Error)
  })

  it('rejection message contains the operation name', async () => {
    vi.useFakeTimers()
    const slow = new Promise(() => {})
    const p = withTimeout(slow, 5000, 'myOp')
    const rejection = p.catch((e) => e)
    await vi.runAllTimersAsync()
    const err = await rejection
    expect(err.message).toContain('myOp')
  })

  it('rejection message contains the timeout duration in seconds', async () => {
    vi.useFakeTimers()
    const slow = new Promise(() => {})
    const p = withTimeout(slow, 5000, 'myOp')
    const rejection = p.catch((e) => e)
    await vi.runAllTimersAsync()
    const err = await rejection
    expect(err.message).toContain('5s')
  })

  it('does NOT reject if promise settles just before timeout', async () => {
    vi.useFakeTimers()
    const p = withTimeout(
      new Promise<string>((resolve) => setTimeout(() => resolve('done'), 990)),
      1000,
      'close-call'
    )
    await vi.advanceTimersByTimeAsync(990)
    const result = await p
    expect(result).toBe('done')
  })
})
