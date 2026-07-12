"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { BabyNameReport } from "@/lib/astrology/calculations/BabyNames";

const COMPAT_COLORS: Record<string, string> = {
  Excellent:   "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  Good:        "text-green-300 bg-green-500/15 border-green-500/30",
  Average:     "text-yellow-300 bg-yellow-500/15 border-yellow-500/30",
  Neutral:     "text-slate-300 bg-slate-600/20 border-slate-600/40",
  Challenging: "text-red-300 bg-red-500/15 border-red-500/30",
};
const COMPAT_STARS: Record<string, string> = {
  Excellent: "🌟🌟🌟🌟🌟", Good: "🌟🌟🌟🌟", Average: "🌟🌟🌟",
  Neutral: "🌟🌟", Challenging: "🌟",
};

function PadaCard({ suggestion, gender }: {
  suggestion: BabyNameReport["suggestions"][0];
  gender: "Male" | "Female" | "Any";
}) {
  const names: string[] = [
    ...(gender !== "Female" ? suggestion.maleSuggestions : []),
    ...(gender !== "Male" ? suggestion.femaleSuggestions : []),
    ...suggestion.neutralSuggestions,
  ];
  const compat = suggestion.compatibilityWithParent;
  const compatStyle = compat ? COMPAT_COLORS[compat] : "text-slate-300 bg-slate-700/30 border-slate-600/40";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-3xl font-black text-amber-400">{suggestion.syllable}</span>
          <span className="ml-2 text-sm text-slate-400">=</span>
          <span className="ml-2 text-sm text-slate-300 font-medium">{suggestion.numerologyValue} ({suggestion.numerologyMeaning})</span>
        </div>
        {compat && (
          <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${compatStyle}`}>
            {COMPAT_STARS[compat]} {compat}
          </span>
        )}
      </div>

      {names.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {names.map(name => (
            <span key={name} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm rounded-xl font-medium">
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm italic">
          Classical suggestions for this pada: start your search with "{suggestion.syllable}…"
        </p>
      )}
    </div>
  );
}

function ReportDisplay({ report, downloading, onDownload }: {
  report: BabyNameReport;
  downloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Nakshatra Hero */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">🌙 Moon Nakshatra</p>
            <h2 className="text-3xl font-black text-white">{report.nakshatra}</h2>
            <p className="text-slate-300 text-sm mt-1">
              Nakshatra #{report.nakshatraNumber} · Ruled by {report.nakshatraDeity}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {report.auspiciousSyllables.map(s => (
                <span key={s} className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading ? <><span className="animate-spin">⏳</span> Generating...</> : <><span>📥</span> Download PDF</>}
          </button>
        </div>
        <p className="text-slate-400 text-sm mt-4 border-t border-white/10 pt-4">{report.generalGuidance}</p>
      </div>

      {/* Padas */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Name Suggestions by Pada (Syllable)
          {report.parentLifePathNumber && (
            <span className="ml-2 text-xs font-normal text-slate-500">sorted by compatibility with parent's Life Path {report.parentLifePathNumber}</span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.suggestions.map(s => (
            <PadaCard key={s.syllable} suggestion={s} gender={report.gender} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InputForm({ onSubmit, loading }: {
  onSubmit: (moonLong: number, gender: "Male" | "Female" | "Any", parentDob: string) => void;
  loading: boolean;
}) {
  const [moonLong, setMoonLong] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Any">("Any");
  const [parentDob, setParentDob] = useState("");

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <span className="text-5xl">👶</span>
        <h2 className="text-2xl font-bold text-white mt-3">Vedic Baby Name Suggestions</h2>
        <p className="text-slate-400 text-sm mt-1">Based on the baby's Moon nakshatra at birth.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Moon Longitude at Birth * <span className="text-slate-500">(0–360°, sidereal)</span></label>
          <input
            type="number"
            min="0" max="360" step="0.01"
            value={moonLong}
            onChange={e => setMoonLong(e.target.value)}
            placeholder="e.g. 145.5 (from birth chart)"
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">
            Generate a birth chart in "Kundli Generator" first. The Moon's sidereal longitude (0–360°) is on the planets table.
          </p>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Baby's Gender</label>
          <div className="flex gap-2">
            {(["Any", "Male", "Female"] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                  gender === g
                    ? "bg-purple-500 border-purple-400 text-white"
                    : "bg-slate-800 border-white/10 text-slate-400 hover:border-purple-500/40"
                }`}
              >
                {g === "Any" ? "🌈 Any" : g === "Male" ? "👦 Boy" : "👧 Girl"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Parent's Date of Birth <span className="text-slate-500">(for name compatibility)</span>
          </label>
          <input
            type="date"
            value={parentDob}
            onChange={e => setParentDob(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => {
            const ml = parseFloat(moonLong);
            if (!isNaN(ml) && ml >= 0 && ml <= 360) onSubmit(ml, gender, parentDob);
          }}
          disabled={!moonLong || isNaN(parseFloat(moonLong)) || loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          {loading ? "Finding Names..." : "✨ Find Auspicious Names"}
        </button>
      </div>
    </div>
  );
}

export default function BabyNamesClient() {
  const [report, setReport] = useState<BabyNameReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (moonLong: number, gender: "Male" | "Female" | "Any", parentDob: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/baby-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moonLongitude: moonLong, gender, parentDob: parentDob || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as BabyNameReport);
    } catch {
      setError("Failed to generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const content = [
        `# Vedic Baby Name Suggestions`,
        ``,
        `**Nakshatra:** ${report.nakshatra} (#${report.nakshatraNumber}) — ${report.nakshatraDeity}`,
        `**Auspicious Syllables:** ${report.auspiciousSyllables.join(", ")}`,
        report.parentLifePathNumber ? `**Parent Life Path:** ${report.parentLifePathNumber}` : "",
        ``,
        `## Guidance`,
        report.generalGuidance,
        ``,
        `## Name Suggestions by Pada`,
        ...report.suggestions.flatMap(s => [
          ``,
          `### Syllable "${s.syllable}" (Numerology ${s.numerologyValue} — ${s.numerologyMeaning})`,
          s.compatibilityWithParent ? `Compatibility with parent: ${s.compatibilityWithParent}` : "",
          s.maleSuggestions.length ? `Boy names: ${s.maleSuggestions.join(", ")}` : "",
          s.femaleSuggestions.length ? `Girl names: ${s.femaleSuggestions.join(", ")}` : "",
          s.neutralSuggestions.length ? `Neutral: ${s.neutralSuggestions.join(", ")}` : "",
        ].filter(Boolean)),
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: "Baby Name Suggestions",
        content,
        fileName: `Baby_Name_${report.nakshatra.replace(/\s+/g, "_")}.pdf`,
        title: "Vedic Baby Name Suggestions",
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
            ← Try different details
          </button>
          <ReportDisplay report={report} downloading={downloading} onDownload={handleDownload} />
        </>
      )}
    </div>
  );
}
