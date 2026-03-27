import { supabase } from '@/services/supabase';
import { assembleReportHtml } from './reportTemplate';
import type { ReportMeta } from './reportTemplate';
import type { ReportContentRow, SectionData } from '@/types/database';

export interface AppendixFileEntry {
  url: string;
  mimeType: string;
}

export interface AppendixBPhotoEntry {
  url: string;
  notes: string;
  sortOrder: number;
}

export interface AppendixData {
  aFiles: AppendixFileEntry[];
  bPhotos: AppendixBPhotoEntry[];
  cFiles: AppendixFileEntry[];
  dFiles: AppendixFileEntry[];
  eFiles: AppendixFileEntry[];
}

export interface GeneratePdfResult {
  pdfUrl: string;
  storagePath: string;
  appendixData: AppendixData;
  propertyName: string;
  cityStateZip: string;
}

const UPLOAD_BUCKET = 'report-documents';

/**
 * Get the appendix step data object, tolerating legacy step keys (e.g. step_34 in old reports).
 * New reports save to step_37; fall back to first available step key.
 */
function getAppendixStepData(content: ReportContentRow): Record<string, unknown> | undefined {
  const appendices = content.appendices as SectionData | null;
  if (!appendices) return undefined;
  // Prefer current step key, fall back to any other step key present
  const stepData =
    (appendices['step_37'] as Record<string, unknown> | undefined) ??
    (appendices['step_34'] as Record<string, unknown> | undefined) ??
    (Object.values(appendices)[0] as Record<string, unknown> | undefined);
  return stepData;
}

/** Read a flat string field from a property-info step (e.g. step 1 → section_1_summary). */
function readPropertyField(content: ReportContentRow, fieldId: string): string {
  const section = content['section_1_summary'] as SectionData | null;
  if (!section) return '';
  const stepData = section['step_1'] as Record<string, unknown> | undefined;
  if (!stepData) return '';
  const val = stepData[fieldId];
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    const obj = val as Record<string, string>;
    return obj['main'] || '';
  }
  return '';
}

/**
 * Resolve a signed URL for the first uploaded image file from appendices data.
 * Returns the signed URL or empty string if not found.
 */
async function resolveAppendixUploadUrl(
  content: ReportContentRow,
  field: string,
): Promise<string> {
  try {
    const stepData = getAppendixStepData(content);
    if (!stepData) return '';
    const fieldData = stepData[field] as { files?: Array<{ storage_path?: string; mime_type?: string }> } | undefined;
    if (!fieldData?.files?.length) return '';
    const file = fieldData.files[0];
    if (!file?.storage_path) return '';
    // Only resolve image files (PDFs can't be embedded as img)
    if (file.mime_type && !file.mime_type.startsWith('image/')) return '';
    const { data } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .createSignedUrl(file.storage_path, 3600);
    return data?.signedUrl || '';
  } catch {
    return '';
  }
}

/**
 * Resolve signed URLs for all files (images + PDFs) in an appendix field (A/C/D/E).
 */
async function resolveAppendixFileUrls(
  content: ReportContentRow,
  fieldKey: string,
): Promise<AppendixFileEntry[]> {
  try {
    const stepData = getAppendixStepData(content);
    if (!stepData) return [];
    const fieldData = stepData[fieldKey] as { files?: Array<{ storage_path?: string; mime_type?: string }> } | undefined;
    if (!fieldData?.files?.length) return [];
    const results = await Promise.all(
      fieldData.files.map(async (file) => {
        if (!file.storage_path || !file.mime_type) return null;
        const { data } = await supabase.storage.from(UPLOAD_BUCKET).createSignedUrl(file.storage_path, 3600);
        return data?.signedUrl ? { url: data.signedUrl, mimeType: file.mime_type } : null;
      }),
    );
    return results.filter((r): r is AppendixFileEntry => r !== null);
  } catch {
    return [];
  }
}

