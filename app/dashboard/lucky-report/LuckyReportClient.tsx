"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { LuckyNumberReport } from "@/lib/astrology/calculations/LuckyNumbers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  Gold: "bg-yellow-400", Orange: "bg-orange-400", Yellow: "bg-yellow-300",
  White: "bg-white", Silver: "bg-slate-300", Cream: "bg-amber-50",
  Purple: "bg-purple-500", Blue: "bg-blue-500", "Electric Blue": "bg-blue-400",
  Grey: "bg-slate-400", Green: "bg-green-500", "Light Grey": "bg-slate-300",
  Pink: "bg-pink-400", "Light Blue": "bg-sky-300", Violet: "bg-violet-500",
  Black: "bg-slate-900", "Dark Blue": "bg-blue-900", "Dark Grey": "bg-slate-600",
  Red: "bg-red-500", Crimson: "bg-red-700",
};

function ColorDot({ color }: { color: string }) {
  const cls = COLOR_MAP[color] ?? "bg-slate-500";
  return (
    <span className="flex items-center gap-1.5 text-sm text-slate-200">
      <span className={`w-4 h-4 rounded-full border border-white/20 shrink-0 ${cls}`} />
      {color}
    </span>
  );
}

function NumberBadge({ n, highlight }: { n: number; highlight?: boolean }) {
  return (
    <span className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm border ${
      highlight
        ? "bg-amber-500/20 border-amber-400 text-amber-300"
        : "bg-white/5 border-white/10 text-slate-300"
    }`}>{n}</span>
  );
}

function SectionCard({ title, children, accent = "slate" }: { title: string; children: React.ReactNode; accent?: string }) {
  const accents: Record<string, string> = {
    amber: "border-amber-500/20 bg-amber-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    rose: "border-rose-500/20 bg-rose-500/5",
    slate: "border-slate-700 bg-slate-800/40",
  };
  return (
    <div className={`rounded-2xl border p-5 ${accents[accent] ?? accents.slate}`}>
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Report Display ───────────────────────────────────────────────────────────

function ReportDisplay({ report, onDownloadPdf, downloading }: {
  report: LuckyNumberReport;
  onDownloadPdf: () => void;
  downloading: boolean;
}) {
  const lp = report.lifePathProfile;
  const bn = report.birthNumberProfile;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">✨ Your Primary Lucky Number</p>
            <div className="flex items-center gap-4">
              <span className="text-6xl font-black text-amber-400">{report.lifePathNumber}</span>
              <div>
                <p className="text-white font-semibold text-lg">Life Path {report.lifePathNumber} — {lp.planet} {lp.planetEmoji}</p>
                <p className="text-slate-300 text-sm">{lp.nature}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <span className="text-slate-300">📅 {lp.luckyDays.join(", ")}</span>
              <span className="text-slate-300">🧭 {lp.luckyDirection}</span>
              <span className="text-slate-300">💍 {lp.luckyGemstone}</span>
              <span className="text-slate-300">⚙️ {lp.luckyMetal}</span>
            </div>
          </div>
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading ? <><span className="animate-spin">⏳</span> Generating...</> : <><span>📥</span> Download PDF</>}
          </button>
        </div>
      </div>

      {/* 3-number summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title={`🔢 Life Path ${report.lifePathNumber}`} accent="amber">
          <p className="text-slate-400 text-xs mb-3">Your primary number — overall life purpose</p>
          <p className="text-slate-200 text-sm font-medium mb-1">{lp.planet} {lp.planetEmoji}</p>
          <p className="text-slate-300 text-sm">{lp.nature}</p>
        </SectionCard>
        <SectionCard title={`🎂 Birth Number ${report.birthNumber}`} accent="purple">
          <p className="text-slate-400 text-xs mb-3">Day of birth — your innate personality</p>
          <p className="text-slate-200 text-sm font-medium mb-1">{bn.planet} {bn.planetEmoji}</p>
          <p className="text-slate-300 text-sm">{bn.nature}</p>
        </SectionCard>
        {report.nameNumber && report.nameNumberProfile ? (
          <SectionCard title={`📝 Name Number ${report.nameNumber}`} accent="blue">
            <p className="text-slate-400 text-xs mb-3">Your name's vibration</p>
            <p className="text-slate-200 text-sm font-medium mb-1">{report.nameNumberProfile.planet} {report.nameNumberProfile.planetEmoji}</p>
            <p className="text-slate-300 text-sm">{report.nameNumberProfile.nature}</p>
          </SectionCard>
        ) : (
          <SectionCard title="📝 Name Number" accent="slate">
            <p className="text-slate-400 text-sm">Enter your full name above to calculate your Name Number vibration.</p>
          </SectionCard>
        )}
      </div>

      {/* Lucky Colors */}
      <SectionCard title="🎨 Lucky Colors" accent="emerald">
        <div className="flex flex-wrap gap-4">
          {lp.luckyColors.map(c => <ColorDot key={c} color={c} />)}
        </div>
        <p className="text-xs text-slate-500 mt-3">Wearing these colors amplifies your {lp.planet}'s energy on {lp.luckyDays.join(" / ")}.</p>
      </SectionCard>

      {/* Lucky Numbers grid */}
      <SectionCard title="🔢 Your Lucky Number Set" accent="amber">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-2">Primary lucky numbers</p>
            <div className="flex gap-2">
              {report.luckyNumbers.map(n => <NumberBadge key={n} n={n} highlight />)}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Additional compatible numbers</p>
            <div className="flex gap-2">
              {report.additionalLuckyNumbers.map(n => <NumberBadge key={n} n={n} />)}
            </div>
          </div>
          <p className="text-xs text-slate-500">Use these for important decisions: house/phone numbers, business dates, investment amounts.</p>
        </div>
      </SectionCard>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="💪 Core Strengths" accent="emerald">
          <ul className="space-y-2">
            {lp.strengths.map(s => (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-emerald-400">✓</span> {s}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="⚠️ Watch Out For" accent="rose">
          <ul className="space-y-2">
            {lp.challenges.map(c => (
              <li key={c} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-rose-400">•</span> {c}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Finance & Mantra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="💰 Financial Tendency" accent="blue">
          <p className="text-sm text-slate-200">{lp.financialTendency}</p>
        </SectionCard>
        <SectionCard title="🙏 Daily Mantra" accent="purple">
          <p className="text-lg font-semibold text-purple-300 mb-1">{lp.mantra}</p>
          <p className="text-xs text-slate-400">Chant 108 times daily, especially on {lp.luckyDays.join(" / ")}.</p>
          <p className="text-xs text-slate-500 mt-2">Deity: {lp.deity}</p>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────

function InputForm({ onSubmit, loading }: { onSubmit: (name: string, dob: string, fullName: string) => void; loading: boolean }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [fullName, setFullName] = useState("");

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <span className="text-5xl">🔢</span>
        <h2 className="text-2xl font-bold text-white mt-3">Discover Your Lucky Numbers</h2>
        <p className="text-slate-400 text-sm mt-1">Enter your birth details to generate a personalised report</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Your Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rahul"
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Full Name for Name Number <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Rahul Sharma (as on birth certificate)"
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => { if (name && dob) onSubmit(name, dob, fullName); }}
          disabled={!name || !dob || loading}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          {loading ? "Calculating..." : "✨ Generate My Lucky Report"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LuckyReportClient() {
  const [report, setReport] = useState<LuckyNumberReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (name: string, dob: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/numerology/lucky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, fullName: fullName || undefined }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      setReport(await res.json() as LuckyNumberReport);
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const lp = report.lifePathProfile;
      const bn = report.birthNumberProfile;
      const content = [
        `# Lucky Number & Numerology Report for ${report.name}`,
        ``,
        `**Date of Birth:** ${report.dob}`,
        ``,
        `## Life Path Number: ${report.lifePathNumber} — ${lp.planet} ${lp.planetEmoji}`,
        lp.nature,
        ``,
        `## Birth Number: ${report.birthNumber} — ${bn.planet} ${bn.planetEmoji}`,
        bn.nature,
        ``,
        report.nameNumber ? `## Name Number: ${report.nameNumber}` : "",
        ``,
        `## Lucky Colors`,
        ...lp.luckyColors.map(c => `- ${c}`),
        ``,
        `## Lucky Days`,
        ...lp.luckyDays.map(d => `- ${d}`),
        ``,
        `## Lucky Gemstone`,
        `- ${lp.luckyGemstone}`,
        ``,
        `## Lucky Metal`,
        `- ${lp.luckyMetal}`,
        ``,
        `## Lucky Direction`,
        `- ${lp.luckyDirection}`,
        ``,
        `## Lucky Numbers`,
        `Primary: ${report.luckyNumbers.join(", ")}`,
        `Additional: ${report.additionalLuckyNumbers.join(", ")}`,
        ``,
        `## Strengths`,
        ...lp.strengths.map(s => `- ${s}`),
        ``,
        `## Challenges`,
        ...lp.challenges.map(c => `- ${c}`),
        ``,
        `## Financial Tendency`,
        lp.financialTendency,
        ``,
        `## Daily Mantra`,
        lp.mantra,
        `Chant 108 times daily, especially on ${lp.luckyDays.join(" / ")}.`,
        `Deity: ${lp.deity}`,
      ].filter(l => l !== undefined).join("\n");

      await exportAIReportAsPdf({
        chartName: report.name,
        content,
        fileName: `${report.name.replace(/\s+/g, "_")}_Lucky_Numbers.pdf`,
        title: "Lucky Number & Numerology Report",
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
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}
      {!report ? (
        <InputForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <>
          <button
            onClick={() => setReport(null)}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Try another name / date
          </button>
          <ReportDisplay report={report} onDownloadPdf={handleDownloadPdf} downloading={downloading} />
        </>
      )}
    </div>
  );
}
