"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { SadeSatiReport } from "@/lib/astrology/calculations/SadeSati";

const SIGN_NAMES = [
  "", "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋", "Leo ♌", "Virgo ♍",
  "Libra ♎", "Scorpio ♏", "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓",
];

const INTENSITY_CONFIG = {
  High:   { color: "text-red-300",     bg: "bg-red-500/15",    border: "border-red-500/30",    dot: "bg-red-400" },
  Medium: { color: "text-amber-300",   bg: "bg-amber-500/15",  border: "border-amber-500/30",  dot: "bg-amber-400" },
  Low:    { color: "text-yellow-300",  bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  None:   { color: "text-emerald-300", bg: "bg-emerald-500/15",border: "border-emerald-500/30",dot: "bg-emerald-400" },
};

export default function SadeSatiClient() {
  const [moonSign, setMoonSign] = useState(1);
  const [report, setReport] = useState<SadeSatiReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/sade-sati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moonSignNum: moonSign }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as SadeSatiReport);
    } catch { setError("Failed to generate report. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const content = [
        `# Sade Sati & Shani Report`,
        `**Moon Sign:** ${report.natalMoonSign}`,
        `**Current Saturn Sign:** ${report.currentSaturnSign}`,
        `**Status:** ${report.isInSadeSati ? `Sade Sati — ${report.sadeSatiPhase} Phase` : report.isDhaiya ? report.dhaiyaPhase : "Not in Sade Sati"}`,
        `**Intensity:** ${report.intensity}`,
        ``,
        `## Summary`,
        report.overallVerdict,
        ``,
        report.currentPeriod ? `## Current Period\n${report.currentPeriod.description}\nStart: ~${report.currentPeriod.startYear} | End: ~${report.currentPeriod.endYear}` : "",
        ``,
        `## Life Areas Affected\n${report.lifeAreasAffected.map(a => `• ${a}`).join("\n")}`,
        ``,
        `## Positive Aspects\n${report.positiveAspects.map(a => `✓ ${a}`).join("\n")}`,
        ``,
        `## Challenges\n${report.challenges.map(c => `• ${c}`).join("\n")}`,
        ``,
        `## Remedies\n${report.remedies.map(r => `• ${r}`).join("\n")}`,
        ``,
        `**Mantra:** ${report.mantra}`,
        `**Fasting Day:** ${report.fastingDay}`,
        `**Donation Items:** ${report.donationItems.join(", ")}`,
        ``,
        report.nextSadeSati ? `## Next Sade Sati\n~${report.nextSadeSati.startYear} to ~${report.nextSadeSati.endYear}` : "",
      ].filter(Boolean).join("\n");

      await exportAIReportAsPdf({
        chartName: `Sade Sati — ${report.natalMoonSign} Moon`,
        content,
        fileName: `SadeSati_${report.natalMoonSign}.pdf`,
        title: "Sade Sati & Shani Transit Report",
      });
    } catch { setError("PDF download failed."); }
    finally { setDownloading(false); }
  };

  const cfg = report ? INTENSITY_CONFIG[report.intensity] : INTENSITY_CONFIG.None;

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <h2 className="font-bold text-white mb-4">Select Your Moon Sign (Rashi)</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {SIGN_NAMES.slice(1).map((name, i) => {
                const num = i + 1;
                return (
                  <button key={num} onClick={() => setMoonSign(num)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      moonSign === num
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                    }`}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Analysing Saturn transit…" : "🪐 Generate Sade Sati Report"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New report</button>

          {/* Status hero */}
          <div className={`rounded-2xl border p-6 ${cfg.border} ${cfg.bg}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">🪐 Moon Sign: {report.natalMoonSign}</p>
                <h2 className="text-xl font-bold text-white mb-2">
                  {report.isInSadeSati
                    ? `Sade Sati — ${report.sadeSatiPhase} Phase`
                    : report.isDhaiya
                    ? report.dhaiyaPhase
                    : "Not Currently in Sade Sati"}
                </h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  Intensity: {report.intensity} · Saturn in {report.currentSaturnSign}
                </div>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50">
                {downloading ? "⏳" : "📥"} PDF
              </button>
            </div>
            <p className="text-slate-300 text-sm mt-4">{report.overallVerdict}</p>
          </div>

          {/* Current period detail */}
          {report.currentPeriod && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-amber-400 font-semibold text-sm mb-2">📅 Current Phase Details</p>
              <p className="text-white text-sm">{report.currentPeriod.description}</p>
              <p className="text-slate-400 text-xs mt-2">
                Period: ~{report.currentPeriod.startYear} → ~{report.currentPeriod.endYear} · Transit sign: {report.currentPeriod.signTransited}
              </p>
            </div>
          )}

          {/* 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Life Areas Affected</p>
              {report.lifeAreasAffected.map(a => <p key={a} className="text-sm text-slate-300 py-0.5">• {a}</p>)}
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-emerald-400 font-semibold uppercase mb-3">Positive Aspects</p>
              {report.positiveAspects.map(a => <p key={a} className="text-sm text-slate-200 py-0.5">✓ {a}</p>)}
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs text-red-400 font-semibold uppercase mb-3">Challenges</p>
              {report.challenges.map(c => <p key={c} className="text-sm text-slate-200 py-0.5">• {c}</p>)}
            </div>
          </div>

          {/* Remedies */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-3">
            <p className="text-purple-400 font-semibold text-sm">💊 Remedies & Upay</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Mantra:</span> <span className="text-white">{report.mantra}</span></div>
              <div><span className="text-slate-500">Fast on:</span> <span className="text-white">{report.fastingDay}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Donate:</span> <span className="text-white">{report.donationItems.join(", ")}</span></div>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1">
              {report.remedies.map((r, i) => <p key={i} className="text-xs text-slate-300">• {r}</p>)}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
            <p className="text-slate-400 font-semibold text-sm mb-3">📅 Sade Sati Timeline</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {report.previousSadeSati && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-xs text-slate-500 mb-1">Previous Sade Sati</p>
                  <p className="text-white">~{Math.round(report.previousSadeSati.startYear)} – ~{Math.round(report.previousSadeSati.endYear)}</p>
                </div>
              )}
              {report.nextSadeSati && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-xs text-slate-500 mb-1">Next Sade Sati</p>
                  <p className="text-white">~{Math.round(report.nextSadeSati.startYear)} – ~{Math.round(report.nextSadeSati.endYear)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
