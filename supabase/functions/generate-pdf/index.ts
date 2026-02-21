import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';

const DOCRAPTOR_API_KEY = Deno.env.get('DOCRAPTOR_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const FONT_FILES: Record<string, { family: string; weight: string; style: string }> = {
  'CALIBRI.TTF':  { family: 'Calibri', weight: 'normal', style: 'normal' },
  'CALIBRIB.TTF': { family: 'Calibri', weight: 'bold',   style: 'normal' },
  'CALIBRII.TTF': { family: 'Calibri', weight: 'normal', style: 'italic' },
  'ARIAL.TTF':    { family: 'Arial',   weight: 'normal', style: 'normal' },
  'ARIALBD.TTF':  { family: 'Arial',   weight: 'bold',   style: 'normal' },
};

async function loadFontsAsBase64(supabase: ReturnType<typeof createClient>): Promise<string> {
  const declarations: string[] = [];

  for (const [filename, meta] of Object.entries(FONT_FILES)) {
    try {
      const { data, error } = await supabase.storage
        .from('fonts')
        .download(filename);

      if (error || !data) {
        console.warn(`Font ${filename} not found in storage, skipping:`, error?.message);
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { reportId, html } = await req.json();

    if (!reportId || !html) {
      return new Response(
        JSON.stringify({ error: 'reportId and html are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load fonts and inject into HTML
    const fontCss = await loadFontsAsBase64(supabase);
    const finalHtml = html.replace('/* FONT_PLACEHOLDER */', fontCss);

    // Call DocRaptor API
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
        prince_options: {
          media: 'print',
          baseurl: SUPABASE_URL,
        },
      }),
    });

    if (!docRaptorResponse.ok) {
      const errorText = await docRaptorResponse.text();
      console.error('DocRaptor error:', errorText);
      return new Response(
        JSON.stringify({ error: 'DocRaptor PDF generation failed', details: errorText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const pdfBuffer = await docRaptorResponse.arrayBuffer();
    const pdfPath = `${reportId}/base.pdf`;

    // Store PDF in Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('report-pdfs')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to store PDF', details: uploadError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Update reports table
    await supabase
      .from('reports')
      .update({
        pdf_generated_at: new Date().toISOString(),
        pdf_storage_path: `report-pdfs/${pdfPath}`,
      })
      .eq('id', reportId);

    // Generate signed URL for download (1 hour expiry)
    const { data: signedUrlData } = await supabase.storage
      .from('report-pdfs')
      .createSignedUrl(pdfPath, 3600);

    return new Response(
      JSON.stringify({
        pdfUrl: signedUrlData?.signedUrl ?? null,
        storagePath: `report-pdfs/${pdfPath}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err) {
    console.error('generate-pdf error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
