export function buildPdfFilename(
  projectNumber: string,
  propertyName: string,
  cityStateZip: string,
): string {
  const sanitize = (s: string) =>
    s.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 30)

  const d = new Date()
  const date = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`

  // cityStateZip format: "Chicago, IL 60601" — extract city and state only
  const [cityPart = '', statePart = ''] = cityStateZip.split(',').map((s: string) => s.trim())
  const stateOnly = statePart.split(' ')[0] // "IL" from "IL 60601"

  const parts = [
    projectNumber ? sanitize(projectNumber) : 'PCA',
    propertyName ? sanitize(propertyName) : '',
    cityPart ? sanitize(cityPart) : '',
    stateOnly ? sanitize(stateOnly) : '',
    date,
  ].filter(Boolean)

  return parts.join('_') + '.pdf'
}
