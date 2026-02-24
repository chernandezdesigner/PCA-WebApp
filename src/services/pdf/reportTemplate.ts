import type { SectionConfig, FieldConfig } from '@/types/section';
import type { ReportContentRow, SectionData } from '@/types/database';
import { propertyConditionSummary } from '@/data/templates/group2';

import {
  accessEgress,
  pavingCurbingParking,
  flatwork,
  landscapingAppurtenances,
  ancillaryStructures,
  foundation,
  buildingFrame,
  facadesCurtainWall,
  roofing,
  heatingAndCooling,
  electrical,
  plumbing,
  elevatorsAndEscalators,
  commonAreas,
  tenantSpaces,
  sprinklersAndStandpipes,
  alarmSystems,
  naturalHazards,
  microbialContamination,
} from '@/data/templates/group1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportMeta {
  projectNumber: string;
  clientName: string;
  clientContactName: string;
  clientAddress: string;
  clientCityStateZip: string;
  dateIssued: string;
  preparedBy: string;
  preparedByTitle: string;
  reviewedBy: string;
  reviewedByTitle: string;
  coverPhotoUrl?: string;
  logoUrl?: string;
}

interface StepData {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Step-to-section mapping (mirrors useWebReportForm)
// ---------------------------------------------------------------------------

const STEP_TO_SECTION: Record<number, keyof ReportContentRow> = {
  1: 'section_1_summary', 2: 'section_1_summary', 3: 'section_1_summary', 4: 'section_1_summary', 5: 'section_1_summary', 6: 'section_1_summary',
  7: 'section_2_introduction',
  8: 'section_3_property', 9: 'section_3_property', 10: 'section_3_property',
  11: 'section_4_documents', 12: 'section_4_documents', 13: 'section_4_documents', 14: 'section_4_documents', 15: 'section_4_documents',
  16: 'section_5_site_grounds', 17: 'section_5_site_grounds', 18: 'section_5_site_grounds', 19: 'section_5_site_grounds', 20: 'section_5_site_grounds',
  21: 'section_6_building_envelope', 22: 'section_6_building_envelope', 23: 'section_6_building_envelope', 24: 'section_6_building_envelope',
  25: 'section_7_mechanical', 26: 'section_7_mechanical', 27: 'section_7_mechanical', 28: 'section_7_mechanical',
  29: 'section_8_interior', 30: 'section_8_interior',
  31: 'section_9_fire_protection', 32: 'section_9_fire_protection',
  33: 'section_10_additional', 34: 'section_10_additional', 35: 'section_10_additional',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br>');
}

function getStepData(content: ReportContentRow, stepNum: number): StepData {
  const sectionKey = STEP_TO_SECTION[stepNum];
  if (!sectionKey) return {};
  const section = content[sectionKey] as SectionData | null;
  if (!section) return {};
  const stepData = section[`step_${stepNum}`];
  return (stepData as StepData) ?? {};
}

function getVal(content: ReportContentRow, step: number, block: string, fieldId: string): string {
  const sd = getStepData(content, step);
  const blockData = sd[block] as Record<string, unknown> | undefined;
  if (!blockData) return '';
  const val = blockData[fieldId];
  if (typeof val === 'string') return val;
  return '';
}

function v(content: ReportContentRow, step: number, block: string, fieldId: string): string {
  return nl2br(getVal(content, step, block, fieldId));
}

function vRaw(content: ReportContentRow, step: number, block: string, fieldId: string): string {
  return escapeHtml(getVal(content, step, block, fieldId));
}

// For property-info style sections (group2), data is stored under 'fields' block
function pv(content: ReportContentRow, step: number, fieldId: string): string {
  return nl2br(getVal(content, step, 'fields', fieldId));
}

function pvRaw(content: ReportContentRow, step: number, fieldId: string): string {
  return escapeHtml(getVal(content, step, 'fields', fieldId));
}

// ---------------------------------------------------------------------------
// Property Condition Summary renderer
// ---------------------------------------------------------------------------

function buildConditionSummaryRows(content: ReportContentRow): string {
  const sd = getStepData(content, 5);
  const fields = (sd['fields'] ?? sd) as Record<string, unknown>;

  return propertyConditionSummary.rows.map((row: { id: string; label: string }) => {
    const cond = (fields[`${row.id}-condition`] as string) || '';
    const action = (fields[`${row.id}-action`] as string) || '';
    const good = cond === 'Good' ? 'X' : '';
    const fair = cond === 'Fair' ? 'X' : '';
    const poor = cond === 'Poor' ? 'X' : '';
    return `<tr>
      <td class="pcs-sys">${row.id.replace('-', '.')} ${escapeHtml(row.label)}</td>
      <td class="pcs-x">${good}</td>
      <td class="pcs-x">${fair}</td>
      <td class="pcs-x">${poor}</td>
      <td class="pcs-action">${escapeHtml(action)}</td>
    </tr>`;
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Cost Opinion Table renderer
// ---------------------------------------------------------------------------

function buildCostOpinionTable(content: ReportContentRow): {
  deficiencyRows: string;
  immTotal: string;
  stTotal: string;
  grandTotal: string;
  reserveTerm: string;
  totalUninflated: string;
  annualUninflated: string;
  totalInflated: string;
  annualInflated: string;
} {
  const sd = getStepData(content, 6);
  const fields = (sd['fields'] ?? sd) as Record<string, unknown>;

  const count = parseInt((fields['_deficiency_count'] as string) || '0');
  let immSum = 0;
  let stSum = 0;
  let rowsHtml = '';

  for (let i = 1; i <= count; i++) {
    const item = escapeHtml((fields[`def-row-${i}-item`] as string) || '');
    const immRaw = (fields[`def-row-${i}-immediate-cost`] as string) || '';
    const stRaw = (fields[`def-row-${i}-short-term-cost`] as string) || '';
    const immVal = parseFloat(immRaw.replace(/[^0-9.-]/g, '')) || 0;
    const stVal = parseFloat(stRaw.replace(/[^0-9.-]/g, '')) || 0;
    immSum += immVal;
    stSum += stVal;
    if (item || immRaw || stRaw) {
      rowsHtml += `<tr><td>${item}</td><td class="cost-val">${immRaw ? escapeHtml(immRaw) : ''}</td><td class="cost-val">${stRaw ? escapeHtml(stRaw) : ''}</td></tr>\n`;
    }
  }

  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="3" style="text-align:center; font-style:italic; color:#999;">No deficiency items identified</td></tr>\n';
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return {
    deficiencyRows: rowsHtml,
    immTotal: fmt(immSum),
    stTotal: fmt(stSum),
    grandTotal: fmt(immSum + stSum),
    reserveTerm: '12-Year',
    totalUninflated: escapeHtml((fields['total-uninflated-reserve'] as string) || '$'),
    annualUninflated: escapeHtml((fields['annual-uninflated-cost-per-sf'] as string) || '$'),
    totalInflated: escapeHtml((fields['total-inflated-reserve'] as string) || '$'),
    annualInflated: escapeHtml((fields['annual-inflated-cost-per-sf'] as string) || '$'),
  };
}

// ---------------------------------------------------------------------------
// D/O/C/R Section Renderer (sections 5-10)
// ---------------------------------------------------------------------------

function renderDOCRSection(
  sectionId: string,
  sectionNumber: string,
  sectionTitle: string,
  config: SectionConfig,
  content: ReportContentRow,
  stepNum: number,
): string {
  const blocks: Array<{ key: string; label: string; fields?: FieldConfig[] }> = [
    { key: 'description', label: 'Description', fields: config.description },
    { key: 'observations', label: 'Observations/Comments', fields: config.observations },
    { key: 'concerns', label: 'Concerns', fields: config.concerns },
    { key: 'recommendations', label: 'Recommendations', fields: config.recommendations },
  ];

  let html = `<h3 id="${sectionId}">${sectionNumber}\u00A0\u00A0\u00A0${escapeHtml(sectionTitle)}</h3>\n`;
  html += `<table class="docr-table">\n`;

  for (const block of blocks) {
    if (!block.fields || block.fields.length === 0) continue;

    html += `<tr class="block-header"><td colspan="2"><em>${escapeHtml(block.label)}</em></td></tr>\n`;

    for (const field of block.fields) {
      if (field.type === 'conditional') continue;

      const value = v(content, stepNum, block.key, field.id);
      const displayValue = value || '<span class="placeholder">—</span>';

      if (block.key === 'recommendations') {
        html += `<tr><td colspan="2" class="field-value">${displayValue}</td></tr>\n`;
      } else {
        const label = ('label' in field ? field.label : field.id).toUpperCase();
        html += `<tr>`;
        html += `<td class="field-label">${escapeHtml(label)}</td>`;
        html += `<td class="field-value">${displayValue}</td>`;
        html += `</tr>\n`;
      }
    }
  }

  html += `</table>\n`;

  return html;
}

// ---------------------------------------------------------------------------
// TOC Builder
// ---------------------------------------------------------------------------

interface TocItem {
  label: string;
  href: string;
  level: number;
}

function buildToc(items: TocItem[]): string {
  let html = `<div class="toc-page">
  <div class="toc-title">Table of Contents</div>\n`;

  for (const item of items) {
    html += `  <div class="toc-line">
    <a href="#${item.href}" class="toc-link toc-level-${item.level}">${item.label}</a>
  </div>\n`;
  }

  html += `</div>\n`;
  return html;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export function assembleReportHtml(
  content: ReportContentRow,
  meta: ReportMeta,
): string {
  const projectNum = escapeHtml(meta.projectNumber || '25XXXXXXX');
  const propertyName = pvRaw(content, 1, 'property-name') || 'Subject Property';
  const propertyAddress = pvRaw(content, 1, 'property-address') || '';
  const city = pvRaw(content, 1, 'city') || '';
  const state = pvRaw(content, 1, 'state') || '';
  const zip = pvRaw(content, 1, 'zip') || '';
  const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');
  const clientName = escapeHtml(meta.clientName || 'Client');
  const dateIssued = escapeHtml(meta.dateIssued || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const logoUrl = meta.logoUrl || 'https://firebasestorage.googleapis.com/v0/b/ndds-report-generator-version2.firebasestorage.app/o/Logo%2FASMLogoBlue.png?alt=media&token=31cf6b22-14d2-4a81-b699-7e9752c70748';

  // ----- TOC Items -----
  const tocItems: TocItem[] = [
    { label: '1.0&nbsp;&nbsp;SUMMARY', href: 'section-1-0', level: 1 },
    { label: '1.1&nbsp;&nbsp;General Description', href: 'section-1-1', level: 2 },
    { label: '1.2&nbsp;&nbsp;General Physical Condition', href: 'section-1-2', level: 2 },
    { label: '1.3&nbsp;&nbsp;Opinion of Probable Cost', href: 'section-1-3', level: 2 },
    { label: '1.4&nbsp;&nbsp;Deviations from the ASTM Guidelines', href: 'section-1-4', level: 2 },
    { label: '1.5&nbsp;&nbsp;Recommendations', href: 'section-1-5', level: 2 },
    { label: '2.0&nbsp;&nbsp;INTRODUCTION', href: 'section-2-0', level: 1 },
    { label: '2.1&nbsp;&nbsp;Purpose', href: 'section-2-1', level: 2 },
    { label: '2.2&nbsp;&nbsp;Scope of Work', href: 'section-2-2', level: 2 },
    { label: '2.3&nbsp;&nbsp;Limitations and Exceptions', href: 'section-2-3', level: 2 },
    { label: '2.4&nbsp;&nbsp;General Property Reconnaissance Information', href: 'section-2-4', level: 2 },
    { label: '2.5&nbsp;&nbsp;User Reliance', href: 'section-2-5', level: 2 },
    { label: '3.0&nbsp;&nbsp;PROPERTY CHARACTERISTICS', href: 'section-3-0', level: 1 },
    { label: '3.1&nbsp;&nbsp;Location and Description', href: 'section-3-1', level: 2 },
    { label: '3.2&nbsp;&nbsp;Tenant and Lease Information', href: 'section-3-2', level: 2 },
    { label: '3.3&nbsp;&nbsp;Utility and Service Providers', href: 'section-3-3', level: 2 },
    { label: '4.0&nbsp;&nbsp;DOCUMENT REVIEW AND INTERVIEWS', href: 'section-4-0', level: 1 },
    { label: '4.1&nbsp;&nbsp;Property Questionnaire', href: 'section-4-1', level: 2 },
    { label: '4.2&nbsp;&nbsp;Interviews', href: 'section-4-2', level: 2 },
    { label: '4.3&nbsp;&nbsp;Building and Fire Departments', href: 'section-4-3', level: 2 },
    { label: '4.4&nbsp;&nbsp;Zoning Department', href: 'section-4-4', level: 2 },
    { label: '4.5&nbsp;&nbsp;Previous Reports', href: 'section-4-5', level: 2 },
    { label: '5.0&nbsp;&nbsp;SITE', href: 'section-5-0', level: 1 },
    { label: '5.1&nbsp;&nbsp;Topography and Stormwater Drainage', href: 'section-5-1', level: 2 },
    { label: '5.2&nbsp;&nbsp;Access and Egress', href: 'section-5-2', level: 2 },
    { label: '5.3&nbsp;&nbsp;Paving, Curbing and Parking', href: 'section-5-3', level: 2 },
    { label: '5.4&nbsp;&nbsp;Flatwork', href: 'section-5-4', level: 2 },
    { label: '5.5&nbsp;&nbsp;Landscaping and Appurtenances', href: 'section-5-5', level: 2 },
    { label: '5.6&nbsp;&nbsp;Ancillary Structures', href: 'section-5-6', level: 2 },
    { label: '6.0&nbsp;&nbsp;STRUCTURAL FRAME AND BUILDING ENVELOPE', href: 'section-6-0', level: 1 },
    { label: '6.1&nbsp;&nbsp;Foundation', href: 'section-6-1', level: 2 },
    { label: '6.2&nbsp;&nbsp;Building Frame', href: 'section-6-2', level: 2 },
    { label: '6.3&nbsp;&nbsp;Facades or Curtain Wall', href: 'section-6-3', level: 2 },
    { label: '6.4&nbsp;&nbsp;Roofing', href: 'section-6-4', level: 2 },
    { label: '7.0&nbsp;&nbsp;MECHANICAL, ELECTRICAL, AND PLUMBING SYSTEM', href: 'section-7-0', level: 1 },
    { label: '7.1&nbsp;&nbsp;Heating, Ventilation and Air Conditioning', href: 'section-7-1', level: 2 },
    { label: '7.2&nbsp;&nbsp;Electrical', href: 'section-7-2', level: 2 },
    { label: '7.3&nbsp;&nbsp;Plumbing', href: 'section-7-3', level: 2 },
    { label: '7.4&nbsp;&nbsp;Elevators and Escalators', href: 'section-7-4', level: 2 },
    { label: '8.0&nbsp;&nbsp;INTERIOR ELEMENTS', href: 'section-8-0', level: 1 },
    { label: '8.1&nbsp;&nbsp;Common Areas', href: 'section-8-1', level: 2 },
    { label: '8.2&nbsp;&nbsp;Tenant Spaces', href: 'section-8-2', level: 2 },
    { label: '9.0&nbsp;&nbsp;LIFE SAFETY/FIRE PROTECTION', href: 'section-9-0', level: 1 },
    { label: '9.1&nbsp;&nbsp;Sprinklers and Standpipes', href: 'section-9-1', level: 2 },
    { label: '9.2&nbsp;&nbsp;Alarm Systems', href: 'section-9-2', level: 2 },
    { label: '10.0&nbsp;&nbsp;ADDITIONAL CONSIDERATIONS', href: 'section-10-0', level: 1 },
    { label: '10.1&nbsp;&nbsp;Natural Hazards', href: 'section-10-1', level: 2 },
    { label: '10.2&nbsp;&nbsp;Microbial Contamination (Mold)', href: 'section-10-2', level: 2 },
    { label: '10.3&nbsp;&nbsp;Americans with Disabilities Act', href: 'section-10-3', level: 2 },
    { label: 'APPENDICES', href: 'section-appendices', level: 1 },
  ];

  // ----- D/O/C/R sections -----
  const docrSections = [
    { id: 'section-5-2', num: '5.2', title: 'Access and Egress', config: accessEgress as SectionConfig, step: 16 },
    { id: 'section-5-3', num: '5.3', title: 'Paving, Curbing and Parking', config: pavingCurbingParking as SectionConfig, step: 17 },
    { id: 'section-5-4', num: '5.4', title: 'Flatwork', config: flatwork as SectionConfig, step: 18 },
    { id: 'section-5-5', num: '5.5', title: 'Landscaping and Appurtenances', config: landscapingAppurtenances as SectionConfig, step: 19 },
    { id: 'section-5-6', num: '5.6', title: 'Ancillary Structures', config: ancillaryStructures as SectionConfig, step: 20 },
    { id: 'section-6-1', num: '6.1', title: 'Foundation', config: foundation as SectionConfig, step: 21 },
    { id: 'section-6-2', num: '6.2', title: 'Building Frame', config: buildingFrame as SectionConfig, step: 22 },
    { id: 'section-6-3', num: '6.3', title: 'Facades or Curtain Wall', config: facadesCurtainWall as SectionConfig, step: 23 },
    { id: 'section-6-4', num: '6.4', title: 'Roofing', config: roofing as SectionConfig, step: 24 },
    { id: 'section-7-1', num: '7.1', title: 'Heating, Ventilation and Air Conditioning', config: heatingAndCooling as SectionConfig, step: 25 },
    { id: 'section-7-2', num: '7.2', title: 'Electrical', config: electrical as SectionConfig, step: 26 },
    { id: 'section-7-3', num: '7.3', title: 'Plumbing', config: plumbing as SectionConfig, step: 27 },
    { id: 'section-7-4', num: '7.4', title: 'Elevators and Escalators', config: elevatorsAndEscalators as SectionConfig, step: 28 },
    { id: 'section-8-1', num: '8.1', title: 'Common Areas', config: commonAreas as SectionConfig, step: 29 },
    { id: 'section-8-2', num: '8.2', title: 'Tenant Spaces', config: tenantSpaces as SectionConfig, step: 30 },
    { id: 'section-9-1', num: '9.1', title: 'Sprinklers and Standpipes', config: sprinklersAndStandpipes as SectionConfig, step: 31 },
    { id: 'section-9-2', num: '9.2', title: 'Alarm Systems', config: alarmSystems as SectionConfig, step: 32 },
    { id: 'section-10-1', num: '10.1', title: 'Natural Hazards', config: naturalHazards as SectionConfig, step: 33 },
    { id: 'section-10-2', num: '10.2', title: 'Microbial Contamination (Mold)', config: microbialContamination as SectionConfig, step: 34 },
  ];

  // Build D/O/C/R section HTML, grouped by parent section headers
  const section5Html = docrSections.filter(s => s.num.startsWith('5.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');
  const section6Html = docrSections.filter(s => s.num.startsWith('6.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');
  const section7Html = docrSections.filter(s => s.num.startsWith('7.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');
  const section8Html = docrSections.filter(s => s.num.startsWith('8.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');
  const section9Html = docrSections.filter(s => s.num.startsWith('9.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');
  const section10Html = docrSections.filter(s => s.num.startsWith('10.')).map(s => renderDOCRSection(s.id, s.num, s.title, s.config, content, s.step)).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Property Condition Assessment - ${propertyName}</title>
  <style>
    /* FONT_PLACEHOLDER */

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: 'Calibri', Arial, Helvetica, sans-serif !important;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
    }

    body, html, * {
      font-family: 'Calibri', Arial, Helvetica, sans-serif !important;
    }

    @page {
      size: letter;
      margin: 0;
    }

    @page cover { margin: 0; }
    @page toc { margin: 0; }

    @page content {
      margin: 0;
      margin-bottom: 0.6in;
      @bottom-left {
        content: "PROPERTY CONDITION ASSESSMENT";
        font-family: 'Calibri', Arial, Helvetica, sans-serif;
        font-size: 9pt;
        color: #0C306C;
        margin-left: 0.5in;
      }
      @bottom-center {
        content: counter(page);
        font-family: 'Calibri', Arial, Helvetica, sans-serif;
        font-size: 9pt;
        color: #0C306C;
      }
      @bottom-right {
        content: "NDDS PROJECT ${projectNum}";
        font-family: 'Calibri', Arial, Helvetica, sans-serif;
        font-size: 9pt;
        color: #0C306C;
        margin-right: 0.5in;
      }
    }

    .content-wrapper {
      padding: 0.5in;
      padding-bottom: 0.25in;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
      page: content;
      margin-bottom: 0;
    }

    /* ---- Cover ---- */
    .cover-page {
      page: cover;
      width: 100%;
      height: 11in;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
    }
    .cover-header {
      background-color: #0C306C;
      padding: 20px 0;
      width: 100%;
    }
    .cover-logo { max-width: 500px; margin: 0 auto; }
    .cover-logo img { width: 100%; max-height: 120px; object-fit: contain; }
    .cover-title { font-size: 28pt; color: #0C306C; margin: 20px 0 10px 0; }
    .cover-property-name { font-size: 20pt; color: #1a3270; margin: 10px 0; }
    .cover-photo { width: 600px; height: 400px; margin: 15px auto; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .cover-photo img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .cover-address { font-size: 13pt; margin: 10px 0; }
    .cover-project { font-size: 13pt; margin: 5px 0; }
    .cover-date { font-size: 13pt; margin: 5px 0; }
    .cover-prepared-for { font-size: 12pt; margin: 10px 40px; }
    .cover-footer {
      margin-top: auto;
      margin-bottom: 15px;
      font-size: 10pt;
      color: #0C306C;
      line-height: 1.5;
    }
    .cover-footer a { color: #0C306C; text-decoration: none; }

    /* ---- TOC ---- */
    .toc-page { page: toc; page-break-after: always; padding: 0.75in; }
    .toc-title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; color: #000; }
    .toc-line { display: flex; width: 100%; margin: 3px 0; align-items: baseline; }
    .toc-link {
      display: flex;
      width: 100%;
      align-items: baseline;
      text-decoration: none;
      color: inherit;
      overflow: hidden;
      font-size: 11pt;
    }
    .toc-link::before {
      content: '';
      flex-grow: 1;
      height: 0;
      margin: 0 6px;
      border-bottom: 1px dotted #000;
      order: 2;
    }
    .toc-link::after {
      content: target-counter(attr(href), page);
      order: 3;
      margin-left: 6px;
      flex-shrink: 0;
    }
    .toc-level-1 { font-weight: bold; text-transform: uppercase; order: 1; }
    .toc-level-2 { padding-left: 30px; order: 1; }

    /* ---- Content pages ---- */
    .content-page { page: content; }

    h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #000;
      margin-top: 30px;
      margin-bottom: 10px;
      page-break-after: avoid;
      border-top: 2.5px solid #000;
      border-bottom: 2.5px solid #000;
      padding: 4px 0;
    }
    h3 {
      font-size: 11pt;
      font-weight: bold;
      color: #000;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p { margin: 6px 0; text-align: justify; }
    ul { margin: 6px 0 6px 20px; }
    li { margin: 4px 0; text-align: justify; }

    /* ---- Key-value tables (sections 1-4) ---- */
    .kv-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11pt;
    }
    .kv-table td {
      padding: 6px 8px;
      vertical-align: top;
      border: 1px solid #bbb;
    }
    .kv-table .kv-label {
      width: 190px;
      font-weight: normal;
      white-space: nowrap;
      font-size: 11pt;
    }

    /* 4-column property details table */
    .prop-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11pt;
    }
    .prop-table td {
      padding: 6px 8px;
      vertical-align: top;
      border: 1px solid #bbb;
    }
    .prop-table .prop-label {
      width: 190px;
      font-weight: normal;
      font-size: 11pt;
    }
    .prop-table .prop-value {
      font-size: 11pt;
    }
    .prop-table .prop-source-label {
      width: 55px;
      font-size: 11pt;
      text-align: right;
    }
    .prop-table .prop-source-value {
      width: 110px;
      font-size: 11pt;
      color: #c00000;
    }

    /* ---- D/O/C/R tables (sections 5-10) ---- */
    .docr-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 16px 0;
      font-size: 11pt;
      page-break-inside: auto;
    }
    .docr-table td {
      padding: 6px 8px;
      vertical-align: top;
      border: 1px solid #bbb;
    }
    .docr-table .block-header td {
      background: #f0f0f0;
      font-weight: bold;
      font-style: italic;
      font-size: 11pt;
      border-bottom: 2px solid #bbb;
    }
    .docr-table .field-label {
      width: 180px;
      font-weight: normal;
      font-size: 11pt;
      text-transform: uppercase;
    }
    .docr-table .field-value {
      font-size: 11pt;
    }

    .placeholder { color: #999; font-style: italic; }

    /* ---- Letter page ---- */
    .letter-page {
      page: content;
      page-break-after: always;
      padding: 0.5in 0.65in;
      font-size: 11pt;
      position: relative;
      height: 11in;
      box-sizing: border-box;
    }
    .letter-page p { text-align: left; margin: 6px 0; }
    .letter-date { color: #c00000; margin-bottom: 16px; }
    .letter-client-block { color: #c00000; margin-bottom: 16px; line-height: 1.4; }
    .letter-re { margin-bottom: 16px; }
    .letter-re .re-label { color: #c00000; font-weight: bold; }
    .letter-re .re-indent { padding-left: 40px; color: #c00000; }
    .letter-salutation { margin-bottom: 12px; }
    .letter-body p { text-align: justify; margin: 10px 0; }
    .letter-sincerely { margin-top: 20px; }
    .letter-signature-area { height: 50px; }
    .letter-signer { margin-bottom: 0; }
    .letter-bottom-section {
      position: absolute;
      bottom: 0.5in;
      left: 0.65in;
      right: 0.65in;
    }
    .letter-prep-review-header {
      display: flex;
      justify-content: flex-start;
      gap: 120px;
      margin-bottom: 24px;
      font-size: 11pt;
    }
    .letter-ndds-footer {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      margin-bottom: 40px;
      line-height: 1.4;
    }
    .letter-ndds-footer a { color: inherit; text-decoration: none; }
    .letter-names-row {
      display: flex;
      justify-content: flex-start;
      gap: 120px;
      font-size: 11pt;
    }
    .letter-names-row .name { color: #c00000; }
    .letter-names-row .title { color: #c00000; }

    /* ADA Checklist */
    .ada-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10pt;
    }
    .ada-table th, .ada-table td {
      padding: 4px 6px;
      border: 1px solid #999;
      vertical-align: top;
    }
    .ada-table th {
      background: #0C306C;
      color: white;
      text-align: left;
    }
    .ada-table .cat-header td {
      background: #e8e8e8;
      font-weight: bold;
    }

    /* Appendix cover pages */
    .appendix-cover {
      page: content;
      page-break-before: always;
      text-align: center;
      padding-top: 3in;
    }
    .appendix-cover h2 { font-size: 18pt; color: #0C306C; }
    .appendix-cover p { font-size: 14pt; text-align: center; color: #0C306C; }

    /* Property Condition Summary page */
    .pcs-page {
      page: content;
      page-break-after: always;
      padding: 0.5in 0.5in 0.25in 0.5in;
    }
    .pcs-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .pcs-header .pcs-title {
      font-size: 12pt;
      font-weight: bold;
      color: #0C306C;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .pcs-header .pcs-sub {
      font-size: 10pt;
      color: #000;
      line-height: 1.4;
    }
    .pcs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .pcs-table th {
      background: #0C306C;
      color: white;
      padding: 6px 8px;
      border: 1px solid #0C306C;
      text-align: center;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .pcs-table th:first-child { text-align: left; }
    .pcs-table td {
      padding: 5px 8px;
      border: 1px solid #bbb;
      vertical-align: middle;
    }
    .pcs-table .pcs-sys { font-weight: normal; }
    .pcs-table .pcs-x { text-align: center; font-weight: bold; }
    .pcs-table .pcs-action { text-align: center; color: #c00000; font-weight: bold; }
    .pcs-legend {
      margin-top: 16px;
      font-size: 9pt;
      line-height: 1.6;
    }
    .pcs-legend .pcs-legend-title {
      font-weight: bold;
      margin-bottom: 2px;
    }
    .pcs-legend div { padding-left: 40px; }

    /* Cost Opinion page */
    .cost-page {
      page: content;
      page-break-after: always;
      padding: 0.5in 0.5in 0.25in 0.5in;
    }
    .cost-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 6px;
    }
    .cost-table th {
      background: #0C306C;
      color: white;
      padding: 6px 8px;
      border: 1px solid #0C306C;
      text-align: center;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .cost-table td {
      padding: 5px 8px;
      border: 1px solid #bbb;
      vertical-align: middle;
    }
    .cost-table .cost-val { text-align: right; }
    .cost-table .cost-subtotal td {
      font-weight: bold;
      border-top: 2px solid #000;
    }
    .cost-table .cost-grand td {
      font-weight: bold;
      background: #e8e8e8;
      border-top: 2px solid #000;
    }
    .cost-table .cost-section-header td {
      background: #0C306C;
      color: white;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      font-size: 9pt;
    }
    .cost-disclaimer {
      font-size: 9pt;
      margin-top: 14px;
      line-height: 1.5;
    }
    .cost-disclaimer p { text-align: justify; margin: 6px 0; }
  </style>
</head>
<body>

<!-- ================================================================ -->
<!-- COVER PAGE                                                       -->
<!-- ================================================================ -->
<div class="cover-page">
  <div class="cover-header">
    <div class="cover-logo">
      <img src="${logoUrl}" alt="ASM NDDS Logo" />
    </div>
  </div>
  <div class="cover-title">PROPERTY CONDITION ASSESSMENT REPORT</div>
  <div class="cover-property-name">${propertyName}</div>
  <div class="cover-photo">
    ${meta.coverPhotoUrl ? `<img src="${escapeHtml(meta.coverPhotoUrl)}" alt="Property Photo" />` : '<!-- Cover photo placeholder -->'}
  </div>
  <div class="cover-address">${propertyAddress}<br>${cityStateZip}</div>
  <div class="cover-project">NDDS Project #${projectNum}</div>
  <div class="cover-date">Date Issued: ${dateIssued}</div>
  <div class="cover-prepared-for">
    Prepared For:<br>
    ${clientName}<br>
    ${escapeHtml(meta.clientAddress || '')}<br>
    ${escapeHtml(meta.clientCityStateZip || '')}
  </div>
  <div class="cover-footer">
    National Due Diligence Services, a Division of American Surveying and Mapping, Inc.<br>
    221 Circle Drive, Maitland, FL 32751<br>
    Telephone: 407-426-7979, Fax: 407-426-9741<br>
    <a href="http://www.NationalDueDiligenceServices.com">www.NationalDueDiligenceServices.com</a>
  </div>
</div>

<!-- ================================================================ -->
<!-- TRANSMITTAL LETTER                                               -->
<!-- ================================================================ -->
<div class="letter-page">
  <p class="letter-date">${dateIssued}</p>

  <div class="letter-client-block">
    ${escapeHtml(meta.clientContactName || 'Client Contact')}<br>
    <strong>${clientName}</strong><br>
    ${escapeHtml(meta.clientAddress || 'Address')}<br>
    ${escapeHtml(meta.clientCityStateZip || 'City, State Zip Code')}
  </div>

  <div class="letter-re">
    <span class="re-label">RE:</span>
    <span style="padding-left: 16px; color: #c00000;">${propertyName}</span><br>
    <div class="re-indent">${propertyAddress}</div>
    <div class="re-indent">${cityStateZip}</div>
    <div class="re-indent">NDDS Project #${projectNum}</div>
  </div>

  <p class="letter-salutation">Dear Mr., Mrs., Ms. ${escapeHtml(meta.clientContactName || 'Client Contact Name')},</p>

  <div class="letter-body">
    <p>National Due Diligence Services, a division of American Surveying and Mapping, Inc. (ASM) has completed a Property Condition Assessment (PCA) of the above referenced property. The PCA was conducted in accordance with the ASTM International (ASTM) Standard Guide for Property Condition Assessments: <u>Baseline Property Condition Assessment Process E 2018 24 (the Standard)</u>, the applicable engagement letter with <strong>${clientName}</strong> <strong>(Client)</strong> dated <span style="color: #c00000;">Month Day, 2025</span> and generally accepted industry standards.</p>

    <p>This report was prepared solely for the use of Client and any party specifically referenced in Section 2.5 User Reliance. No other party shall use or rely on this <u>report</u> or the findings herein, without the prior written consent of NDDS.</p>

    <p>Please do not hesitate to contact us at 877 439 2582 if you have any questions or if we can be of further service to you.</p>
  </div>

  <p class="letter-sincerely">Sincerely,</p>

  <div class="letter-signature-area"></div>

  <p class="letter-signer">${escapeHtml(meta.reviewedBy || 'Ronnie Long')}<br>Assessments Director</p>

  <div class="letter-bottom-section">
    <div class="letter-prep-review-header">
      <div>Prepared by</div>
      <div>Reviewed by</div>
    </div>

    <div class="letter-ndds-footer">
      National Due Diligence Services, a Division of American Surveying and Mapping, Inc.<br>
      221 Circle Drive, Maitland, Florida 32751<br>
      <a href="http://www.NationalDueDiligenceServices.com">www.NationalDueDiligenceServices.com</a>
    </div>

    <div class="letter-names-row">
      <div>
        <span class="name">${escapeHtml(meta.preparedBy || 'Name')}</span><br>
        <span class="title">${escapeHtml(meta.preparedByTitle || 'Project Manager')}</span>
      </div>
      <div>
        <span class="name">${escapeHtml(meta.reviewedBy || 'Ronnie Long')}</span><br>
        <span class="title">${escapeHtml(meta.reviewedByTitle || 'Assessments Director')}</span>
      </div>
    </div>
  </div>
</div>

<!-- ================================================================ -->
<!-- PROPERTY CONDITION SUMMARY                                       -->
<!-- ================================================================ -->
<div class="pcs-page">
  <div class="pcs-header">
    <div class="pcs-title">Property Condition Summary</div>
    <div class="pcs-sub">
      ${propertyName}<br>
      ${propertyAddress}<br>
      ${cityStateZip}<br>
      NDDS PROJECT ${projectNum}
    </div>
  </div>

  <table class="pcs-table">
    <thead>
      <tr>
        <th style="width: 50%;">Construction System</th>
        <th style="width: 10%;">Good</th>
        <th style="width: 10%;">Fair</th>
        <th style="width: 10%;">Poor</th>
        <th style="width: 20%;">Action</th>
      </tr>
    </thead>
    <tbody>
      ${buildConditionSummaryRows(content)}
    </tbody>
  </table>

  <div class="pcs-legend">
    <div class="pcs-legend-title" style="padding-left: 40px;">Indicators of recommended action:</div>
    <div>IR = Immediate Repair</div>
    <div>ST = Short Term Repair</div>
    <div>RR = Replacement Reserve</div>
    <div>RM = Routine Maintenance</div>
    <div>INV = Investigation is Recommended</div>
    <div>NA = Not Applicable</div>
  </div>
</div>

<!-- ================================================================ -->
<!-- OPINION OF PROBABLE COST                                         -->
<!-- ================================================================ -->
${(() => {
  const c = buildCostOpinionTable(content);
  return `<div class="cost-page">
  <table class="cost-table">
    <thead>
      <tr><th colspan="3">Opinion of Probable Cost to Remedy Physical Deficiencies/Deferred Maintenance</th></tr>
      <tr><th style="width:50%; text-align:left;">Item</th><th style="width:25%;">Immediate Costs</th><th style="width:25%;">Short-Term Costs</th></tr>
    </thead>
    <tbody>
      ${c.deficiencyRows}
      <tr class="cost-subtotal"><td style="text-align:right;">Sub-Total of Estimated Costs</td><td class="cost-val">${c.immTotal}</td><td class="cost-val">${c.stTotal}</td></tr>
      <tr class="cost-grand"><td colspan="2" style="text-align:right;">Total Estimated Physical Deficiencies/Deferred Maintenance</td><td class="cost-val">${c.grandTotal}</td></tr>
    </tbody>
  </table>

  <table class="cost-table">
    <thead>
      <tr><th colspan="5">12-Year Capital Replacement Reserves Summary</th></tr>
      <tr>
        <th>Capital Replacement Reserve Term</th>
        <th>Total Uninflated Reserve</th>
        <th>Annual Uninflated Cost Per SF</th>
        <th>Total Inflated Reserve (2.5%)</th>
        <th>Annual Inflated Cost Per SF (@2.5%)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center;">${c.reserveTerm}</td>
        <td class="cost-val">${c.totalUninflated}</td>
        <td class="cost-val">${c.annualUninflated}</td>
        <td class="cost-val">${c.totalInflated}</td>
        <td class="cost-val">${c.annualInflated}</td>
      </tr>
    </tbody>
  </table>

  <div class="cost-disclaimer">
    <p>Conditions noted in the Property Condition Assessment Summary are representative of the overall conditions of the property. There may be more detail on specific assessment components in the Report text, therefore the Property Condition Assessment Summary should not be used as a standalone document.</p>
    <p>Costs shown in tables are rough approximations of cost and should not be used for budgeting purposes. If more detailed, thorough, or accurate estimated costs are desired, the services of a professional cost estimator should be engaged.</p>
  </div>
</div>`;
})()}

<!-- ================================================================ -->
<!-- TABLE OF CONTENTS                                                -->
<!-- ================================================================ -->
${buildToc(tocItems)}

<!-- ================================================================ -->
<!-- SECTION 1.0 - SUMMARY                                           -->
<!-- ================================================================ -->
<div class="content-wrapper">

<h2 id="section-1-0">1.0&nbsp;&nbsp;&nbsp;SUMMARY</h2>

<h3 id="section-1-1">1.1&nbsp;&nbsp;&nbsp;General Description</h3>

<p>At the request of Client, NDDS has performed a Property Condition Assessment (PCA) of the property located at ${propertyAddress}, ${cityStateZip}, herein referred to as the Subject Property. Salient property details are as follows:</p>

<table class="prop-table">
  <colgroup>
    <col style="width: 190px;">
    <col>
    <col style="width: 60px;">
    <col style="width: 115px;">
  </colgroup>
  <tr><td class="prop-label">PROPERTY NAME</td><td colspan="3" class="prop-value">${propertyName}</td></tr>
  <tr><td class="prop-label">PROPERTY ADDRESS</td><td colspan="3" class="prop-value">${propertyAddress}</td></tr>
  <tr><td class="prop-label">CITY, STATE, ZIP</td><td colspan="3" class="prop-value">${cityStateZip}</td></tr>
  <tr><td class="prop-label">PROPERTY USE</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'property-use')}</td></tr>
  <tr><td class="prop-label">NUMBER OF BUILDINGS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'number-of-buildings')}</td></tr>
  <tr><td class="prop-label">NUMBER OF STORIES</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'number-of-stories')}</td></tr>
  <tr><td class="prop-label">YEAR CONSTRUCTED</td><td class="prop-value">${pvRaw(content, 1, 'year-constructed')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'year-constructed__source') || 'County Assessor'}</td></tr>
  <tr><td class="prop-label">NUMBER OF PARCELS</td><td class="prop-value">${pvRaw(content, 1, 'number-of-parcels')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'number-of-parcels__source') || ''}</td></tr>
  <tr><td class="prop-label">TOTAL ACREAGE</td><td class="prop-value">${pvRaw(content, 1, 'total-acreage')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'total-acreage__source') || ''}</td></tr>
  <tr><td class="prop-label">DWELLING UNITS/BEDS</td><td class="prop-value">${pvRaw(content, 1, 'dwelling-units-beds')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'dwelling-units-beds__source') || 'Rent Roll'}</td></tr>
  <tr><td class="prop-label">COMMERCIAL UNITS</td><td class="prop-value">${pvRaw(content, 1, 'commercial-units')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'commercial-units__source') || ''}</td></tr>
  <tr><td class="prop-label">GROSS BUILDING AREA</td><td class="prop-value">${pvRaw(content, 1, 'gross-building-area')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'gross-building-area__source') || ''}</td></tr>
  <tr><td class="prop-label">NET RENTABLE AREA</td><td class="prop-value">${pvRaw(content, 1, 'net-rentable-area')}</td><td class="prop-source-label">Source:</td><td class="prop-source-value">${pvRaw(content, 1, 'net-rentable-area__source') || 'Rent roll'}</td></tr>
  <tr><td class="prop-label">PARKING/PAVING</td><td class="prop-value">${pvRaw(content, 1, 'parking-paving')}</td><td style="font-size: 10pt;">${pvRaw(content, 1, 'parking-spaces') || '# Spaces'}</td><td style="font-size: 10pt;">${pvRaw(content, 1, 'parking-ada-spaces') || '# ADA Spaces'}</td></tr>
  <tr><td class="prop-label">FOUNDATION SYSTEMS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'foundation-systems')}</td></tr>
  <tr><td class="prop-label">STRUCTURAL SYSTEMS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'structural-systems')}</td></tr>
  <tr><td class="prop-label">ROOFING SYSTEMS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'roofing-systems')}</td></tr>
  <tr><td class="prop-label">HVAC SYSTEMS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'hvac-systems')}</td></tr>
  <tr><td class="prop-label">FIRE SUPPRESSION</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'fire-suppression')}</td></tr>
  <tr><td class="prop-label">FIRE ALARMS</td><td colspan="3" class="prop-value">${pvRaw(content, 1, 'fire-alarms')}</td></tr>
