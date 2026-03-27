import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { AppendixData, AppendixFileEntry, AppendixBPhotoEntry } from './pdfGenerationService';

export interface PostProcessOptions {
  projectNumber?: string;
  propertyName?: string;
  cityStateZip?: string;
  logoUrl?: string;
  appendixData?: AppendixData;
}

async function fetchPdfFromUrl(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function fetchFileBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function isPng(bytes: Uint8Array): boolean {
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

async function addBlackCoverPage(
  pdfDoc: PDFDocument,
  label: string,
  title: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  boldFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
): Promise<void> {
  const page = pdfDoc.addPage([612, 792]);
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(0, 0, 0) });
  const labelW = boldFont.widthOfTextAtSize(label, 28);
  page.drawText(label, { x: (612 - labelW) / 2, y: 420, size: 28, font: boldFont, color: rgb(1, 1, 1) });
  const titleW = boldFont.widthOfTextAtSize(title, 16);
  page.drawText(title, { x: (612 - titleW) / 2, y: 380, size: 16, font: boldFont, color: rgb(1, 1, 1) });
}

async function addImagePage(pdfDoc: PDFDocument, bytes: Uint8Array): Promise<void> {
  const page = pdfDoc.addPage([612, 792]);
  const image = isPng(bytes) ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
  const maxW = 562, maxH = 712;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * scale, h = image.height * scale;
  page.drawImage(image, { x: (612 - w) / 2, y: (792 - h) / 2, width: w, height: h });
}

async function addPdfPages(pdfDoc: PDFDocument, bytes: Uint8Array): Promise<void> {
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  pages.forEach(p => pdfDoc.addPage(p));
}

async function addFilePage(pdfDoc: PDFDocument, entry: AppendixFileEntry): Promise<void> {
  const bytes = await fetchFileBytes(entry.url);
  if (!bytes) return;
  if (entry.mimeType === 'application/pdf') {
    await addPdfPages(pdfDoc, bytes);
  } else {
    await addImagePage(pdfDoc, bytes);
  }
}

async function addAppendixBGrid(
  pdfDoc: PDFDocument,
  photos: AppendixBPhotoEntry[],
  logoUrl: string,
  propertyName: string,
  cityStateZip: string,
  projectNumber: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  boldFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
): Promise<void> {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const PHOTOS_PER_PAGE = 12;

  // Pre-fetch logo once
  let logoBytes: Uint8Array | null = null;
  if (logoUrl) logoBytes = await fetchFileBytes(logoUrl);

  for (let pageIdx = 0; pageIdx * PHOTOS_PER_PAGE < sorted.length; pageIdx++) {
    const batch = sorted.slice(pageIdx * PHOTOS_PER_PAGE, (pageIdx + 1) * PHOTOS_PER_PAGE);
    const startNum = pageIdx * PHOTOS_PER_PAGE + 1;
    const page = pdfDoc.addPage([612, 792]);

    // Logo header (centered, max 200×45)
    if (logoBytes) {
      try {
        const logo = isPng(logoBytes) ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
        const logoMaxW = 200, logoMaxH = 45;
        const logoScale = Math.min(logoMaxW / logo.width, logoMaxH / logo.height);
        const lw = logo.width * logoScale, lh = logo.height * logoScale;
        page.drawImage(logo, { x: (612 - lw) / 2, y: 792 - 20 - lh, width: lw, height: lh });
      } catch {
        // skip logo if embed fails
      }
    }

    // Photo grid: 2 cols × 6 rows, 12 photos per page
    // Working area: y from 75 (below header) to 45 (above footer) = 660pt / 6 rows = 110pt per row
    // Photo height = 88pt, caption = 14pt, row gap = 8pt
    // Col width = 282pt, col gap = 8pt, left margin = 20pt
    for (let i = 0; i < batch.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 20 + col * (282 + 8);
      const photoTop = 792 - 75 - row * (88 + 14 + 8);
      const photoY = photoTop - 88; // bottom of photo box

      const photoBytes = await fetchFileBytes(batch[i].url);
      if (photoBytes) {
        try {
          const img = isPng(photoBytes) ? await pdfDoc.embedPng(photoBytes) : await pdfDoc.embedJpg(photoBytes);
          const scale = Math.min(282 / img.width, 88 / img.height);
          const pw = img.width * scale, ph = img.height * scale;
          page.drawImage(img, {
            x: x + (282 - pw) / 2,
            y: photoY + (88 - ph) / 2,
            width: pw,
            height: ph,
          });
        } catch {
          // skip photo if embed fails
        }
      }

      // Caption below photo
      const caption = `${startNum + i}. ${batch[i].notes || ''}`;
      page.drawText(caption.substring(0, 55), {
        x,
        y: photoY - 13,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
    }

    // Footer line + text
    page.drawLine({ start: { x: 20, y: 38 }, end: { x: 592, y: 38 }, thickness: 0.5, color: rgb(0, 0, 0) });
    const leftText = `${propertyName}${cityStateZip ? `  ${cityStateZip}` : ''}`;
    const rightText = `NDDS PROJECT ${projectNumber}`;
    page.drawText(leftText, { x: 20, y: 26, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    const rightW = boldFont.widthOfTextAtSize(rightText, 8);
    page.drawText(rightText, { x: 592 - rightW, y: 26, size: 8, font: boldFont, color: rgb(0, 0, 0) });
  }
}

export async function postProcessPdf(
  basePdfUrl: string,
  options: PostProcessOptions = {},
): Promise<Uint8Array> {
  const {
    appendixData,
    projectNumber = '',
    propertyName = '',
    cityStateZip = '',
    logoUrl = '',
  } = options;

  const basePdfBytes = await fetchPdfFromUrl(basePdfUrl);
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (appendixData) {
    // Appendix A
    await addBlackCoverPage(pdfDoc, 'APPENDIX A', 'PROPERTY MAPS, DRAWINGS, AND DESCRIPTION', font, boldFont);
    for (const f of appendixData.aFiles) await addFilePage(pdfDoc, f);

    // Appendix B
    await addBlackCoverPage(pdfDoc, 'APPENDIX B', 'PROPERTY PHOTOGRAPHS', font, boldFont);
    if (appendixData.bPhotos.length > 0) {
      await addAppendixBGrid(pdfDoc, appendixData.bPhotos, logoUrl, propertyName, cityStateZip, projectNumber, font, boldFont);
    }

    // Appendix C
    await addBlackCoverPage(pdfDoc, 'APPENDIX C', 'INTERVIEW/QUESTIONNAIRE DOCUMENTATION/CORRESPONDENCE', font, boldFont);
    for (const f of appendixData.cFiles) await addFilePage(pdfDoc, f);

    // Appendix D
    await addBlackCoverPage(pdfDoc, 'APPENDIX D', 'SUPPORTING DOCUMENTS', font, boldFont);
    for (const f of appendixData.dFiles) await addFilePage(pdfDoc, f);

    // Appendix E
    await addBlackCoverPage(pdfDoc, 'APPENDIX E', 'PERSONAL QUALIFICATIONS', font, boldFont);
    for (const f of appendixData.eFiles) await addFilePage(pdfDoc, f);
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
