"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { MuhuratReport, MuhuratSlot, MuhuratType } from "@/lib/astrology/calculations/Muhurat";

// ─── Event type config ────────────────────────────────────────────────────────

const EVENT_TYPES: { type: MuhuratType; emoji: string; label: string; color: string }[] = [
  { type: "Marriage",       emoji: "💍", label: "Marriage",       color: "from-rose-500 to-pink-500" },
  { type: "GrihaPravesh",   emoji: "🏠", label: "Griha Pravesh",  color: "from-amber-500 to-orange-500" },
  { type: "BusinessOpening",emoji: "🏢", label: "Business",       color: "from-blue-500 to-indigo-500" },
  { type: "NamingCeremony", emoji: "👶", label: "Naming",         color: "from-purple-500 to-fuchsia-500" },
  { type: "Travel",         emoji: "✈️", label: "Travel",         color: "from-emerald-500 to-teal-500" },
];

const QUALITY_CONFIG = {
  Excellent:   { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", badge: "bg-emerald-500", dot: "bg-emerald-400" },
  Good:        { bg: "bg-green-500/15",   border: "border-green-500/30",   text: "text-green-300",   badge: "bg-green-500",   dot: "bg-green-400" },
  Average:     { bg: "bg-yellow-500/15",  border: "border-yellow-500/30",  text: "text-yellow-300",  badge: "bg-yellow-500",  dot: "bg-yellow-400" },
  Avoid:       { bg: "bg-red-500/15",     border: "border-red-500/30",     text: "text-red-300",     badge: "bg-red-500",     dot: "bg-red-400" },
};

// ─── Panchang Details ─────────────────────────────────────────────────────────

function PanchangBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
      <span className="text-xs text-slate-500 mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-white truncate max-w-[90px]">{value}</span>
    </div>
  );
}

// ─── Single Day Card ──────────────────────────────────────────────────────────