</table>

<p>A site diagram is provided in Appendix A of this report. Photographs of the Subject Property are provided in Appendix B.</p>

<!-- 1.2 Physical Condition -->
<h3 id="section-1-2">1.2&nbsp;&nbsp;&nbsp;General Physical Condition</h3>

<table class="kv-table">
  <tr><td class="kv-label">General Condition:</td><td>${pvRaw(content, 2, 'general-condition')}</td></tr>
  <tr><td class="kv-label">Level of Maintenance:</td><td>${pvRaw(content, 2, 'level-of-maintenance')}</td></tr>
  <tr><td class="kv-label">Estimated Remaining Useful Life:</td><td>${pv(content, 2, 'estimated-remaining-useful-life')}</td></tr>
  <tr><td class="kv-label">Recent Capital Improvements:</td><td>${pv(content, 2, 'recent-capital-improvements') || 'None Identified or Reported'}</td></tr>
  <tr><td class="kv-label">Planned Capital Improvements:</td><td>${pv(content, 2, 'planned-capital-improvements') || 'None Identified or Reported'}</td></tr>
</table>

<!-- 1.3 Probable Cost -->
<h3 id="section-1-3">1.3&nbsp;&nbsp;&nbsp;Opinion of Probable Cost</h3>

${pv(content, 3, 'opinion-of-probable-cost') ? `<p>${pv(content, 3, 'opinion-of-probable-cost')}</p>` : '<p>As well, based on the walk-through survey of the Subject Property, interviews conducted and information obtained while conducting this PCA, NDDS estimates the following minimum capital reserves will be required for the Subject Property.  A detailed capital replacement reserves is provided in Table 2 - Capital Replacement Reserve Schedule in Appendix C of this report. </p>'}

