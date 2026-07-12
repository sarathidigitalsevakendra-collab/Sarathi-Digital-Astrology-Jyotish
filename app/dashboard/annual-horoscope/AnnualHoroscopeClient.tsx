"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { AnnualHoroscopeReport, QuarterForecast } from "@/lib/astrology/calculations/AnnualHoroscope";

const SIGN_NAMES = [
  "", "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋", "Leo ♌", "Virgo ♍",
  "Libra ♎", "Scorpio ♏", "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓",
];

const TONE_CONFIG = {
  Excellent:   { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  Good:        { color: "text-blue-300",    bg: "bg-blue-500/15",    border: "border-blue-500/30" },
  Mixed:       { color: "text-amber-300",   bg: "bg-amber-500/15",   border: "border-amber-500/30" },
  Challenging: { color: "text-red-300",     bg: "bg-red-500/15",     border: "border-red-500/30" },
};

const INTENSITY_CONFIG = {
  High:   "text-red-400",
  Medium: "text-amber-400",
  Low:    "text-emerald-400",
};

function QuarterCard({ q }: { q: QuarterForecast }) {
  const [open, setOpen] = useState(false);
  const cfg = TONE_CONFIG[q.tone];
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">{q.quarter}</p>
          <p className={`font-semibold text-sm ${cfg.color}`}>{q.focus} Focus — {q.tone}</p>
        </div>
        <span className="text-slate-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
          <p className="text-sm text-slate-200">{q.summary}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-emerald-400 font-semibold mb-1">✅ Do</p>
              {q.dos.map((d, i) => <p key={i} className="text-slate-300">• {d}</p>)}
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-1">⛔ Avoid</p>
              {q.donts.map((d, i) => <p key={i} className="text-slate-300">• {d}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnnualHoroscopeClient() {
  const currentYear = new Date().getFullYear();
  const [moonSign, setMoonSign] = useState(1);
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState<AnnualHoroscopeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab] = useState<"overview" | "months" | "quarters">("overview");

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/annual-horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moonSignNum: moonSign, year }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as AnnualHoroscopeReport);
    } catch { setError("Failed to generate horoscope."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const content = [
        `# Annual Horoscope ${report.year} — ${report.moonSign} Moon`,
        `**Year Score:** ${report.yearScore}/100`,
        `**Verdict:** ${report.yearVerdict}`,
        `**Overall Theme:** ${report.overallTheme}`,
        ``,
        `## Slow Planet Transits`,
        ...report.slowTransits.map(t => `**${t.planet}** in ${t.transitSign} (${t.relPosFromMoon}th from Moon): ${t.effect}`),
        ``,
        `## Lucky Data`,
        `Months: ${report.luckyMonths.join(", ")}`,
        `Numbers: ${report.luckyNumbers.join(", ")}`,
        `Colours: ${report.luckyColours.join(", ")}`,
        `Mantra: ${report.yearMantra}`,
        ``,
        `## Quarterly Forecast`,
        ...report.quarters.flatMap(q => [`**${q.quarter}** (${q.focus}): ${q.tone} — ${q.summary}`]),
        ``,
        `## Month Forecast`,
        ...report.months.map(m => `**${m.month}** (${m.theme}): ${m.keyMessage}`),
        ``,
        `## Key Advice`,
        ...report.keyAdvice.map(a => `• ${a}`),
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: `Annual Horoscope ${report.year}`,
        content,
        fileName: `Annual_Horoscope_${report.moonSign}_${report.year}.pdf`,
        title: `Annual Horoscope ${report.year}`,
      });
    } catch { setError("PDF failed."); }
    finally { setDownloading(false); }
  };

  const scoreColor = (s: number) => s >= 70 ? "#10b981" : s >= 50 ? "#3b82f6" : s >= 35 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Moon Sign (Rashi) *</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {SIGN_NAMES.slice(1).map((name, i) => {
                  const num = i + 1;
                  return (
                    <button key={num} onClick={() => setMoonSign(num)}
                      className={`px-2 py-2 rounded-xl border text-xs font-medium transition-all ${moonSign === num ? "bg-indigo-500 border-indigo-400 text-white" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:border-white/20"}`}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Year</label>
              <div className="flex gap-2">
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${year === y ? "bg-indigo-500 border-indigo-400 text-white" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Generating forecast…" : "🌠 Generate Annual Horoscope"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New forecast</button>

          {/* Year hero */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">🌠 Annual Horoscope {report.year}</p>
                <h2 className="text-2xl font-bold text-white mb-1">{report.moonSign} Moon</h2>
                <p className="text-slate-300 text-sm mb-3">{report.overallTheme}</p>
                <p className="text-slate-400 text-sm">{report.yearVerdict}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                {/* Score ring */}
                <svg width="90" height="90" className="-rotate-90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke={scoreColor(report.yearScore)} strokeWidth="7"
                    strokeDasharray={`${(report.yearScore / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`} strokeLinecap="round" />
                </svg>
                <div className="-mt-[68px] flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{report.yearScore}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
                <button onClick={handleDownload} disabled={downloading}
                  className="mt-10 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm disabled:opacity-50">
                  {downloading ? "⏳" : "📥"} PDF
                </button>
              </div>
            </div>

            {/* Lucky strip */}
            <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="text-slate-500">Lucky Months:</span><br /><span className="text-white font-medium">{report.luckyMonths.join(", ")}</span></div>
              <div><span className="text-slate-500">Colours:</span><br /><span className="text-white font-medium">{report.luckyColours.join(", ")}</span></div>
              <div><span className="text-slate-500">Numbers:</span><br /><span className="text-white font-medium">{report.luckyNumbers.join(", ")}</span></div>
              <div><span className="text-slate-500">Mantra:</span><br /><span className="text-white font-medium">{report.yearMantra}</span></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-1">
            {(["overview", "months", "quarters"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-all ${tab === t ? "bg-white/10 text-white border-b-2 border-indigo-400" : "text-slate-500 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "overview" && (
            <div className="space-y-4">
              {/* Slow transits */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Slow Planet Transits ({report.year})</p>
                <div className="space-y-3">
                  {report.slowTransits.map(t => (
                    <div key={t.planet} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white text-sm">{t.planet}</p>
                        <span className="text-slate-500 text-xs">in {t.transitSign} · {t.relPosFromMoon}th from Moon</span>
                        <span className={`ml-auto text-xs font-semibold ${INTENSITY_CONFIG[t.intensity]}`}>{t.intensity}</span>
                      </div>
                      <p className="text-xs text-slate-300">{t.effect}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.lifeAreas.map(a => <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-400">{a}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Key advice */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <p className="text-xs text-purple-400 font-semibold uppercase mb-2">Key Advice for {report.year}</p>
                {report.keyAdvice.map((a, i) => <p key={i} className="text-sm text-slate-200 mb-1">→ {a}</p>)}
              </div>
            </div>
          )}

          {tab === "months" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.months.map(m => (
                <div key={m.month} className={`rounded-xl border p-3 ${m.favourable ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-white text-sm">{m.month}</p>
                    <span className={`text-xs ${m.favourable ? "text-emerald-400" : "text-red-400"}`}>{m.favourable ? "✓ Favourable" : "⚠ Challenging"}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-0.5">{m.theme} · Sun in {m.sunSign}</p>
                  <p className="text-xs text-slate-300">{m.keyMessage}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "quarters" && (
            <div className="space-y-3">
              {report.quarters.map((q, i) => <QuarterCard key={i} q={q} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
