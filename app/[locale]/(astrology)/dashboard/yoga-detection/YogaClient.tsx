"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { YogaDetectionResult } from "@/lib/astrology/calculations/YogaDetector";
import type { Yoga } from "@/types/astrology/birthChart.types";

const PLANET_FIELDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

const YOGA_TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string; border: string; bg: string }> = {
  raja:        { emoji: "👑", label: "Raja Yoga",        color: "text-amber-300",   border: "border-amber-500/30",  bg: "bg-amber-500/10" },
  dhana:       { emoji: "💰", label: "Dhana Yoga",       color: "text-yellow-300",  border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  mahapurusha: { emoji: "🌟", label: "Mahapurusha",      color: "text-purple-300",  border: "border-purple-500/30", bg: "bg-purple-500/10" },
  prosperity:  { emoji: "🐘", label: "Prosperity Yoga",  color: "text-emerald-300", border: "border-emerald-500/30",bg: "bg-emerald-500/10" },
};

const STRENGTH_CONFIG = {
  "very strong": { dot: "bg-emerald-400", text: "text-emerald-300" },
  strong:        { dot: "bg-blue-400",    text: "text-blue-300" },
  moderate:      { dot: "bg-amber-400",   text: "text-amber-300" },
  weak:          { dot: "bg-slate-400",   text: "text-slate-400" },
};

function YogaCard({ yoga }: { yoga: Yoga }) {
  const type = YOGA_TYPE_CONFIG[yoga.type] ?? YOGA_TYPE_CONFIG.raja!;
  const strength = STRENGTH_CONFIG[yoga.strength as keyof typeof STRENGTH_CONFIG] ?? STRENGTH_CONFIG.moderate;
  return (
    <div className={`rounded-xl border p-4 ${type.border} ${type.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{type.emoji}</span>
          <div>
            <p className={`font-bold text-sm ${type.color}`}>{yoga.name}</p>
            <p className="text-xs text-slate-500">{type.label}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${strength.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${strength.dot}`} />
          {yoga.strength}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-1">{yoga.description}</p>
      <p className="text-xs text-white/90 leading-relaxed">{yoga.effect}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {yoga.planets.map(p => (
          <span key={p} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs text-slate-300">{p}</span>
        ))}
      </div>
    </div>
  );
}

export default function YogaDetectionClient() {
  const [planets, setPlanets] = useState<Record<string, string>>(
    Object.fromEntries(PLANET_FIELDS.map(p => [p, ""]))
  );
  const [ascendant, setAscendant] = useState("");
  const [report, setReport] = useState<YogaDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeType, setActiveType] = useState<string>("all");

  const isValid = PLANET_FIELDS.every(p => planets[p] && !isNaN(parseFloat(planets[p]!))) && ascendant && !isNaN(parseFloat(ascendant));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const planetArray = PLANET_FIELDS.map(name => ({
        name,
        fullDegree: parseFloat(planets[name] ?? "0"),
      }));
      const res = await fetch("/api/astrology/yoga-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planets: planetArray, ascendant: parseFloat(ascendant) }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as YogaDetectionResult);
    } catch { setError("Failed to detect yogas. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const byType = Object.entries(report.categories);
      const lines = byType.flatMap(([type, yogas]) => [
        ``,
        `## ${YOGA_TYPE_CONFIG[type]?.label ?? type} (${yogas.length})`,
        ...(yogas as Yoga[]).map(y => `**${y.name}** (${y.strength})\n${y.description}\n→ ${y.effect}`),
      ]);

      const content = [
        `# Yoga Detection Report`,
        `Total Yogas: ${report.summary.total_yogas}`,
        `Has Mahapurusha: ${report.summary.has_mahapurusha}`,
        `Has Raja Yoga: ${report.summary.has_raja_yoga}`,
        `Has Dhana Yoga: ${report.summary.has_dhana_yoga}`,
        ...lines,
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: "Yoga Analysis",
        content,
        fileName: "Yoga_Detection_Report.pdf",
        title: "Vedic Yoga Detection Report",
      });
    } catch { setError("PDF download failed."); }
    finally { setDownloading(false); }
  };

  const allTypes = report ? Object.keys(report.categories) : [];
  const displayedYogas = report
    ? activeType === "all" ? report.yogas : (report.categories[activeType] ?? [])
    : [];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm font-semibold text-white mb-1">Ascendant Longitude *</p>
            <input type="number" min="0" max="360" step="0.01" placeholder="e.g. 87.5 (degrees 0–360)"
              value={ascendant} onChange={e => setAscendant(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none mb-4" />
            <p className="text-sm font-semibold text-white mb-3">Planet Longitudes * (0–360°)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLANET_FIELDS.map(planet => (
                <div key={planet}>
                  <label className="block text-xs text-slate-400 mb-1">{planet}</label>
                  <input type="number" min="0" max="360" step="0.01" placeholder="e.g. 124.5"
                    value={planets[planet]}
                    onChange={e => setPlanets(p => ({ ...p, [planet]: e.target.value }))}
                    className="w-full rounded-lg bg-slate-700 border border-white/10 text-white px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!isValid || loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Detecting Yogas…" : "🌟 Detect Yogas in Chart"}
          </button>
          <p className="text-xs text-slate-600 text-center">Tip: Copy planet longitudes from your Kundali Generator page.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New analysis</button>

          {/* Summary hero */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-yellow-900/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">✨ Planetary Yoga Analysis</p>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {report.summary.total_yogas} Yoga{report.summary.total_yogas !== 1 ? "s" : ""} Detected
                </h2>
                <div className="flex flex-wrap gap-2">
                  {report.summary.has_mahapurusha && (
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">🌟 Mahapurusha Yoga</span>
                  )}
                  {report.summary.has_raja_yoga && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">👑 Raja Yoga</span>
                  )}
                  {report.summary.has_dhana_yoga && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-semibold">💰 Dhana Yoga</span>
                  )}
                  {report.summary.total_yogas === 0 && (
                    <span className="text-slate-400 text-sm">No special yogas detected in this chart configuration.</span>
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span>Very Strong: <strong className="text-white">{report.summary.by_strength["very strong"]}</strong></span>
                  <span>Strong: <strong className="text-white">{report.summary.by_strength.strong}</strong></span>
                  <span>Moderate: <strong className="text-white">{report.summary.by_strength.moderate}</strong></span>
                </div>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm disabled:opacity-50">
                {downloading ? "⏳" : "📥"} PDF
              </button>
            </div>
          </div>

          {/* Type filter */}
          {allTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveType("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeType === "all" ? "bg-amber-500 border-amber-400 text-black" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"}`}>
                All ({report.yogas.length})
              </button>
              {allTypes.map(type => {
                const cfg = YOGA_TYPE_CONFIG[type];
                return (
                  <button key={type} onClick={() => setActiveType(type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeType === type ? "bg-amber-500 border-amber-400 text-black" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"}`}>
                    {cfg?.emoji} {cfg?.label ?? type} ({(report.categories[type] ?? []).length})
                  </button>
                );
              })}
            </div>
          )}

          {/* Yoga cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(displayedYogas as Yoga[]).map((yoga, i) => <YogaCard key={i} yoga={yoga} />)}
            {displayedYogas.length === 0 && (
              <p className="col-span-2 text-center text-slate-500 py-8">No yogas found in this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
