"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { BusinessNameReport } from "@/lib/numerology/NumerologyCalculator";

const COMPAT_STYLES = {
  Excellent:   { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", badge: "bg-emerald-500/20", icon: "🌟" },
  Good:        { bg: "bg-green-500/15",   border: "border-green-500/30",   text: "text-green-300",   badge: "bg-green-500/20",   icon: "✅" },
  Average:     { bg: "bg-yellow-500/15",  border: "border-yellow-500/30",  text: "text-yellow-300",  badge: "bg-yellow-500/20",  icon: "🔶" },
  Neutral:     { bg: "bg-slate-600/30",   border: "border-slate-600",      text: "text-slate-300",   badge: "bg-slate-600/30",   icon: "⚖️" },
  Challenging: { bg: "bg-red-500/15",     border: "border-red-500/30",     text: "text-red-300",     badge: "bg-red-500/20",     icon: "⚠️" },
};

function BusinessNameCard({ result, rank }: { result: BusinessNameReport["results"][0]; rank: number }) {
  const s = COMPAT_STYLES[result.compatibility];
  return (
    <div className={`rounded-2xl border p-5 transition-all ${s.border} ${s.bg} ${result.isTopPick ? "ring-2 ring-amber-400/40" : ""}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${result.isTopPick ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300"}`}>
            {rank}
          </span>
          <div>
            <p className="font-bold text-white text-lg">{result.name}</p>
            {result.isTopPick && (
              <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">⭐ Top Pick</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-black ${s.text}`}>{result.compatiblityScore}%</p>
          <p className="text-xs text-slate-400">compatibility</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full border ${s.badge} ${s.border} ${s.text}`}>
          {s.icon} {result.compatibility}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          Destiny {result.destinyNumber} — {result.keyword}
        </span>
      </div>

      <p className="text-sm text-slate-300 mb-3">{result.recommendation}</p>

      {result.strengths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.strengths.map(s => (
            <span key={s} className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportDisplay({ report, downloading, onDownload }: {
  report: BusinessNameReport;
  downloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/15 to-orange-900/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">🏆 Top Business Name Pick</p>
            <h2 className="text-3xl font-black text-white">{report.topPickName}</h2>
            <p className="text-slate-300 text-sm mt-1">
              Your Life Path {report.ownerLifePathNumber} — {report.ownerLifePathKeyword}
            </p>
          </div>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading ? <><span className="animate-spin">⏳</span> Generating...</> : <><span>📥</span> Download PDF</>}
          </button>
        </div>
        <p className="text-slate-400 text-sm mt-4 border-t border-white/10 pt-4">{report.generalAdvice}</p>
      </div>

      {/* Ranked results */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">All Names Ranked</h3>
        {report.results.map((r, i) => (
          <BusinessNameCard key={r.name} result={r} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function InputForm({ onSubmit, loading }: {
  onSubmit: (names: string[], ownerDob: string) => void;
  loading: boolean;
}) {
  const [names, setNames] = useState(["", "", "", "", ""]);
  const [ownerDob, setOwnerDob] = useState("");

  const update = (val: string, idx: number) => {
    const next = [...names];
    next[idx] = val;
    setNames(next);
  };

  const validNames = names.filter(n => n.trim().length > 0);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-5xl">🏢</span>
        <h2 className="text-2xl font-bold text-white mt-3">Find Your Best Business Name</h2>
        <p className="text-slate-400 text-sm mt-1">Enter up to 5 proposed names. We'll rank them by numerological compatibility with your life path.</p>
      </div>

      <div className="space-y-3 mb-4">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-4">{i + 1}.</span>
            <input
              type="text"
              value={n}
              onChange={e => update(e.target.value, i)}
              placeholder={i === 0 ? "e.g. ShriStar Technologies" : `Business name option ${i + 1} (optional)`}
              className="flex-1 rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="mb-5">
        <label className="block text-sm text-slate-400 mb-1">Owner's Date of Birth *</label>
        <input
          type="date"
          value={ownerDob}
          onChange={e => setOwnerDob(e.target.value)}
          className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
        />
        <p className="text-xs text-slate-500 mt-1">Used to calculate your Life Path Number for compatibility scoring.</p>
      </div>

      <button
        onClick={() => { if (validNames.length > 0 && ownerDob) onSubmit(validNames, ownerDob); }}
        disabled={validNames.length === 0 || !ownerDob || loading}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
      >
        {loading ? "Analysing..." : "🔍 Rank My Business Names"}
      </button>
    </div>
  );
}

export default function BusinessNameClient() {
  const [report, setReport] = useState<BusinessNameReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (names: string[], ownerDob: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/numerology/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedNames: names, ownerDob }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as BusinessNameReport);
    } catch {
      setError("Failed to analyse business names. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const content = [
        `# Business Name Numerology Report`,
        ``,
        `**Owner Life Path:** ${report.ownerLifePathNumber} — ${report.ownerLifePathKeyword}`,
        `**Top Pick:** ${report.topPickName}`,
        ``,
        `## General Advice`,
        report.generalAdvice,
        ``,
        `## Name Rankings`,
        ...report.results.map((r, i) => [
          ``,
          `### ${i + 1}. ${r.name}${r.isTopPick ? " ⭐ Top Pick" : ""}`,
          `Destiny Number: ${r.destinyNumber} — ${r.keyword}`,
          `Compatibility: ${r.compatibility} (${r.compatiblityScore}%)`,
          r.recommendation,
          `Strengths: ${r.strengths.join(", ")}`,
        ].join("\n")),
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: "Business Name Analysis",
        content,
        fileName: `Business_Name_Numerology.pdf`,
        title: "Business Name Numerology Report",
      });
    } catch {
      setError("PDF download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}
      {!report ? (
        <InputForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <>
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            ← Try different names
          </button>
          <ReportDisplay report={report} downloading={downloading} onDownload={handleDownload} />
        </>
      )}
    </div>
  );
}
