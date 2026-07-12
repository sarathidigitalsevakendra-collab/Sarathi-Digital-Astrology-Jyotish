/**
 * Phase-1 PDF Export Types
 * Based on PDF Export Compatibility Analysis
 */

export interface ChartExportOptions {
  /** ID of the DOM element to capture (e.g. "rasi-chart") */
  elementId: string;
  /** Output filename (e.g. "Birth_Chart_John_Doe.pdf") */
  fileName?: string;
  /** Chart/birth name for PDF header */
  chartName?: string;
  /** Birth date string for PDF header */
  birthDate?: string;
  /** Birth place for PDF header */
  birthPlace?: string;
}

export interface ReportExportOptions {
  /** ID of the PDF root element (e.g. "kundli-report-root") */
  elementId: string;
  /** Output filename */
  fileName?: string;
}

/** html2canvas options - desktop-optimized per compatibility analysis */
export interface CanvasOptions {
  scale: number;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string;
  logging: boolean;
}

/** Size limits per security recommendations (analysis §5.2) */
export const PDF_LIMITS = {
  /** Max canvas size in bytes before downscaling */
  MAX_CANVAS_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  /** Max PDF pages for report export */
  MAX_PDF_PAGES: 50,
} as const;
