import { supabase } from '@/services/supabase';
import { assembleReportHtml } from './reportTemplate';
import type { ReportMeta } from './reportTemplate';
import type { ReportContentRow } from '@/types/database';

export interface GeneratePdfResult {
  pdfUrl: string;
  storagePath: string;
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

  // 2. Assemble HTML
  const html = assembleReportHtml(content, meta);

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