/**
 * Resolve signed URLs for all Appendix B photos (with labels + sort order).
 */
async function resolveAppendixBPhotos(
  content: ReportContentRow,
): Promise<AppendixBPhotoEntry[]> {
  try {
    const stepData = getAppendixStepData(content);
    if (!stepData) return [];
    type AppendixPhoto = { storage_path: string; notes: string; sort_order: number; bucket: string };
    const appendixB = stepData['appendix_b'] as { photos?: AppendixPhoto[] } | undefined;
    if (!appendixB?.photos?.length) return [];
    const results = await Promise.all(
      appendixB.photos.map(async (photo) => {
        if (!photo.storage_path) return null;
        const bucket = photo.bucket || UPLOAD_BUCKET;
        const { data } = await supabase.storage.from(bucket).createSignedUrl(photo.storage_path, 3600);
        return data?.signedUrl
          ? { url: data.signedUrl, notes: photo.notes || '', sortOrder: photo.sort_order ?? 0 }
          : null;
      }),
    );
    return results.filter((r): r is AppendixBPhotoEntry => r !== null);
  } catch {
    return [];
  }
}

export async function generateReportPdf(
  reportId: string,
  meta: ReportMeta,
): Promise<GeneratePdfResult> {
  // 1. Load report content
  const { data: contentData, error: contentError } = await supabase
    .from('report_content')
    .select('*')
    .eq('report_id', reportId)
    .single();

  if (contentError || !contentData) {
    throw new Error(`Failed to load report content: ${contentError?.message ?? 'Not found'}`);
  }

  const content = contentData as ReportContentRow;

  // 2. Resolve cover/table image URLs + appendix file URLs in parallel
  const [
    coverPhotoUrl,
    table1ImageUrl,
    table2ImageUrl,
    aFiles,
    bPhotos,
    cFiles,
    dFiles,
    eFiles,
  ] = await Promise.all([
    resolveAppendixUploadUrl(content, 'cover_photo'),
    resolveAppendixUploadUrl(content, 'table_1_deficiencies'),
    resolveAppendixUploadUrl(content, 'table_2_reserves'),
    resolveAppendixFileUrls(content, 'appendix_a'),
    resolveAppendixBPhotos(content),
    resolveAppendixFileUrls(content, 'appendix_c'),
    resolveAppendixFileUrls(content, 'appendix_d'),
    resolveAppendixFileUrls(content, 'appendix_e'),
  ]);

  // 3. Assemble HTML (only cover/table images go into the template now)
  const resolvedMeta: ReportMeta = {
    ...meta,
    coverPhotoUrl: coverPhotoUrl || meta.coverPhotoUrl,
    table1ImageUrl: table1ImageUrl || meta.table1ImageUrl,
    table2ImageUrl: table2ImageUrl || meta.table2ImageUrl,
  };

  const html = assembleReportHtml(content, resolvedMeta);

  // 4. Call edge function
  const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-pdf', {
    body: { reportId, html },
  });

  if (fnError) {
    throw new Error(`Edge function error: ${fnError.message}`);
  }

  if (!fnData?.pdfUrl) {
    throw new Error(fnData?.error ?? 'No PDF URL returned from edge function');
  }

  const propertyName = readPropertyField(content, 'property-name') || 'Subject Property';
  const city = readPropertyField(content, 'city');
  const state = readPropertyField(content, 'state');
  const zip = readPropertyField(content, 'zip');
  const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');

  return {
    pdfUrl: fnData.pdfUrl,
    storagePath: fnData.storagePath,
    appendixData: { aFiles, bPhotos, cFiles, dFiles, eFiles },
    propertyName,
    cityStateZip,
  };
}

export async function downloadPdf(storagePath: string): Promise<string> {
  const bucket = storagePath.split('/')[0];
  const path = storagePath.split('/').slice(1).join('/');

  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (!data?.signedUrl) {
    throw new Error('Failed to generate download URL');
  }

  return data.signedUrl;
}