<!-- 1.4 Deviations from ASTM -->
<h3 id="section-1-4">1.4&nbsp;&nbsp;&nbsp;Deviations from the ASTM Guidelines</h3>

<p>Based on the ASTM Guidelines, deviations from Standard are required to be discussed in the PCA Report. NDDS's deviations from the guides are intended to make the PCA more comprehensive and to meet the requirements of Client. The following is a list of the deviations from and additions to ASTM E 2018-24.</p>

<p>For purposes of this report the agreed threshold is presumed to be the de minimis reporting threshold with repairs not to be more than $3,000, unless it is related to a life safety item or item that if not repaired will significantly cause further damage.</p>

<p>The condition of the building structures and components evaluated will be broken down into one of three categories as defined in the standard:</p>
<ol>
  <li>Poor &ndash; not in working condition or requires immediate or short term repairs substantially above an agreed threshold;</li>
  <li>Fair &ndash; in working condition, but may require immediate or short repairs above an agreed threshold;</li>
  <li>Good &ndash; in working condition and does not require immediate or short term repairs above an agreed threshold
  
    <p>Immediate Term (0-90 Days) - Opinions of Costs that require immediate action as a result of any of the following: (1) represent an imminent life-safety issue, (2) material building or fire code violations, or (3) conditions that if left unremedied, have the potential to result in or contribute to critical element or system failure</p>

    <p>Short Term (0-1 Year) - Opinions of Costs to remedy physical deficiencies, such as deferred maintenance, that may not warrant immediate attention, but require repairs or replacements that should be undertaken on a priority basis in addition to routine preventative maintenance. Such Opinions of Costs may include costs for further testing, exploratory, and/or investigation that are beyond the scope of this Report.</p>

  </li>
