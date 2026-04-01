import { buildPdfFilename } from '@/utils/pdfFilename'

describe('buildPdfFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 31, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('full valid data produces correct format', () => {
    const result = buildPdfFilename('PRJ-001', 'Sunset Plaza', 'Chicago, IL 60601')
    expect(result).toBe('PRJ_001_Sunset_Plaza_Chicago_IL_03-31-2026.pdf')
  })

  it('empty projectNumber uses PCA as prefix', () => {
    const result = buildPdfFilename('', 'Sunset Plaza', 'Chicago, IL 60601')
    expect(result).toBe('PCA_Sunset_Plaza_Chicago_IL_03-31-2026.pdf')
  })

  it('empty propertyName is omitted without double underscores', () => {
    const result = buildPdfFilename('PRJ-001', '', 'Chicago, IL 60601')
    expect(result).toBe('PRJ_001_Chicago_IL_03-31-2026.pdf')
    expect(result).not.toContain('__')
  })

  it('special characters in propertyName are sanitized to underscores', () => {
    const result = buildPdfFilename('PRJ-001', 'Sunset & Plaza #5!', 'Chicago, IL 60601')
    expect(result).toBe('PRJ_001_Sunset_Plaza_5_Chicago_IL_03-31-2026.pdf')
  })

  it('cityStateZip extracts city and state correctly', () => {
    const result = buildPdfFilename('PRJ-001', 'Test', 'Chicago, IL 60601')
    expect(result).toContain('Chicago')
    expect(result).toContain('IL')
    expect(result).not.toContain('60601')
  })

  it('empty cityStateZip omits city/state parts with no trailing underscores before date', () => {
    const result = buildPdfFilename('PRJ-001', 'Test', '')
    expect(result).toBe('PRJ_001_Test_03-31-2026.pdf')
    expect(result).not.toContain('__')
  })

  it('all empty strings produces PCA_{date}.pdf', () => {
    const result = buildPdfFilename('', '', '')
    expect(result).toBe('PCA_03-31-2026.pdf')
  })
})
