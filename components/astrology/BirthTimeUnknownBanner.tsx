/**
 * BirthTimeUnknownBanner
 *
 * A reusable banner shown on any chart/report page when the user's
 * birth time is not known (birthTimeKnown = false). Explains that
 * the chart is a Surya Kundli (noon default) and links to the
 * profile editor to update the time when available.
 */

"use client";

import Link from "next/link";

interface BirthTimeUnknownBannerProps {
  /** Set to true when the user's birth time is not confirmed */
  show: boolean;
  /** Compact mode for inline use (smaller padding, no icon) */
  compact?: boolean;
}

export default function BirthTimeUnknownBanner({
  show,
  compact = false,
}: BirthTimeUnknownBannerProps) {
  if (!show) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
        <span>⏰</span>
        <span>
          Approximate time used (noon). House positions may differ.{" "}
          <Link
            href="/onboarding"
            className="font-medium text-amber-400 underline hover:text-amber-300"
          >
            Update birth time →
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 text-xl">⏰</div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-amber-300 mb-1">
            Surya Kundli Mode — Birth Time Not Set
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            This chart uses 12:00 noon as the default birth time.{" "}
            <strong className="text-slate-300">
              Planet sign positions are accurate
            </strong>
            , but house placements (Bhava) and the Ascendant (Lagna) may not be
            precise. For a fully accurate Kundli, please update your birth time.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            Update your birth time →
          </Link>
        </div>
      </div>
    </div>
  );
}