</ol>

<p>This PCA includes a discussion of flood, wind and seismic considerations; mold; and compliance with the Americans with Disabilities Act (ADA), all of which are non-scope considerations under the Standard.</p>

<!-- 1.5 Recommendations -->
<h3 id="section-1-5">1.5&nbsp;&nbsp;&nbsp;Recommendations</h3>

${pv(content, 4, 'recommendations-text') ? `<p>${pv(content, 4, 'recommendations-text')}</p>` : ''}

<!-- ================================================================ -->
<!-- SECTION 2.0 - INTRODUCTION                                      -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-2-0">2.0&nbsp;&nbsp;&nbsp;INTRODUCTION</h2>

<h3 id="section-2-1">2.1&nbsp;&nbsp;&nbsp;Purpose</h3>

<p>The purpose of this assessment is to observe and report, to the extent feasible pursuant to the scope of work, on the physical condition of the Subject Property. This includes an effort to identify both a) material defects which appear, if left uncorrected, to pose an immediate threat to occupant safety or property facility operations, and b) systems, components, and equipment whose maintenance and replacement, or lack thereof, could significantly affect facility operating and financial performance over a specified evaluation period.  Unless specifically noted in the report, the cost estimates included in this report do not include costs to reposition the property in any way.  In addition, the PCA is not intended identify de minimis conditions that generally can be addressed through routine maintenance.</p>

