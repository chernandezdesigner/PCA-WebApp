import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '@/services/supabase';

const FOOTER_FONT_SIZE = 9;
const FOOTER_COLOR = rgb(0.047, 0.188, 0.424); // #0C306C

export interface PostProcessOptions {
  skipPageNumberPages?: number[];
  appendices?: AppendixItem[];
  projectNumber?: string;
}

export interface AppendixItem {
  label: string;
  title: string;
  files: AppendixFile[];
}

export interface AppendixFile {
  storagePath: string;
  type: 'image' | 'pdf';
  caption?: string;
}

async function fetchPdfFromUrl(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function fetchFileFromStorage(bucket: string, path: string): Promise<Uint8Array> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Failed to download ${path}: ${error?.message}`);
  return new Uint8Array(await data.arrayBuffer());
}

export async function postProcessPdf(
  basePdfUrl: string,
  options: PostProcessOptions = {},
): Promise<Uint8Array> {
  const basePdfBytes = await fetchPdfFromUrl(basePdfUrl);
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const skipPages = new Set(options.skipPageNumberPages ?? [0]);

  // Append exhibit pages
  if (options.appendices) {
    for (const appendix of options.appendices) {
      // Create appendix cover page
      const coverPage = pdfDoc.addPage([612, 792]); // Letter size
      const coverTitle = `${appendix.label}`;
      const coverSubtitle = appendix.title;

      const titleWidth = font.widthOfTextAtSize(coverTitle, 24);
      const subtitleWidth = font.widthOfTextAtSize(coverSubtitle, 16);

      coverPage.drawText(coverTitle, {
        x: (612 - titleWidth) / 2,
        y: 500,
        size: 24,
        font,
        color: FOOTER_COLOR,
      });
      coverPage.drawText(coverSubtitle, {
        x: (612 - subtitleWidth) / 2,
        y: 460,
        size: 16,
        font,
        color: FOOTER_COLOR,
      });

      // Mark cover page to skip page numbering
      skipPages.add(pdfDoc.getPageCount() - 1);

      // Append files
      for (const file of appendix.files) {
        try {
          const fileBytes = await fetchFileFromStorage('report-assets', file.storagePath);

          if (file.type === 'pdf') {
            const externalPdf = await PDFDocument.load(fileBytes);
            const copiedPages = await pdfDoc.copyPages(externalPdf, externalPdf.getPageIndices());
            for (const page of copiedPages) {
              pdfDoc.addPage(page);
            }
          } else if (file.type === 'image') {
            let image;
            if (file.storagePath.toLowerCase().endsWith('.png')) {
              image = await pdfDoc.embedPng(fileBytes);
            } else {
              image = await pdfDoc.embedJpg(fileBytes);
            }

            const page = pdfDoc.addPage([612, 792]);
            const maxWidth = 540;
            const maxHeight = 680;

            let drawWidth = image.width;
            let drawHeight = image.height;

            if (drawWidth > maxWidth) {
              const ratio = maxWidth / drawWidth;
              drawWidth = maxWidth;
              drawHeight *= ratio;
            }
            if (drawHeight > maxHeight) {
              const ratio = maxHeight / drawHeight;
              drawHeight = maxHeight;
              drawWidth *= ratio;
            }

            page.drawImage(image, {
              x: (612 - drawWidth) / 2,
              y: 792 - 56 - drawHeight,
              width: drawWidth,
              height: drawHeight,
            });

            if (file.caption) {
              const captionWidth = font.widthOfTextAtSize(file.caption, 10);
              page.drawText(file.caption, {
                x: (612 - captionWidth) / 2,
                y: 792 - 56 - drawHeight - 20,
                size: 10,
                font,
                color: rgb(0.3, 0.3, 0.3),
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to append file ${file.storagePath}:`, err);
        }
      }
    }
  }

  // Stamp page numbers on all non-skipped pages
  const totalPages = pdfDoc.getPageCount();
  const countablePages = totalPages - skipPages.size;
  let pageNum = 0;

  for (let i = 0; i < totalPages; i++) {
    if (skipPages.has(i)) continue;
    pageNum++;

    const page = pdfDoc.getPage(i);
    const { width } = page.getSize();
    const text = `Page ${pageNum} of ${countablePages}`;
    const textWidth = font.widthOfTextAtSize(text, FOOTER_FONT_SIZE);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 30,
      size: FOOTER_FONT_SIZE,
      font,
      color: FOOTER_COLOR,
    });
  }

  return pdfDoc.save();
}

export function triggerDownload(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
