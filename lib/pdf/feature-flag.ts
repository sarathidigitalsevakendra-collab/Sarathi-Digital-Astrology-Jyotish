/**
 * Phase-1 PDF Export Feature Flag
 * Enables gradual rollout - default enabled for Phase-1
 */

const PDF_EXPORT_ENABLED =
  process.env.NEXT_PUBLIC_PDF_EXPORT_ENABLED !== "false";

/** Check if PDF export (chart + report) is enabled */
export function isPdfExportEnabled(): boolean {
  return PDF_EXPORT_ENABLED;
}