<h3 id="section-2-2">2.2&nbsp;&nbsp;&nbsp;Scope of Work</h3>

<p>This PCA was conducted in accordance with ASTM <em>Standard Guide for Property Condition Assessments: Baseline Property Condition Assessment Process E 2018-24</em> and any additional requirements of the client. The specific scope included the following: </p>

<p><u>Documentation Review and Interviews:</u> The objective of the document review and interviews is to augment the walk-through survey and to assist NDDS in its understanding of the Subject Property and its identification of physical deficiencies. NDDS will review readily available records or documents to specifically identify, or assist in the identification of, physical deficiencies, as well as any preceding or ongoing efforts, or costs to investigate or remediate the physical deficiencies, or a combination thereof. NDDS will attempt to review information such as Certificates of Occupancy (COs), outstanding and recorded building and fire code violations, property-maintained maintenance records, inspection reports and warranties. This assessment, however, is not to be considered a regulatory or code compliance audit of the facility.</p>

<p>A property questionnaire will be provided to the property owner and/or owner's representative. The questionnaire will ask about general property information as well as specific questions regarding known code violations and the condition of the substructure, superstructure and roofs of all improvements, interior finishes, mechanical, electrical and plumbing elements (MEP) and the surrounding grounds.</p>

<p>Accuracy and completeness of information varies among information sources. It is not NDDS's obligation to independently verify the information provided or to identify mistakes or insufficiencies in the information provided. NDDS will, however, make reasonable effort to compensate for mistakes or insufficiencies of information reviewed that are obvious in light of other information obtained in the process of conducting the PCA or otherwise known to the consultant.</p>

