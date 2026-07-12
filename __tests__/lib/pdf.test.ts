/**
 * Phase-1 PDF Export Service Tests
 * Tests error handling paths; success paths require DOM/canvas (E2E)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { exportChartAsPdf, exportReportAsPdf } from "@/lib/pdf/pdf-generator";

describe("lib/pdf/pdf-generator", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("exportChartAsPdf", () => {
    it("throws when element is not found", async () => {
      await expect(
        exportChartAsPdf({
          elementId: "non-existent",
          fileName: "test.pdf",
        })
      ).rejects.toThrow('Element with ID "non-existent" not found');
    });
  });

  describe("exportReportAsPdf", () => {
    it("throws when element is not found", async () => {
      await expect(
        exportReportAsPdf({
          elementId: "non-existent",
          fileName: "report.pdf",
        })
      ).rejects.toThrow('Element with ID "non-existent" not found');
    });

    it("throws when no page children found", async () => {
      const div = document.createElement("div");
      div.id = "report-root";
      document.body.appendChild(div);

      await expect(
        exportReportAsPdf({
          elementId: "report-root",
          fileName: "report.pdf",
        })
      ).rejects.toThrow("No pages found in report root");
    });

    it("throws when page count exceeds MAX_PDF_PAGES", async () => {
      const root = document.createElement("div");
      root.id = "report-root";
      for (let i = 0; i < 51; i++) {
        root.appendChild(document.createElement("div"));
      }
      document.body.appendChild(root);

      await expect(
        exportReportAsPdf({
          elementId: "report-root",
          fileName: "report.pdf",
        })
      ).rejects.toThrow("exceeds maximum page limit");
    });
  });
});
