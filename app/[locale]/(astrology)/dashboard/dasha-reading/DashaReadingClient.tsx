"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { DashaResult, Mahadasha } from "@/lib/astrology/calculations/DashaCalculator";

const PLANET_EMOJI: Record<string, string> = {
  Sun: "☀️", Moon: "🌙", Mars: "♂️", Mercury: "☿", Jupiter: "♃",
  Venus: "♀️", Saturn: "♄", Rahu: "🐍", Ketu: "☄️",
};

const PLANET_MEANING: Record<string, string> = {
  Sun: "Ego, father, authority, career, vitality",
  Moon: "Mind, mother, emotions, home, instincts",
  Mars: "Energy, courage, siblings, property, drive",
  Mercury: "Intellect, communication, trade, learning",
  Jupiter: "Wisdom, fortune, children, teachers, expansion",
  Venus: "Love, beauty, luxury, creativity, relationships",
  Saturn: "Discipline, karma, delays, service, longevity",
  Rahu: "Ambition, illusion, foreign, technology, obsession",
  Ketu: "Detachment, spirituality, past life, liberation",
};

export default function DashaReadingClient() {
  const [birthDate, setBirthDate] = useState("");
  const [moonLon, setMoonLon] = useState("");
  const [report, setReport] = useState<DashaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedMaha, setExpandedMaha] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!birthDate) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/dasha-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          moonLongitude: moonLon ? parseFloat(moonLon) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as DashaResult);
    } catch { setError("Failed to calculate Dasha periods. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const dashaLines = report.mahadashas.flatMap(m => [
        ``,
        `### ${m.planet} Mahadasha (${m.duration_years}y) — ${m.start_date} → ${m.end_date}${m.is_current ? " ← CURRENT" : ""}`,
        ...m.antardashas.filter(a => a.is_current || m.is_current).map(a =>
          `  - ${a.planet} Antardasha: ${a.start_date} → ${a.end_date}${a.is_current ? " ← NOW" : ""}`
        ),
      ]);

      const content = [
        `# Vimshottari Dasha Reading`,
        `**Birth Nakshatra:** ${report.birthNakshatra}`,
        `**Nakshatra Lord:** ${report.nakshatraLord}`,
        `**Moon Longitude:** ${report.moonLongitude}°`,
        `**Current Mahadasha:** ${report.currentMahadasha ?? "—"}`,
        `**Current Antardasha:** ${report.currentAntardasha ?? "—"}`,
        ``,
        `## Mahadasha Timeline`,
        ...dashaLines,
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: `Dasha Reading`,
        content,
        fileName: `Dasha_Reading.pdf`,
        title: "Vimshottari Dasha Periods",
      });
    } catch { setError("PDF download failed."); }
    finally { setDownloading(false); }
  };

  const MahaCard = ({ m }: { m: Mahadasha }) => {
    const isOpen = expandedMaha === m.planet + m.start_date;
    return (
      <div className={`rounded-xl border transition-all ${m.is_current ? "border-amber-500/40 bg-amber-500/10" : "border-white/10 bg-white/5"}`}>
        <button
          onClick={() => setExpandedMaha(isOpen ? null : m.planet + m.start_date)}
          className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{PLANET_EMOJI[m.planet] ?? "⚪"}</span>
            <div>
              <p className="text-white font-semibold text-sm">
                {m.planet} Mahadasha
                {m.is_current && <span className="ml-2 text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Current</span>}
              </p>
              <p className="text-slate-500 text-xs">{m.start_date} → {m.end_date} ({m.duration_years}y)</p>
            </div>
          </div>
          <span className="text-slate-500">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
            <p className="text-xs text-slate-400">{PLANET_MEANING[m.planet]}</p>
            <div className="space-y-1">
              {m.antardashas.map(a => (
                <div key={a.planet + a.start_date}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${a.is_current ? "bg-amber-500/15 border border-amber-500/30 text-amber-200" : "bg-slate-800/60 text-slate-400"}`}>
                  <span className="flex items-center gap-2">
                    <span>{PLANET_EMOJI[a.planet] ?? "⚪"}</span>
                    <span className="font-medium">{a.planet}</span>
                    {a.is_current && <span className="font-bold text-amber-300">(Now)</span>}
                  </span>
                  <span>{a.start_date} → {a.end_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date of Birth *</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-indigo-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Moon Longitude <span className="text-slate-600">(optional — degrees 0–360 from birth chart, more accurate)</span>
              </label>
              <input type="number" min="0" max="360" step="0.01" placeholder="e.g. 124.5"
                value={moonLon} onChange={e => setMoonLon(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-indigo-500/50 focus:outline-none" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!birthDate || loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Calculating Dashas…" : "🔭 Calculate Dasha Periods"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New reading</button>

          {/* Hero */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">🌌 Vimshottari Dasha</p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {report.currentMahadasha ?? "—"} Mahadasha
                  {report.currentAntardasha && <span className="text-amber-300"> / {report.currentAntardasha} Antardasha</span>}
                </h2>
                <p className="text-slate-400 text-sm">Birth Nakshatra: <span className="text-white font-semibold">{report.birthNakshatra}</span> · Ruled by {report.nakshatraLord}</p>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm disabled:opacity-50">
                {downloading ? "⏳" : "📥"} PDF
              </button>
            </div>

            {/* Current explanations */}
            {report.currentMahadasha && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-500 mb-1">Current {report.currentMahadasha} Mahadasha governs:</p>
                <p className="text-sm text-slate-200">{PLANET_MEANING[report.currentMahadasha]}</p>
              </div>
            )}
          </div>

          {/* All Mahadashas */}
          <div>
            <p className="text-sm text-slate-400 font-semibold mb-3 uppercase tracking-wide">Full Dasha Timeline</p>
            <div className="space-y-2">
              {report.mahadashas.map(m => <MahaCard key={m.planet + m.start_date} m={m} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