<p><u>Walk-Through Survey:</u> The objective of the walk-through survey is to visually observe the Subject Property so as to obtain information on material systems and components for the purposes of providing a brief description, identifying physical deficiencies to the extent that they are easily visible and readily accessible. A single visit will be made to the Subject Property during which time NDDS shall make a visual observation of material systems and components and identify physical deficiencies and any unusual features. An attempt will be made to inspect the exterior of each major property improvement. On the interior of structures on the property, accessible common areas, expected to be used by occupants or the public, such as lobbies, hallways and restrooms, maintenance and repair areas, and a representative sample of occupant spaces, will be visually and/or physically observed. Observations of interior areas will generally be limited to 10% of occupiable spaces. The assessment of the building fa&ccedil;ade will be conducted from street or balcony level. The riding of scaffolding equipment is not part of the scope of work.</p>

<p>The walk-through will be conducted by a single assessor with a well-rounded knowledge of pertinent building systems and components. The use of system subspecialists can frequently provide increased detail in reporting and insight into site conditions. Unless specified in the proposal, no such specialists will be retained in the performance of this work.</p>

<p>The walk-through survey will focus on the following areas:</p>
<ul>
  <li>Property/Site Features: Observations will be made of the type, condition and adequacy of the general topography, storm water drainage, ingress and egress, paving, curbing and parking areas, flatwork, landscaping and appurtenances, recreation facilities, amenities and ancillary structures, and utilities.</li>
  <li>Structural Frame and Building Envelope: Observations will be made of the type, condition and adequacy of the foundation, building frame, fa&ccedil;ade and curtain walls, and the roofing systems.</li>
  <li>Mechanical, Electrical and Plumbing Systems: Observations will be made of the type, condition and adequacy of the heating, ventilation and air conditioning (HVAC) systems, electrical systems and plumbing systems.</li>
  <li>Vertical Transportation: Observations will be made regarding the presence and condition of any elevators or escalators present on the property.</li>
  <li>Life Safety/Fire Protection: Observations will be made of the type, condition and adequacy of sprinkler systems, fire alarm systems or any other life safety and fire protection systems.</li>
  <li>Interior Elements: Observations will be made of the type, condition and adequacy of the interior finishes, fixtures, appliances and furnishings.</li>
  <li>Accessibility: Depending on the applicability of the regulations, a Tier I Visual Survey will be conducted to determine if the property is in compliance with the Americans with Disabilities Act (ADA) or the Fair Housing Act (FHA). The Tier I survey includes a limited visual assessment of the property to assess if it is accessible and useable by people with disabilities.  No measurements will be collected as part of the screening. This screening is not to be considered and in-depth survey or audit. As such, it should not be considered a verification of compliance or a guarantee of the identification of all possible ADA violations.</li>
</ul>

<p><u>Opinions of Probable Costs to Remedy Physical Deficiencies:</u> Based on the documentation review, interviews and walk-through survey conducted, NDDS will identify areas of physical deficiency and deferred maintenance. NDDS will also generate a Capital Replacement Reserve Schedule. Capital replacement Reserves are for recurring probable expenditures that are not classified as operation or maintenance expenses.</p>

<p>Physical deficiency is defined as conspicuous defects or significant deferred maintenance of a Subject Property's material systems, components, or equipment as observed as a result of the field observer's walk-through survey. Included within this definition are material life-safety/building code violations and material systems, components, or equipment that are approaching, have reached, or have exceeded their typical EUL or whose RUL should not be relied upon in view of actual or effective age, abuse, excessive wear and tear, exposure to the elements, lack of proper or routine maintenance, etc. This definition specifically excludes deficiencies that may be remedied with routine maintenance, miscellaneous minor repairs, normal operating maintenance, etc., and excludes de minimis conditions that generally do not constitute a material physical deficiency of the Subject Property. Deferred maintenance is defined as physical deficiencies that could have been remedied with routine maintenance, normal operating maintenance, etc., excluding de minimis conditions that generally do not present a material physical deficiency to the Subject Property.</p>

<p style="margin-left: 36px;">NDDS will provide opinions of the probable cost to address the suggested remedies of the material physical deficiencies and deferred maintenance identified. Opinions of probable costs will be segregated between immediate and <u>short term</u> costs.</p>

<ul>
  <li><u>Immediate Term (0-90 Days)</u> - Opinions of Costs that require immediate action as a result of any of the following: (1) represent an imminent life-safety issue, (2) material building or fire code violations, or (3) conditions that if left unremedied, have the potential to result in or contribute to critical element or system failure.</li>
  <li><u>Short Term (0-1 Year)</u> - Opinions of Costs to remedy physical deficiencies, such as deferred maintenance, that may not warrant immediate attention, but require repairs or replacements that should be undertaken on a priority basis in addition to routine preventative maintenance. Such Opinions of Costs may include costs for further testing, exploratory, and/or investigation that are beyond the scope of this Report.</li>