function SlotCard({ slot, rank }: { slot: MuhuratSlot; rank?: number }) {
  const [expanded, setExpanded] = useState(false);
  const q = QUALITY_CONFIG[slot.quality];

  const dateObj = new Date(slot.date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "long" });
  const displayDate = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className={`rounded-2xl border transition-all ${q.border} ${q.bg}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {rank && (
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${q.badge}`}>
                {rank}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{displayDate}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.badge} bg-opacity-20 ${q.text}`}>
                  {slot.quality}
                </span>
              </div>
              <p className="text-xs text-slate-400">{dayName} · Score: {slot.score}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${q.dot}`} />
            <span className="text-slate-400 text-sm">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Panchang mini-row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <PanchangBadge label="Tithi" value={slot.panchang.tithiName} />
          <PanchangBadge label="Vara" value={slot.panchang.varaName} />
          <PanchangBadge label="Nakshatra" value={slot.panchang.nakshatraName} />
          <PanchangBadge label="Yoga" value={slot.panchang.yogaName} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-xs text-emerald-400 mb-1">✅ Auspicious Window</p>
              <p className="text-sm font-semibold text-white">{slot.auspiciousWindow}</p>
            </div>
            {slot.avoidWindow && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-xs text-red-400 mb-1">⚠️ Avoid</p>
                <p className="text-sm font-semibold text-white">{slot.avoidWindow}</p>
              </div>
            )}
          </div>

          {/* Positives */}
          {slot.positives.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Why it's good</p>
              <ul className="space-y-1">
                {slot.positives.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cautions */}
          {slot.cautions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cautions</p>
              <ul className="space-y-1">
                {slot.cautions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-200">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-slate-300 italic border-t border-white/10 pt-3">
            {slot.overallVerdict}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Report Display ───────────────────────────────────────────────────────────

function ReportDisplay({ report, onDownload, downloading }: {
  report: MuhuratReport;
  onDownload: () => void;
  downloading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"top" | "all">("top");
  const allSlots = report.slots;
  const topSlots = report.topSlots;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">📅 {report.muhuratLabel}</p>
            <h2 className="text-2xl font-bold text-white mb-1">{report.summary}</h2>
            <p className="text-slate-400 text-sm">
              Scanned {report.totalDaysScanned} days · {report.queryRange.from} → {report.queryRange.to}
            </p>
          </div>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading ? <><span className="animate-spin">⏳</span> Generating…</> : <><span>📥</span> Download PDF</>}
          </button>
        </div>

        {/* Quality summary */}
        <div className="flex flex-wrap gap-3 mt-4">
          {(["Excellent", "Good", "Average", "Avoid"] as const).map(q => {
            const count = allSlots.filter(s => s.quality === q).length;
            const cfg = QUALITY_CONFIG[q];
            return (
              <div key={q} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {count} {q}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab("top")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "top" ? "text-white border-b-2 border-amber-400" : "text-slate-400 hover:text-white"}`}
        >
          ⭐ Top Picks ({topSlots.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "all" ? "text-white border-b-2 border-amber-400" : "text-slate-400 hover:text-white"}`}
        >
          📅 All Days ({allSlots.length})
        </button>
      </div>

      {/* Cards */}
      {activeTab === "top" ? (
        topSlots.length > 0 ? (
          <div className="space-y-4">
            {topSlots.map((slot, i) => <SlotCard key={slot.date} slot={slot} rank={i + 1} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">🔍</p>
            <p>No excellent or good dates found in this range.</p>
            <p className="text-sm mt-1">Try extending the date range.</p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {allSlots.map(slot => <SlotCard key={slot.date} slot={slot} />)}
        </div>
      )}
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────

function InputForm({ onSubmit, loading }: {
  onSubmit: (type: MuhuratType, from: string, to: string) => void;
  loading: boolean;
}) {
  const [selectedType, setSelectedType] = useState<MuhuratType>("Marriage");
  const today = new Date().toISOString().split("T")[0] as string;
  const threeMonths = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0] as string;
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(threeMonths);

  return (
    <div className="space-y-6">
      {/* Event type selector */}
      <div>
        <p className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Select Event Type</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {EVENT_TYPES.map(et => (
            <button
              key={et.type}
              onClick={() => setSelectedType(et.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                selectedType === et.type
                  ? "border-white/30 bg-white/10 ring-2 ring-white/20"
                  : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
              }`}
            >
              <span className="text-3xl">{et.emoji}</span>
              <span className="text-xs font-semibold text-white text-center leading-tight">{et.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">From Date *</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            min={today}
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">To Date *</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            min={fromDate}
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>
      <p className="text-xs text-slate-500 -mt-2">Maximum scan window: 90 days.</p>

      <button
        onClick={() => { if (fromDate && toDate) onSubmit(selectedType, fromDate, toDate); }}
        disabled={!fromDate || !toDate || loading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-base"
      >
        {loading ? "Calculating Muhurat…" : `✨ Find ${EVENT_TYPES.find(e => e.type === selectedType)?.label} Muhurat`}
      </button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function MuhuratClient() {
  const [report, setReport] = useState<MuhuratReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (type: MuhuratType, from: string, to: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/muhurat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muhuratType: type, fromDate: from, toDate: to }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as MuhuratReport);
    } catch {
      setError("Failed to calculate muhurat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const topLines = report.topSlots.flatMap(s => [
        ``,
        `### ${s.date} — ${s.quality} (${s.score}/100)`,
        `Tithi: ${s.panchang.tithiName} | Vara: ${s.panchang.varaName} | Nakshatra: ${s.panchang.nakshatraName} | Yoga: ${s.panchang.yogaName}`,
        `Auspicious Window: ${s.auspiciousWindow}`,
        s.avoidWindow ? `Avoid: ${s.avoidWindow}` : "",
        s.positives.map(p => `✓ ${p}`).join("\n"),
        s.cautions.map(c => `• ${c}`).join("\n"),
        s.overallVerdict,
      ].filter(Boolean));

      const content = [
        `# ${report.muhuratLabel}`,
        ``,
        `**Date Range:** ${report.queryRange.from} → ${report.queryRange.to}`,
        `**Days Scanned:** ${report.totalDaysScanned}`,
        ``,
        `## Summary`,
        report.summary,
        ``,
        `## Top Muhurat Dates`,
        ...topLines,
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: report.muhuratLabel,
        content,
        fileName: `${report.muhuratType}_Muhurat.pdf`,
        title: report.muhuratLabel,
      });
    } catch {
      setError("PDF download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      )}
      {!report ? (
        <InputForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <>
          <button
            onClick={() => setReport(null)}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Search again
          </button>
          <ReportDisplay report={report} onDownload={handleDownload} downloading={downloading} />
        </>
      )}
    </div>
  );
}
