"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { NameNumerologyReport } from "@/lib/numerology/NumerologyCalculator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMPAT_CONFIG = {
  Excellent: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", icon: "🌟" },
  Good:      { bg: "bg-green-500/20",   text: "text-green-300",   border: "border-green-500/30",   icon: "✅" },
  Average:   { bg: "bg-yellow-500/20",  text: "text-yellow-300",  border: "border-yellow-500/30",  icon: "🔶" },
  Neutral:   { bg: "bg-slate-500/20",   text: "text-slate-300",   border: "border-slate-500/30",   icon: "⚖️" },
  Challenging:{ bg: "bg-red-500/20",    text: "text-red-300",     border: "border-red-500/30",     icon: "⚠️" },
};

function NumberCard({
  title,
  number,
  keyword,
  planet,
  planetEmoji,
  description,
  accent = "slate",
}: {
  title: string;
  number: number;
  keyword: string;
  planet: string;
  planetEmoji: string;
  description: string;
  accent?: "amber" | "purple" | "blue" | "emerald" | "slate";
}) {
  const styles = {
    amber:   "border-amber-500/20 bg-amber-500/5",
    purple:  "border-purple-500/20 bg-purple-500/5",
    blue:    "border-blue-500/20 bg-blue-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    slate:   "border-slate-700 bg-slate-800/30",
  };
  const nums = {
    amber: "text-amber-400", purple: "text-purple-400",
    blue: "text-blue-400", emerald: "text-emerald-400", slate: "text-slate-300",
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[accent]}`}>
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-end gap-3 mb-3">
        <span className={`text-5xl font-black ${nums[accent]}`}>{number}</span>
        <div>
          <p className="text-white font-semibold leading-tight">{keyword}</p>
          <p className="text-slate-400 text-xs">{planet} {planetEmoji}</p>
        </div>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Letter Breakdown Grid ────────────────────────────────────────────────────

function LetterGrid({ breakdown }: { breakdown: NameNumerologyReport["letterBreakdown"] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 mb-3">Letter-by-Letter Breakdown</h3>
      <div className="flex flex-wrap gap-2">
        {breakdown.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-lg border text-xs font-bold ${
              item.isVowel
                ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                : "bg-blue-500/10 border-blue-500/20 text-blue-300"
            }`}
          >
            <span className="text-sm">{item.letter}</span>
            <span className="text-slate-400 text-[10px]">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-500/30 inline-block" /> Vowels (Soul Urge)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500/20 inline-block" /> Consonants (Personality)
        </span>
      </div>
    </div>
  );
}

// ─── Report Display ───────────────────────────────────────────────────────────

