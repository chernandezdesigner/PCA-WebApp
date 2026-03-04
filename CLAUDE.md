# PCA Web App

Internal SaaS tool for commercial Property Condition Assessments (PCA). Multi-step form wizard that generates PDF reports via DocRaptor (Prince XML).

## Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **PDF Generation:** DocRaptor API (Phase 1, server-side) + pdf-lib (Phase 2, client-side post-processing)
- **Validation:** VeeValidate + Zod

## Project Structure

```
src/
  components/       # Reusable form components (DynamicField, PropertyInfoSection, DynamicReportSection, etc.)
  composables/      # useWebReportForm (auto-save, step navigation), useTheme, useReportCreation
  data/templates/   # Form field configs: group1.ts (D/O/C/R sections 5-10), group2.ts (property-info sections 1-4)
  services/
    supabase.ts     # Supabase client
    pdf/
      reportTemplate.ts        # HTML template generation (~1500 lines, single file)
      pdfGenerationService.ts  # Orchestrates edge function call
      pdfPostProcessor.ts      # Client-side pdf-lib post-processing (page numbers, appendices)
  stores/           # authStore (Supabase auth)
  types/            # database.ts (Supabase types), section.ts (form field types)
  views/            # DashboardView, AssessmentReportView (form wizard), PdfPreviewView, LoginView
supabase/
  functions/generate-pdf/  # Deno edge function: loads fonts from Storage, injects into HTML, calls DocRaptor
  migrations/              # SQL migrations for reports + report_content tables
```

## Key Patterns

- **Form data** is stored as JSONB in `report_content` table, organized by section columns (`section_1_summary`, `section_5_site_grounds`, etc.) with nested `step_N` keys
- **D/O/C/R sections** (5-10) use `SectionConfig` with description/observations/concerns/recommendations blocks
- **Property-info sections** (1-4) use `PropertyInfoConfig` with flat field lists saved directly on step objects
- **Template helpers:** `pv()`/`pvRaw()` read property-info fields; `v()`/`vRaw()` read D/O/C/R block fields
- **Step mapping:** `STEP_TO_SECTION` maps step numbers (1-37) to DB section columns, mirrored in both `useWebReportForm.ts` and `reportTemplate.ts`
- **PDF flow:** assembleReportHtml() → Edge Function (font injection + DocRaptor) → pdf-lib (page numbers + appendices) → download
- **Font strategy:** TTF files in Supabase Storage `fonts` bucket, base64-encoded at runtime by edge function

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check + build
- `npx vue-tsc --noEmit` — Type-check only
- `npx supabase functions deploy generate-pdf` — Deploy edge function
- `npx supabase secrets set KEY=VALUE` — Set edge function secrets

## Environment

- `.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge function secrets: `DOCRAPTOR_API_KEY`, `SERVICE_ROLE_KEY`
- Supabase Storage buckets: `fonts`, `report-pdfs`, `report-assets`

## Status

Template HTML is built out for all 10 sections + appendices. PDF generation pipeline is functional end-to-end. Currently testing and doing surgical fixes to template layout and data wiring.
