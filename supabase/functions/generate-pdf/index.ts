import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { assembleReportHtml, ReportMeta } from '../_shared/reportTemplate.ts';
import { PREPARERS } from '../_shared/preparers.ts';

const DOCRAPTOR_API_KEY = Deno.env.get('DOCRAPTOR_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

const FONT_FILES: Record<string, { family: string; weight: string; style: string }> = {
  'CALIBRI.TTF':   { family: 'Calibri', weight: '400', style: 'normal' },
  'CALIBRIL.TTF':  { family: 'Calibri', weight: '300', style: 'normal' },
  'CALIBRILI.TTF': { family: 'Calibri', weight: '300', style: 'italic' },
  'CALIBRII.TTF':  { family: 'Calibri', weight: '400', style: 'italic' },
  'CALIBRIB.TTF':  { family: 'Calibri', weight: '700', style: 'normal' },
  'CALIBRIZ.TTF':  { family: 'Calibri', weight: '700', style: 'italic' },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function loadFontsAsBase64(supabase: ReturnType<typeof createClient>): Promise<string> {
  const declarations: string[] = [];
  for (const [filename, meta] of Object.entries(FONT_FILES)) {
    try {
      const { data, error } = await supabase.storage.from('fonts').download(filename);
      if (error || !data) {
        console.warn(`Font ${filename} not found:`, error?.message);
        continue;
      }
      const arrayBuffer = await data.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), ''),
      );
      declarations.push(`
        @font-face {
          font-family: '${meta.family}';
          font-weight: ${meta.weight};
          font-style: ${meta.style};
          src: url('data:font/truetype;charset=utf-8;base64,${base64}') format('truetype');
        }
      `);
    } catch (err) {
      console.warn(`Failed to load font ${filename}:`, err);
    }
  }
  return declarations.join('\n');
}

function readPropertyField(content: Record<string, unknown>, fieldId: string): string {
  const section = content['section_1_summary'] as Record<string, unknown> | null;
  if (!section) return '';
  const stepData = section['step_1'] as Record<string, unknown> | undefined;
  if (!stepData) return '';
  const val = stepData[fieldId];
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    return (val as Record<string, string>)['main'] || '';
  }
  return '';
}