function ReportDisplay({
  report,
  onDownloadPdf,
  downloading,
}: {
  report: NameNumerologyReport;
  onDownloadPdf: () => void;
  downloading: boolean;
}) {
  const compat = report.destinyLifePathCompatibility;
  const compatCfg = compat ? COMPAT_CONFIG[compat] : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">📝 Numerology Profile</p>
            <h2 className="text-2xl font-bold text-white mb-1">{report.fullName}</h2>
            <p className="text-slate-400 text-sm">
              Cleaned: <span className="font-mono text-purple-300 tracking-widest text-xs">{report.cleanedName}</span>
              {" "}(Total = <span className="text-white">{report.currentTotal}</span>)
            </p>
          </div>
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading
              ? <><span className="animate-spin">⏳</span> Generating...</>
              : <><span>📥</span> Download PDF</>}
          </button>
        </div>
      </div>

      {/* Three core numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberCard
          title="Destiny Number (All letters)"
          number={report.destinyNumber}
          keyword={report.destinyProfile.keyword}
          planet={report.destinyProfile.planet}
          planetEmoji={report.destinyProfile.planetEmoji}
          description={report.destinyProfile.description}
          accent="amber"
        />
        <NumberCard
          title="Soul Urge (Vowels — inner desire)"
          number={report.soulUrgeNumber}
          keyword={report.soulUrgeProfile.keyword}
          planet={report.soulUrgeProfile.planet}
          planetEmoji={report.soulUrgeProfile.planetEmoji}
          description={report.soulUrgeProfile.description}
          accent="purple"
        />
        <NumberCard
          title="Personality (Consonants — outer image)"
          number={report.personalityNumber}
          keyword={report.personalityProfile.keyword}
          planet={report.personalityProfile.planet}
          planetEmoji={report.personalityProfile.planetEmoji}
          description={report.personalityProfile.description}
          accent="blue"
        />
      </div>

      {/* Letter grid */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
        <LetterGrid breakdown={report.letterBreakdown} />
      </div>

      {/* Compatibility (if DOB provided) */}
      {compat && report.lifePathNumber && compatCfg && (
        <div className={`rounded-2xl border p-5 ${compatCfg.bg} ${compatCfg.border}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Name vs Life Path Compatibility</p>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${compatCfg.text}`}>{report.destinyNumber}</span>
                <span className="text-slate-500 text-lg">⟷</span>
                <span className={`text-3xl font-black ${compatCfg.text}`}>{report.lifePathNumber}</span>
                <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${compatCfg.bg} ${compatCfg.border} ${compatCfg.text}`}>
                  {compatCfg.icon} {compat}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-xs">
              {compat === "Excellent" && "Your name strongly reinforces your life path. An ideal alignment."}
              {compat === "Good" && "Your name supports your life path well. Minor friction may arise."}
              {compat === "Average" && "Some alignment. The name's energy is neither a boost nor a blockage."}
              {compat === "Neutral" && "Neutral influence. Your name neither boosts nor blocks your path."}
              {compat === "Challenging" && "Your name's energy works against your life path. Consider a spelling adjustment."}
            </p>
          </div>
        </div>
      )}

      {/* Traits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 className="font-semibold text-white mb-3">💪 Positive Traits</h3>
          <ul className="space-y-2">
            {report.destinyProfile.positiveTraits.map(t => (
              <li key={t} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-emerald-400">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <h3 className="font-semibold text-white mb-3">⚠️ Tendencies to Watch</h3>
          <ul className="space-y-2">
            {report.destinyProfile.negativeTraits.map(t => (
              <li key={t} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-rose-400">•</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Life Path if provided */}
      {report.lifePathNumber && report.lifePathProfile && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Life Path Number</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-emerald-400">{report.lifePathNumber}</span>
            <div>
              <p className="text-white font-semibold">{report.lifePathProfile.keyword}</p>
              <p className="text-slate-400 text-xs">{report.lifePathProfile.planet} {report.lifePathProfile.planetEmoji}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-300">{report.lifePathProfile.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────

function InputForm({ onSubmit, loading }: {
  onSubmit: (fullName: string, dob: string) => void;
  loading: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <span className="text-5xl">📝</span>
        <h2 className="text-2xl font-bold text-white mt-3">Analyse Your Name</h2>
        <p className="text-slate-400 text-sm mt-1">
          Enter your full name (as on birth certificate) for the most accurate reading.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Rahul Kumar Sharma"
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">Include all name parts. Only A–Z letters are counted.</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Date of Birth <span className="text-slate-500">(for Life Path & compatibility)</span>
          </label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => { if (fullName.trim()) onSubmit(fullName.trim(), dob); }}
          disabled={!fullName.trim() || loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          {loading ? "Calculating..." : "✨ Analyse My Name"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NameNumerologyClient() {
  const [report, setReport] = useState<NameNumerologyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (fullName: string, dob: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/numerology/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, dob: dob || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as NameNumerologyReport);
    } catch {
      setError("Failed to analyse name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const content = [
        `# Name Numerology Report`,
        ``,
        `**Full Name:** ${report.fullName}`,
        report.lifePathNumber ? `**Life Path Number:** ${report.lifePathNumber}` : "",
        ``,
        `## Destiny Number: ${report.destinyNumber} — ${report.destinyProfile.keyword}`,
        `Planet: ${report.destinyProfile.planet} ${report.destinyProfile.planetEmoji}`,
        report.destinyProfile.description,
        ``,
        `### Positive Traits`,
        ...report.destinyProfile.positiveTraits.map(t => `- ${t}`),
        ``,
        `### Watch Out For`,
        ...report.destinyProfile.negativeTraits.map(t => `- ${t}`),
        ``,
        `## Soul Urge Number: ${report.soulUrgeNumber} — ${report.soulUrgeProfile.keyword}`,
        `(Based on vowels — your inner desires and motivations)`,
        `Planet: ${report.soulUrgeProfile.planet} ${report.soulUrgeProfile.planetEmoji}`,
        report.soulUrgeProfile.description,
        ``,
        `## Personality Number: ${report.personalityNumber} — ${report.personalityProfile.keyword}`,
        `(Based on consonants — how others perceive you)`,
        `Planet: ${report.personalityProfile.planet} ${report.personalityProfile.planetEmoji}`,
        report.personalityProfile.description,
        ``,
        report.lifePathNumber && report.destinyLifePathCompatibility
          ? [`## Name vs Life Path Compatibility`,
             `Destiny ${report.destinyNumber} ↔ Life Path ${report.lifePathNumber}: ${report.destinyLifePathCompatibility}`].join("\n")
          : "",
        ``,
        `## Letter-by-Letter Breakdown`,
        report.letterBreakdown.map(l => `${l.letter}=${l.value}${l.isVowel ? "(V)" : ""}`).join("  "),
        `Total raw sum: ${report.currentTotal} → reduced to ${report.destinyNumber}`,
      ].filter(Boolean).join("\n");

      await exportAIReportAsPdf({
        chartName: report.fullName,
        content,
        fileName: `${report.fullName.replace(/\s+/g, "_")}_Name_Numerology.pdf`,
        title: "Name Numerology Report",
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
            ← Analyse another name
          </button>
          <ReportDisplay report={report} onDownloadPdf={handleDownloadPdf} downloading={downloading} />
        </>
      )}
    </div>
  );
}
