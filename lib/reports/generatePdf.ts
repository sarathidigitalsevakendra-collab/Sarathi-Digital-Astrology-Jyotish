import { exportReportAsPdf } from "@/lib/pdf";

/**
 * Generates a PDF from a hidden DOM element (multi-page report).
 * Delegates to Phase-1 PDF service for consistency.
 *
 * @param elementId The ID of the root element containing PdfPage components
 * @param fileName The name of the output file (e.g., 'chart.pdf')
 */
export async function generatePdf(
  elementId: string,
  fileName: string = "report.pdf"
): Promise<void> {
  await exportReportAsPdf({ elementId, fileName });
}
