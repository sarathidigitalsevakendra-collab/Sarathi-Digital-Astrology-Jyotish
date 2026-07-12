"use client";

import { useState, useRef, useEffect } from "react";

export type PDFExportType = "chart" | "report";

interface PDFExportButtonProps {
  /** Callback for chart-only export (quick, low-risk) */
  onExportChart: () => void | Promise<void>;
  /** Callback for full report export */
  onExportReport: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  /** Show dropdown or single button (chart-only) */
  showReportOption?: boolean;
}

/**
 * Phase-1 PDF Export Button
 * Offers Chart (quick) and optionally Full Report export
 */
export default function PDFExportButton({
  onExportChart,
  onExportReport,
  disabled = false,
  className = "",
  showReportOption = true,
}: PDFExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChart = async () => {
    setLoading(true);
    try {
      await onExportChart();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      await onExportReport();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!showReportOption) {
    return (
      <button
        onClick={handleChart}
        disabled={disabled || loading}
        className={className}
        title="Download as PDF"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            <span>PDF</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>PDF</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || loading}
        className={className}
        title="Download as PDF"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            <span>PDF</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>PDF</span>
            <span className="ml-0.5 text-[10px]">▾</span>
          </>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-white/10 bg-slate-800 py-1 shadow-xl">
          <button
            onClick={handleChart}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
          >
            <span>📊</span>
            Chart only (quick)
          </button>
          <button
            onClick={handleReport}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
          >
            <span>📑</span>
            Full report
          </button>
        </div>
      )}
    </div>
  );
}