</ul>

<div style="margin-left: 36px;">
  <p>Opinions of probable costs will only be provided for material physical deficiencies and not for repairs or improvements that could be classified as: (1) cosmetic or decorative; (2) part or parcel of a building renovation program (3) tenant improvements/finishes; (4) enhancements to reposition the Subject Property in the marketplace; (5) for warranty transfer purposes; or (6) routine or normal preventive maintenance, or a combination thereof. Opinions of probable costs that are either individually or in the aggregate less than a threshold amount of $3,000 for like items are considered routine maintenance and are not included in this report. If there are more than four separate like items that are below this threshold requirement, but collectively total over $10,000, such items may be grouped and included.</p>

  <p>These opinions are to assist the user of the report in developing a general understanding of the physical condition of the Subject Property. Opinions of probable costs should only be construed as preliminary, order of magnitude budgets. Actual costs will likely vary from the consultant's opinions of probable costs depending on such matters as type and design of suggested remedy, quality of materials and installation, manufacturer and type of equipment or system selected, field conditions, whether a physical deficiency is repaired or replaced in whole, phasing of the work (if applicable), quality of contractor, quality of project management exercised, market conditions, and whether competitive pricing is solicited.</p>

  <p>It is not the intent of this assessment for NDDS to prepare or provide exact quantities or identify the exact locations of items or systems as a basis for preparing the opinions of probable costs. Extrapolation of representative observations, conditions deemed by NDDS as highly probable, results from information received, or the commonly encountered expected useful lives (EULs) or RULs of the components or systems, or a combination thereof. The source of cost information utilized by NDDS may be from one or more of the following resources: (1) Client provided unit costs; (2) owner's historical experience costs; (3) consultant's cost database or cost files; (4) commercially available cost information such as published commercial data; (5) third party cost information from contractors, vendors, or suppliers; or (6) other qualified sources that the consultant determines appropriate.</p>
</div>

<p>NDDS will also generate a Capital Replacement Reserve Schedule. Capital replacement Reserves are for recurring probable expenditures that are not classified as operation or maintenance expenses. The capital replacement reserves should be budgeted for in advance on an annual basis. Capital reserves are reasonably predictable both in terms of frequency and cost. However, capital reserves may also include components or systems that have an indeterminable life but nonetheless have a potential liability for failure within an estimated time period. Capital replacement Reserves exclude systems or components that are estimated to expire after the reserve term and that are not considered material to the structural and mechanical integrity of the Subject Property. Furthermore, systems and components that are not deemed to have a material effect on the use are also excluded. Costs that are caused by acts of God, accidents, or other occurrences that are typically covered by insurance, rather than reserved for, are also excluded. Replacement costs are solicited from ownership/property management, NDDS's discussions with service companies, manufacturers' representatives, and previous experience in preparing such schedules for other similar facilities. Costs for work performed by the ownership's or property management's maintenance staff are also considered. It is understood that a prudent owner would likely invest more than these minimum amounts.</p>

<h3 id="section-2-3">2.3&nbsp;&nbsp;&nbsp;Limitations and Exceptions</h3>

<ul>
  <li>The scope of work completed was designed solely to meet the needs of NDDS's Client. NDDS's recommendations and opinions of cost are only as of the date the walk-through performed, documentation reviewed and interviews conducted. Conditions at a property and the costs to remedy them can change significantly over a relatively short period of time due to levels of maintenance, acts of nature and other factors. NDDS shall not be liable for any unattended usage of this report by another party.</li>
  <li>No PCA can wholly eliminate uncertainty regarding the potential for physical deficiencies and the performance of a property's building. There is an inherent subjective nature of opinions as to such issues as workmanship, quality of original installation, and estimating the RUL of any given component or system. This PCA was designed to reduce, but not eliminate the uncertainty regarding the potential for component or system failure, within reasonable limits of time and cost, and no warranty is implied.</li>
  <li>The PCA is intended to be a non-intrusive assessment. No destructive testing was completed and concealed areas, such as inside, plenums, behind walls or within machinery, were not accessed. As such, NDDS makes no warranties regarding exterior insulation and finishing systems (EIFS), curtain walls or other building skin conditions that would not be readily observable and, therefore, outside the scope of this assignment.</li>
  <li>This PCA does not constitute a regulatory or code compliance audit of the building systems of management systems that may be present at the Subject Property. Testing, measuring, or preparing calculations for any system or component to determine adequacy, capacity, or compliance with any standard is outside the scope of work.</li>
  <li>Information in this report, concerning past and current physical concerns, maintenance and replacement activities, and condition of spaces not observed or viewable, is from sources deemed to be reliable, including, but not limited to interviews with property owners, operators and tenants, interviews with municipal agencies and vendors; however, no representation or warranty is made as to the accuracy thereof. NDDS will have no ongoing obligation to obtain and include information that was not reasonably ascertainable, practically reviewable or provided to NDDS in a reasonable timeframe to formulate an opinion and complete the assessment by the agreed upon due date.</li>
  <li>While the general environmental setting of the property is described, this assessment is not intended to be a formal flood plain or wetland determination, and no warranty is made thereof. Any fungi or mold reference included in this report does not constitute a professional mold inspection and is not based upon any sampling, testing and/or abatement. NDDS merely notes the visual presence or absence of fungi or mold while in the course of preparing this report.</li>
  <li>While a complete archive of photographs taken during the site visit is provided for reference, the consultant does not warrant that all conditions visible in those photographs were observed, assessed, or deemed relevant to the scope of this assessment. The consultant expressly disclaims any liability for any condition or defect depicted in photographs not specifically identified and discussed in this report.</li>
</ul>

<!-- 2.4 Reconnaissance Info -->
<h3 id="section-2-4">2.4&nbsp;&nbsp;&nbsp;General Property Reconnaissance Information</h3>

<table class="kv-table">
  <tr><td class="kv-label">DATE OF ASSESSMENT:</td><td>${pvRaw(content, 7, 'date-of-assessment')}</td></tr>
  <tr><td class="kv-label">WEATHER CONDITIONS:</td><td>${pvRaw(content, 7, 'weather-conditions')}</td></tr>
  <tr><td class="kv-label">ASSESSOR:</td><td>${pv(content, 7, 'assessor')}<br>A copy of the Professional Assessor's qualifications is included in Appendix D.</td></tr>
  <tr><td class="kv-label">PROPERTY CONTACT/ESCORT:</td><td>${pvRaw(content, 7, 'property-contact-escort')}</td></tr>
  <tr><td class="kv-label">AREAS ACCESSED:</td><td>${pv(content, 7, 'areas-accessed')}</td></tr>
  <tr><td class="kv-label">LIMITATIONS:</td><td>${pv(content, 7, 'limitations')}</td></tr>
</table>

<!-- 2.5 User Reliance -->
<h3 id="section-2-5">2.5&nbsp;&nbsp;&nbsp;User Reliance</h3>

<p>All reports, both verbal and written, are for the benefit of ${clientName} (Client) and its successors and assigns. This report has no other purpose and may not be relied upon by any other person or entity without the written consent of NDDS.</p>

<p>${clientName} (Client) may distribute the report to other parties without limitation; however, it is acknowledged that the report provided to third parties is for informational purposes only. NDDS will issue a reliance letter if requested.</p>

<!-- ================================================================ -->
<!-- SECTION 3.0 - PROPERTY CHARACTERISTICS                          -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-3-0">3.0&nbsp;&nbsp;&nbsp;PROPERTY CHARACTERISTICS</h2>

<h3 id="section-3-1">3.1&nbsp;&nbsp;&nbsp;Location and Description</h3>
${pv(content, 8, 'location-description') ? `<p>${pv(content, 8, 'location-description')}</p>` : ''}
${pv(content, 8, 'provided-legal-description') ? `<p>${pv(content, 8, 'provided-legal-description')}</p>` : '<p>A site diagram is provided in Appendix A of this report. Photographs of the Subject Property are provided in Appendix B.</p>'}

<h3 id="section-3-2">3.2&nbsp;&nbsp;&nbsp;Tenant and Lease Information</h3>
<table class="kv-table">
  <tr><td class="kv-label">TENANTS:</td><td>${pv(content, 9, 'tenants')}</td></tr>
  <tr><td class="kv-label">LEASE INFORMATION:</td><td>${pv(content, 9, 'lease-information')}</td></tr>
</table>

