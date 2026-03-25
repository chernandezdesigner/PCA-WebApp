import { supabase } from '@/services/supabase';
import { assembleReportHtml } from './reportTemplate';
import type { ReportMeta } from './reportTemplate';
import type { ReportContentRow, SectionData } from '@/types/database';

export interface GeneratePdfResult {
  pdfUrl: string;
  storagePath: string;
}

const UPLOAD_BUCKET = 'report-documents';

/**
 * Resolve a signed URL for an uploaded file from appendices data.
 * Returns the signed URL or empty string if not found.
 */
async function resolveAppendixUploadUrl(
  content: ReportContentRow,
  field: string,
): Promise<string> {
  try {
    const appendices = content.appendices as SectionData | null;
    if (!appendices) return '';
    const step37 = appendices['step_37'] as Record<string, unknown> | undefined;
    if (!step37) return '';
    const fieldData = step37[field] as { files?: Array<{ storage_path?: string; mime_type?: string }> } | undefined;
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

  // 2. Resolve appendices upload URLs (signed for DocRaptor access)
  const [coverPhotoUrl, table1ImageUrl, table2ImageUrl] = await Promise.all([
    resolveAppendixUploadUrl(content, 'cover_photo'),
    resolveAppendixUploadUrl(content, 'table_1_deficiencies'),
    resolveAppendixUploadUrl(content, 'table_2_reserves'),
  ]);

  // Merge resolved URLs into meta
  const resolvedMeta: ReportMeta = {
    ...meta,
    coverPhotoUrl: coverPhotoUrl || meta.coverPhotoUrl,
    table1ImageUrl: table1ImageUrl || meta.table1ImageUrl,
    table2ImageUrl: table2ImageUrl || meta.table2ImageUrl,
  };

  // 3. Assemble HTML
  const html = assembleReportHtml(content, resolvedMeta);

  // 3. Call edge function
  const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-pdf', {
    body: { reportId, html },
  });

  if (fnError) {
    throw new Error(`Edge function error: ${fnError.message}`);
  }

  if (!fnData?.pdfUrl) {
    throw new Error(fnData?.error ?? 'No PDF URL returned from edge function');
  }

  return {
    pdfUrl: fnData.pdfUrl,
    storagePath: fnData.storagePath,
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
