export function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operation} timed out after ${Math.round(ms / 1000)}s. Please try again.`)),
        ms
      )
    ),
  ])
}
