/**
 * Phase-1 PDF Export Module
 * Client-side PDF generation - desktop focus, low-risk
 */

export {
  exportChartAsPdf,
  exportReportAsPdf,
  exportAIReportAsPdf,
} from "./pdf-generator";
export { isPdfExportEnabled } from "./feature-flag";
export type { ChartExportOptions, ReportExportOptions } from "./types";
export { PDF_LIMITS } from "./types";