<h3 id="section-3-3">3.3&nbsp;&nbsp;&nbsp;Utility and Service Providers</h3>
<table class="kv-table">
  <tr><td class="kv-label">POTABLE WATER</td><td>${pvRaw(content, 10, 'portable-water')}</td></tr>
  <tr><td class="kv-label">ELECTRICITY</td><td>${pvRaw(content, 10, 'electricity')}</td></tr>
  <tr><td class="kv-label">NATURAL GAS</td><td>${pvRaw(content, 10, 'natural-gas')}</td></tr>
  <tr><td class="kv-label">STORM WATER</td><td>${pvRaw(content, 10, 'storm-water')}</td></tr>
  <tr><td class="kv-label">SANITARY SEWER</td><td>${pvRaw(content, 10, 'sanitary-sewer')}</td></tr>
  <tr><td class="kv-label">HVAC MAINTENANCE</td><td>${pvRaw(content, 10, 'hvac-maintenance')}</td></tr>
  <tr><td class="kv-label">FIRE/SECURITY</td><td>${pvRaw(content, 10, 'fire-security')}</td></tr>
  <tr><td class="kv-label">ROOF MAINTENANCE</td><td>${pvRaw(content, 10, 'roof-maintenance')}</td></tr>
  <tr><td colspan="2">${pv(content, 10, 'special-utility-notes') || 'No deficiencies or Special Utility Systems were observed or reported.'}</td></tr>
</table>

<!-- ================================================================ -->
<!-- SECTION 4.0 - DOCUMENT REVIEW AND INTERVIEWS                    -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-4-0">4.0&nbsp;&nbsp;&nbsp;DOCUMENT REVIEW AND INTERVIEWS</h2>

<h3 id="section-4-1">4.1&nbsp;&nbsp;&nbsp;Property Questionnaire</h3>
<p>NDDS requested that a property questionnaire be completed by someone familiar with the operation and maintenance of the facility. The questionnaire covered past and planned capital improvements, typical replacement costs, information from previous assessments and the description of any known or suspected issues of concern.</p>
${pv(content, 11, 'questionnaire-status') ? `<p>${pv(content, 11, 'questionnaire-status')}</p>` : ''}

<h3 id="section-4-2">4.2&nbsp;&nbsp;&nbsp;Interviews</h3>
<table class="kv-table">
  <tr><td class="kv-label">INTERVIEWEE</td><td>${pvRaw(content, 12, 'interviewee-1')}</td></tr>
  <tr><td class="kv-label">PERTINENT INFORMATION</td><td>${pv(content, 12, 'pertinent-info-1')}</td></tr>
  <tr><td class="kv-label">CONCERNS</td><td>${pv(content, 12, 'concerns-1')}</td></tr>
</table>

<h3 id="section-4-3">4.3&nbsp;&nbsp;&nbsp;Building and Fire Departments</h3>
<table class="kv-table">
  <tr><td class="kv-label">BUILDING DEPARTMENT CONTACT</td><td>${pvRaw(content, 13, 'building-dept-name')}<br>${pvRaw(content, 13, 'building-dept-phone')}<br>${pvRaw(content, 13, 'building-dept-website')}</td></tr>
  <tr><td class="kv-label">PERTINENT INFORMATION</td><td>${pv(content, 13, 'building-pertinent-info')}</td></tr>
  <tr><td class="kv-label">FIRE DEPARTMENT CONTACT</td><td>${pvRaw(content, 13, 'fire-dept-name')}<br>${pvRaw(content, 13, 'fire-dept-phone')}<br>${pvRaw(content, 13, 'fire-dept-website')}</td></tr>
  <tr><td class="kv-label">PERTINENT INFORMATION</td><td>${pv(content, 13, 'fire-pertinent-info')}</td></tr>
  <tr><td class="kv-label">CONCERNS</td><td>${pv(content, 13, 'building-fire-concerns')}</td></tr>
  <tr><td class="kv-label">RECOMMENDATIONS</td><td>${pv(content, 13, 'building-fire-recommendations')}</td></tr>
</table>

<h3 id="section-4-4">4.4&nbsp;&nbsp;&nbsp;Zoning Department</h3>
<table class="kv-table">
  <tr><td class="kv-label">ZONING DEPARTMENT CONTACT</td><td>${pvRaw(content, 14, 'zoning-dept-contact')}</td></tr>
  <tr><td class="kv-label">ZONE</td><td>${pvRaw(content, 14, 'zone')}</td></tr>
  <tr><td class="kv-label">ZONING COMPLIANCE</td><td>${pv(content, 14, 'zoning-compliance')}</td></tr>
  <tr><td class="kv-label">CONCERNS</td><td>${pv(content, 14, 'zoning-concerns')}</td></tr>
  <tr><td class="kv-label">RECOMMENDATIONS</td><td>${pv(content, 14, 'zoning-recommendations')}</td></tr>
</table>

<h3 id="section-4-5">4.5&nbsp;&nbsp;&nbsp;Previous Reports</h3>
${pvRaw(content, 15, 'report-title') ? `
<table class="kv-table">
  <tr><td class="kv-label">REPORT TITLE</td><td>${pvRaw(content, 15, 'report-title')}</td></tr>
  <tr><td class="kv-label">PREPARED BY</td><td>${pvRaw(content, 15, 'prepared-by')}</td></tr>
  <tr><td class="kv-label">DATE OF REPORT</td><td>${pvRaw(content, 15, 'date-of-report')}</td></tr>
  <tr><td class="kv-label">PERTINENT INFORMATION</td><td>${pv(content, 15, 'report-pertinent-info')}</td></tr>
</table>
` : '<p>NDDS was not provided any previous reports for the Subject Property.</p>'}

<!-- ================================================================ -->
<!-- SECTION 5.0 - SITE                                              -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-5-0">5.0&nbsp;&nbsp;&nbsp;Site</h2>

<h3 id="section-5-1">5.1&nbsp;&nbsp;&nbsp;Topography and Stormwater Drainage</h3>
<!-- 5.1 is typically filled from field notes or a standard template; placeholder for now -->
<p><em class="placeholder">[Topography and Stormwater Drainage content to be populated from field data]</em></p>

${section5Html}

<!-- ================================================================ -->
<!-- SECTION 6.0 - STRUCTURAL FRAME AND BUILDING ENVELOPE            -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-6-0">6.0&nbsp;&nbsp;&nbsp;STRUCTURAL FRAME AND BUILDING ENVELOPE</h2>

${section6Html}

<!-- ================================================================ -->
<!-- SECTION 7.0 - MECHANICAL, ELECTRICAL, AND PLUMBING SYSTEM       -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-7-0">7.0&nbsp;&nbsp;&nbsp;MECHANICAL, ELECTRICAL, AND PLUMBING SYSTEM</h2>

${section7Html}

<!-- ================================================================ -->
<!-- SECTION 8.0 - INTERIOR ELEMENTS                                 -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-8-0">8.0&nbsp;&nbsp;&nbsp;INTERIOR ELEMENTS</h2>

${section8Html}

<!-- ================================================================ -->
<!-- SECTION 9.0 - LIFE SAFETY/FIRE PROTECTION                      -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-9-0">9.0&nbsp;&nbsp;&nbsp;LIFE SAFETY/FIRE PROTECTION</h2>

${section9Html}

<!-- ================================================================ -->
<!-- SECTION 10.0 - ADDITIONAL CONSIDERATIONS                        -->
<!-- ================================================================ -->
</div><!-- end content-wrapper -->
<div class="content-wrapper">
<h2 id="section-10-0">10.0&nbsp;&nbsp;&nbsp;ADDITIONAL CONSIDERATIONS</h2>

${section10Html}

<!-- 10.3 ADA Screening - handled separately since it's a checklist -->
<h3 id="section-10-3">10.3&nbsp;&nbsp;&nbsp;Americans with Disabilities Act</h3>

<p>A Tier I Visual screening was conducted at the Subject Property for compliance with the Americans with Disabilities Act (ADA). The screening included a limited visual assessment of the property to determine if the property is accessible and usable by people with disabilities. No measurements were taken. This screening should not be considered an in-depth survey or audit.</p>

<p><em class="placeholder">[ADA Checklist results to be rendered from step 33 data]</em></p>

<!-- ================================================================ -->
<!-- APPENDICES                                                      -->
<!-- ================================================================ -->

<div class="appendix-cover" id="section-appendices">
  <h2>APPENDIX A</h2>
  <p>PROPERTY MAPS, DRAWINGS, AND DESCRIPTION</p>
</div>

<div class="appendix-cover">
  <h2>APPENDIX B</h2>
  <p>PROPERTY PHOTOGRAPHS</p>
</div>

<div class="appendix-cover">
  <h2>APPENDIX C</h2>
  <p>INTERVIEW/QUESTIONNAIRE DOCUMENTATION/CORRESPONDENCE</p>
</div>

<div class="appendix-cover">
  <h2>APPENDIX D</h2>
  <p>SUPPORTING DOCUMENTS</p>
</div>

<div class="appendix-cover">
  <h2>APPENDIX E</h2>
  <p>PERSONAL QUALIFICATIONS</p>
</div>

</div><!-- end content-wrapper -->

</body>
</html>`;
}
