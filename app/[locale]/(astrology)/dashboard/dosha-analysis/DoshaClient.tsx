"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { DoshaAnalysisReport } from "@/lib/astrology/calculations/DoshaAnalysis";

const SEVERITY_CONFIG = {
  Severe:   { color: "text-red-300",    bg: "bg-red-500/15",    border: "border-red-500/30",    dot: "bg-red-400" },
  Moderate: { color: "text-amber-300",  bg: "bg-amber-500/15",  border: "border-amber-500/30",  dot: "bg-amber-400" },
  Mild:     { color: "text-yellow-300", bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  None:     { color: "text-emerald-300",bg: "bg-emerald-500/15",border: "border-emerald-500/30",dot: "bg-emerald-400" },
};

const PLANET_FIELDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Ascendant"];

export default function DoshaAnalysisClient() {
  const [planets, setPlanets] = useState<Record<string, string>>(
    Object.fromEntries(PLANET_FIELDS.map(p => [p, ""]))
  );
  const [report, setReport] = useState<DoshaAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const isValid = PLANET_FIELDS.slice(0, 9).every(p => planets[p] && !isNaN(parseFloat(planets[p])));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const lons = Object.fromEntries(
        PLANET_FIELDS.filter(p => planets[p]).map(p => [p, parseFloat(planets[p]!)])
      );
      const res = await fetch("/api/astrology/dosha-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planetLongitudes: lons }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as DoshaAnalysisReport);
    } catch { setError("Failed to run dosha analysis. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const { kaalSarp: ks, manglik: m } = report;
      const content = [
        `# Dosha Analysis Report`,
        `**Overall:** ${report.overallDosha}`,
        `**Priority Action:** ${report.priorityAction}`,
        ``,
        `## Kaal Sarp Dosha`,
        `Severity: ${ks.severity} | Type: ${ks.type}`,
        ks.description,
        ks.hasKaalSarp ? `\nEffects:\n${ks.effects.map(e => `• ${e}`).join("\n")}` : "",
        ks.hasKaalSarp ? `\nRemedies:\n${ks.remedies.map(r => `• ${r}`).join("\n")}` : "",
        ks.cancellations.length ? `\nCancellations:\n${ks.cancellations.map(c => `• ${c}`).join("\n")}` : "",
        ``,
        `## Manglik Dosha`,
        `Severity: ${m.severity} | Cancelled: ${m.isCancelled ? "Yes" : "No"}`,
        m.description,
        m.hasDosha ? `\nEffects:\n${m.effects.map(e => `• ${e}`).join("\n")}` : "",
        m.hasDosha ? `\nRemedies:\n${m.remedies.map(r => `• ${r}`).join("\n")}` : "",
        `\nPartner Guidance: ${m.partnerGuidance}`,
      ].filter(Boolean).join("\n");

      await exportAIReportAsPdf({
        chartName: "Dosha Analysis",
        content,
        fileName: "Dosha_Analysis.pdf",
        title: "Kaal Sarp & Manglik Dosha Analysis",
      });
    } catch { setError("PDF download failed."); }
    finally { setDownloading(false); }
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
            <p className="text-sm font-semibold text-white mb-1">Enter Planet Longitudes</p>
            <p className="text-xs text-slate-500 mb-4">Copy degrees from your Kundali (0–360 scale). Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu are required. Ascendant is optional for more precise Manglik analysis.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLANET_FIELDS.map(planet => (
                <div key={planet}>
                  <label className="block text-xs text-slate-400 mb-1">{planet} {planet === "Ascendant" ? "(optional)" : "*"}</label>
                  <input
                    type="number" min="0" max="360" step="0.01"
                    placeholder="e.g. 124.5"
                    value={planets[planet]}
                    onChange={e => setPlanets(prev => ({ ...prev, [planet]: e.target.value }))}
                    className="w-full rounded-lg bg-slate-700 border border-white/10 text-white px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!isValid || loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Analysing Doshas…" : "🔱 Run Dosha Analysis"}
          </button>
          <p className="text-xs text-slate-600 text-center">Tip: Use the Kundali Generator to get planet longitudes for this birth chart.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New analysis</button>

          {/* Overall severity hero */}
          {(() => {
            const cfg = SEVERITY_CONFIG[report.overallDosha];
            return (
              <div className={`rounded-2xl border p-6 ${cfg.border} ${cfg.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">🔱 Dosha Analysis</p>
                    <h2 className="text-xl font-bold text-white mb-2">Overall: {report.overallDosha} Dosha</h2>
                    <p className="text-sm text-slate-300">{report.priorityAction}</p>
                  </div>
                  <button onClick={handleDownload} disabled={downloading}
                    className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm disabled:opacity-50">
                    {downloading ? "⏳" : "📥"} PDF
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Kaal Sarp */}
          <div className={`rounded-2xl border p-5 space-y-3 ${report.kaalSarp.hasKaalSarp ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐍</span>
              <h3 className="font-bold text-white">Kaal Sarp Dosha</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${report.kaalSarp.hasKaalSarp ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                {report.kaalSarp.severity}
              </span>
            </div>
            <p className="text-sm text-slate-300">{report.kaalSarp.description}</p>
            {report.kaalSarp.hasKaalSarp && (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Type:</span> <span className="text-white font-semibold">{report.kaalSarp.type}</span></div>
                  <div><span className="text-slate-500">Rahu Sign:</span> <span className="text-white">{report.kaalSarp.rahuSign}</span></div>
                  <div><span className="text-slate-500">Inside axis:</span> <span className="text-red-300">{report.kaalSarp.affectedPlanets.join(", ")}</span></div>
                  <div><span className="text-slate-500">Outside:</span> <span className="text-emerald-300">{report.kaalSarp.outsidePlanets.join(", ") || "None"}</span></div>
                </div>
                <div className="border-t border-white/10 pt-2 space-y-1">
                  <p className="text-xs text-slate-500 font-semibold">Remedies:</p>
                  {report.kaalSarp.remedies.slice(0, 4).map((r, i) => <p key={i} className="text-xs text-slate-300">• {r}</p>)}
                </div>
              </>
            )}
          </div>

          {/* Manglik */}
          <div className={`rounded-2xl border p-5 space-y-3 ${report.manglik.hasDosha && !report.manglik.isCancelled ? "border-orange-500/30 bg-orange-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">♂️</span>
              <h3 className="font-bold text-white">Manglik Dosha</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                report.manglik.isCancelled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : report.manglik.hasDosha ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {report.manglik.isCancelled ? "Cancelled" : report.manglik.severity}
              </span>
            </div>
            <p className="text-sm text-slate-300">{report.manglik.description}</p>
            {report.manglik.hasDosha && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Mars from Lagna:</span> <span className="text-white">House {report.manglik.marsHouseLagna}</span></div>
                <div><span className="text-slate-500">Mars from Moon:</span> <span className="text-white">House {report.manglik.marsHouseMoon}</span></div>
              </div>
            )}
            <p className="text-sm text-slate-300 border-t border-white/10 pt-2">{report.manglik.partnerGuidance}</p>
            {report.manglik.remedies.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">Remedies:</p>
                {report.manglik.remedies.slice(0, 4).map((r, i) => <p key={i} className="text-xs text-slate-300">• {r}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