async function resolveAppendixUploadUrl(
  supabase: ReturnType<typeof createClient>,
  content: Record<string, unknown>,
  field: string,
): Promise<string> {
  try {
    const appendices = content['appendices'] as Record<string, unknown> | null;
    if (!appendices) return '';
    const stepData = (
      appendices['step_37'] ??
      appendices['step_34'] ??
      Object.values(appendices)[0]
    ) as Record<string, unknown> | undefined;
    if (!stepData) return '';
    const fieldData = stepData[field] as { files?: Array<{ storage_path?: string; mime_type?: string }> } | undefined;
    if (!fieldData?.files?.length) return '';
    const file = fieldData.files[0];
    if (!file?.storage_path) return '';
    if (file.mime_type && !file.mime_type.startsWith('image/')) return '';
    const { data } = await supabase.storage
      .from('report-documents')
      .createSignedUrl(file.storage_path, 3600);
    return data?.signedUrl || '';
  } catch {
    return '';
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { reportId, reviewedBy, reviewedByTitle, logoUrl, dateIssued } = await req.json();

    if (!reportId) {
      return jsonResponse({ error: 'reportId is required' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Load report content from DB
    const { data: contentData, error: contentError } = await supabase
      .from('report_content')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (contentError || !contentData) {
      console.error('Content load error:', contentError?.message);
      return jsonResponse(
        { error: 'Failed to load report content', details: contentError?.message ?? 'Not found' },
        404,
      );
    }

    const content = contentData as Record<string, unknown>;

    // 2. Resolve cover/table image URLs (using service role — bypasses storage RLS)
    const [coverPhotoUrl, table1ImageUrl, table2ImageUrl] = await Promise.all([
      resolveAppendixUploadUrl(supabase, content, 'cover_photo'),
      resolveAppendixUploadUrl(supabase, content, 'table_1_deficiencies'),
      resolveAppendixUploadUrl(supabase, content, 'table_2_reserves'),
    ]);

    // 3. Resolve preparer info
    const step1 = (
      (content['section_1_summary'] as Record<string, Record<string, unknown>> | null)?.['step_1']
    ) ?? {};
    const preparerKey = step1['prepared-by'] as string | undefined;
    const preparer = preparerKey ? PREPARERS[preparerKey] : undefined;
    const formTitle = step1['prepared-by-title'] as string | undefined;

    const preparedBySignatureUrl = preparer?.signatureKey
      ? `${SUPABASE_URL}/storage/v1/object/public/report-assets/${
          preparer.signatureKey.split('/').map(encodeURIComponent).join('/')
        }`
      : undefined;

    // 4. Assemble HTML
    const resolvedMeta: ReportMeta = {
      projectNumber: '',
      clientName: '',
      clientContactName: '',
      clientAddress: '',
      clientCityStateZip: '',
      dateIssued: dateIssued ||
        new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      preparedBy: preparer?.name ?? '',
      preparedByTitle: formTitle || preparer?.title || 'Project Manager',
      reviewedBy: reviewedBy || 'Ronnie Long',
      reviewedByTitle: reviewedByTitle || 'Assessments Director',
      logoUrl: logoUrl ||
        `${SUPABASE_URL}/storage/v1/object/public/report-assets/ASMLogoBlue.png`,
      coverPhotoUrl: coverPhotoUrl || undefined,
      table1ImageUrl: table1ImageUrl || undefined,
      table2ImageUrl: table2ImageUrl || undefined,
      preparedBySignatureUrl,
    };

    const html = assembleReportHtml(content as Parameters<typeof assembleReportHtml>[0], resolvedMeta);

    if (!html) {
      return jsonResponse({ error: 'Failed to assemble report HTML' }, 500);
    }

    // 5. Load fonts and inject
    const fontCss = await loadFontsAsBase64(supabase);
    const finalHtml = html.replace('/* FONT_PLACEHOLDER */', fontCss);

    // 6. Call DocRaptor
    const docRaptorResponse = await fetch('https://docraptor.com/docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(DOCRAPTOR_API_KEY + ':')}`,
      },
      body: JSON.stringify({
        test: !DOCRAPTOR_API_KEY || DOCRAPTOR_API_KEY === 'YOUR_API_KEY_HERE',
        document_type: 'pdf',
        document_content: finalHtml,
        name: `PCA-Report-${reportId}`,
        prince_options: { media: 'print', baseurl: SUPABASE_URL },
      }),
    });

    if (!docRaptorResponse.ok) {
      const errorText = await docRaptorResponse.text();
      console.error('DocRaptor error:', errorText);
      return jsonResponse({ error: 'DocRaptor PDF generation failed', details: errorText }, 502);
    }

    const pdfBuffer = await docRaptorResponse.arrayBuffer();
    const pdfPath = `${reportId}/base.pdf`;

    // 7. Upload PDF to Storage
    const { error: uploadError } = await supabase.storage
      .from('report-pdfs')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return jsonResponse({ error: 'Failed to store PDF', details: uploadError.message }, 500);
    }

    // 8. Update report metadata (non-fatal)
    const { error: metaUpdateError } = await supabase
      .from('reports')
      .update({
        pdf_generated_at: new Date().toISOString(),
        pdf_storage_path: `report-pdfs/${pdfPath}`,
      })
      .eq('id', reportId);

    if (metaUpdateError) {
      console.error('Failed to update report metadata:', metaUpdateError.message);
    }

    // 9. Generate signed download URL
    const { data: signedUrlData } = await supabase.storage
      .from('report-pdfs')
      .createSignedUrl(pdfPath, 3600);

    // 10. Read property info to return to client for filename/display
    const propertyName = readPropertyField(content, 'property-name') || 'Subject Property';
    const projectNumber = readPropertyField(content, 'project-number');
    const city = readPropertyField(content, 'city');
    const state = readPropertyField(content, 'state');
    const zip = readPropertyField(content, 'zip');
    const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');

    return jsonResponse({
      pdfUrl: signedUrlData?.signedUrl ?? null,
      storagePath: `report-pdfs/${pdfPath}`,
      propertyName,
      cityStateZip,
      projectNumber,
    });

  } catch (err) {
    console.error('generate-pdf error:', err);
    return jsonResponse({ error: 'Internal server error', details: String(err) }, 500);
  }
});
