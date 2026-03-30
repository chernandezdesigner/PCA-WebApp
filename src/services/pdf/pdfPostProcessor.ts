import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { AppendixData, AppendixFileEntry, AppendixBPhotoEntry } from './pdfGenerationService';

// Brand navy: #0C306C
const NAVY = rgb(0.047, 0.188, 0.424);

export interface PostProcessOptions {
  projectNumber?: string;
  propertyName?: string;
  cityStateZip?: string;
  logoUrl?: string;
  appendixData?: AppendixData;
}

type EmbeddedFont = Awaited<ReturnType<PDFDocument['embedFont']>>;

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Shared footer (used on all appendix pages)
// Format: PROPERTY CONDITION ASSESSMENT  |  {pageNum}  |  NDDS PROJECT {num}
// ---------------------------------------------------------------------------

function addPageFooter(
  page: PDFPage,
  pageNum: number,
  projectNumber: string,
  font: EmbeddedFont,
  boldFont: EmbeddedFont,
): void {
  const left = 'PROPERTY CONDITION ASSESSMENT';
  const right = `NDDS PROJECT ${projectNumber}`;
  const center = String(pageNum);

  page.drawLine({ start: { x: 36, y: 44 }, end: { x: 576, y: 44 }, thickness: 0.5, color: NAVY });
  page.drawText(left, { x: 36, y: 30, size: 8, font: boldFont, color: NAVY });
  const cw = boldFont.widthOfTextAtSize(center, 9);
  page.drawText(center, { x: (612 - cw) / 2, y: 30, size: 9, font: boldFont, color: NAVY });
  const rw = boldFont.widthOfTextAtSize(right, 8);
  page.drawText(right, { x: 576 - rw, y: 30, size: 8, font: boldFont, color: NAVY });
}

// ---------------------------------------------------------------------------
// Appendix section cover page — white, black centered bold text, footer
// ---------------------------------------------------------------------------

async function addCoverPage(
  pdfDoc: PDFDocument,
  label: string,
  title: string,
  font: EmbeddedFont,
  boldFont: EmbeddedFont,
  projectNumber: string,
): Promise<void> {
  const pageNum = pdfDoc.getPageCount() + 1;
  const page = pdfDoc.addPage([612, 792]);

  const labelW = boldFont.widthOfTextAtSize(label, 24);
  page.drawText(label, { x: (612 - labelW) / 2, y: 420, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  const titleW = boldFont.widthOfTextAtSize(title, 14);
  page.drawText(title, { x: (612 - titleW) / 2, y: 393, size: 14, font: boldFont, color: rgb(0, 0, 0) });

  addPageFooter(page, pageNum, projectNumber, font, boldFont);
}

// ---------------------------------------------------------------------------
// Full-page image (appendix A/C/D/E images) — centered, with footer
// ---------------------------------------------------------------------------

async function addImagePage(pdfDoc: PDFDocument, bytes: Uint8Array): Promise<void> {
  const page = pdfDoc.addPage([612, 792]);
  const image = isPng(bytes) ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

  // Full-page: 36pt margin on all sides, no footer
  const maxW = 540, maxH = 720;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * scale, h = image.height * scale;
  page.drawImage(image, { x: (612 - w) / 2, y: (792 - h) / 2, width: w, height: h });
}

// ---------------------------------------------------------------------------
// PDF pages — copied as-is (landscape preserved, no footer added)
// ---------------------------------------------------------------------------

async function addPdfPages(pdfDoc: PDFDocument, bytes: Uint8Array): Promise<void> {
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  pages.forEach(p => pdfDoc.addPage(p));
}

// ---------------------------------------------------------------------------
// Route a single file entry to image page or PDF pages
// ---------------------------------------------------------------------------

async function addFilePage(pdfDoc: PDFDocument, entry: AppendixFileEntry): Promise<void> {
  const bytes = await fetchFileBytes(entry.url);
  if (!bytes) return;
  if (entry.mimeType === 'application/pdf') {
    await addPdfPages(pdfDoc, bytes);
  } else {
    await addImagePage(pdfDoc, bytes);
  }
}

// ---------------------------------------------------------------------------
// Appendix B — 2×6 photo grid with logo header, gray cell borders, footer
//
// Layout (letter 612×792 pt):
//   Header:  y 732–792  (60pt) — logo centered
//   Grid:    y 57–728   (671pt) — 6 rows × ~111pt per row
//   Footer:  y 0–56     (56pt) — line + text
//
// Per row:  cell 101pt tall + 10pt gap = 111pt
// Per cell: 3pt top pad | 78pt photo | 3pt gap | 14pt caption | 3pt bottom pad
// Per col:  282pt wide (COL_GAP 8pt, LEFT_MARGIN 20pt each side)
// ---------------------------------------------------------------------------

const GRID_TOP = 728;
const ROW_TOTAL = 111;
const CELL_H = 101;
const PHOTO_H = 78;
const CELL_PAD = 3;
const CAPTION_H = 14;
const COL_W = 282;
const COL_GAP = 8;
const L_MARGIN = 20;

async function addAppendixBGrid(
  pdfDoc: PDFDocument,
  photos: AppendixBPhotoEntry[],
  logoUrl: string,
  propertyName: string,
  cityStateZip: string,
  projectNumber: string,
  font: EmbeddedFont,
  boldFont: EmbeddedFont,
): Promise<void> {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const PHOTOS_PER_PAGE = 12;

  // Pre-fetch logo once for all pages
  let logoBytes: Uint8Array | null = null;
  if (logoUrl) logoBytes = await fetchFileBytes(logoUrl);

  for (let pageIdx = 0; pageIdx * PHOTOS_PER_PAGE < sorted.length; pageIdx++) {
    const batch = sorted.slice(pageIdx * PHOTOS_PER_PAGE, (pageIdx + 1) * PHOTOS_PER_PAGE);
    const startNum = pageIdx * PHOTOS_PER_PAGE + 1;
    const pageNum = pdfDoc.getPageCount() + 1;
    const page = pdfDoc.addPage([612, 792]);

    // --- Logo header ---
    if (logoBytes) {
      try {
        const logo = isPng(logoBytes) ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
        const logoMaxW = 180, logoMaxH = 48;
        const ls = Math.min(logoMaxW / logo.width, logoMaxH / logo.height);
        const lw = logo.width * ls, lh = logo.height * ls;
        page.drawImage(logo, { x: (612 - lw) / 2, y: 792 - 8 - lh, width: lw, height: lh });
      } catch { /* skip */ }
    }

    // --- Photo grid ---
    for (let i = 0; i < batch.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);

      // Cell anchor: bottom-left of the cell border box
      const cellX = L_MARGIN + col * (COL_W + COL_GAP);
      const cellY = GRID_TOP - (row * ROW_TOTAL) - CELL_H;

      // Gray border around entire cell (photo + caption)
      page.drawRectangle({
        x: cellX,
        y: cellY,
        width: COL_W,
        height: CELL_H,
        borderColor: rgb(0.78, 0.78, 0.78),
        borderWidth: 0.75,
      });

      // Photo area sits at top of cell (below top padding)
      const photoAreaX = cellX + CELL_PAD;
      const photoAreaW = COL_W - CELL_PAD * 2;
      const photoAreaY = cellY + CELL_PAD + CAPTION_H + CELL_PAD; // bottom of photo area
      // = cellY + 3 + 14 + 3 = cellY + 20

      const photoBytes = await fetchFileBytes(batch[i].url);
      if (photoBytes) {
        try {
          const img = isPng(photoBytes) ? await pdfDoc.embedPng(photoBytes) : await pdfDoc.embedJpg(photoBytes);
          const s = Math.min(photoAreaW / img.width, PHOTO_H / img.height);
          const pw = img.width * s, ph = img.height * s;
          page.drawImage(img, {
            x: photoAreaX + (photoAreaW - pw) / 2,
            y: photoAreaY + (PHOTO_H - ph) / 2,
            width: pw,
            height: ph,
          });
        } catch { /* skip */ }
      }

      // Caption inside cell at bottom
      const caption = `${startNum + i}.  ${batch[i].notes || ''}`;
      page.drawText(caption.substring(0, 54), {
        x: cellX + CELL_PAD + 2,
        y: cellY + CELL_PAD + 3,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
    }

    // --- Footer ---
    const leftText = propertyName + (cityStateZip ? `  ${cityStateZip}` : '');
    const rightText = `NDDS PROJECT ${projectNumber}`;
    const pageNumStr = String(pageNum);
    page.drawLine({ start: { x: 36, y: 44 }, end: { x: 576, y: 44 }, thickness: 0.5, color: NAVY });
    page.drawText(leftText, { x: 36, y: 30, size: 8, font: boldFont, color: NAVY });
    const cw = boldFont.widthOfTextAtSize(pageNumStr, 9);
    page.drawText(pageNumStr, { x: (612 - cw) / 2, y: 30, size: 9, font: boldFont, color: NAVY });
    const rw = boldFont.widthOfTextAtSize(rightText, 8);
    page.drawText(rightText, { x: 576 - rw, y: 30, size: 8, font: boldFont, color: NAVY });
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

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
    await addCoverPage(pdfDoc, 'APPENDIX A', 'PROPERTY MAPS, DRAWINGS, AND DESCRIPTION', font, boldFont, projectNumber);
    for (const f of appendixData.aFiles) await addFilePage(pdfDoc, f);

    // Appendix B
    await addCoverPage(pdfDoc, 'APPENDIX B', 'PROPERTY PHOTOGRAPHS', font, boldFont, projectNumber);
    if (appendixData.bPhotos.length > 0) {
      await addAppendixBGrid(pdfDoc, appendixData.bPhotos, logoUrl, propertyName, cityStateZip, projectNumber, font, boldFont);
    }

    // Appendix C
    await addCoverPage(pdfDoc, 'APPENDIX C', 'INTERVIEW/QUESTIONNAIRE DOCUMENTATION/CORRESPONDENCE', font, boldFont, projectNumber);
    for (const f of appendixData.cFiles) await addFilePage(pdfDoc, f, font, boldFont, projectNumber);

    // Appendix D
    await addCoverPage(pdfDoc, 'APPENDIX D', 'SUPPORTING DOCUMENTS', font, boldFont, projectNumber);
    for (const f of appendixData.dFiles) await addFilePage(pdfDoc, f, font, boldFont, projectNumber);

    // Appendix E
    await addCoverPage(pdfDoc, 'APPENDIX E', 'PERSONAL QUALIFICATIONS', font, boldFont, projectNumber);
    for (const f of appendixData.eFiles) await addFilePage(pdfDoc, f, font, boldFont, projectNumber);
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
