"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { UpayReport, RemedyCategory, UpayItem } from "@/lib/astrology/calculations/UpayReport";

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const SIGN_NAMES = [
  "", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const CATEGORY_EMOJI: Record<RemedyCategory, string> = {
  Mantra: "🕉️", Fasting: "🌙", Gemstone: "💎", Donation: "🤲",
  Yantra: "🔯", Colour: "🎨", Plant: "🌿", Lifestyle: "🧘",
  Temple: "⛩️", Food: "🍛",
};

const PRIORITY_CONFIG = {
  High:   { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-300",    badge: "bg-red-500/20" },
  Medium: { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-300",  badge: "bg-amber-500/20" },
  Low:    { bg: "bg-slate-700/40",  border: "border-slate-600/40",  text: "text-slate-400",  badge: "bg-slate-700/40" },
};

function RemedyCard({ item }: { item: UpayItem }) {
  const p = PRIORITY_CONFIG[item.priority];
  return (
    <div className={`rounded-xl border p-3 ${p.border} ${p.bg}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg shrink-0 mt-0.5">{CATEGORY_EMOJI[item.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded ${p.badge} ${p.text} font-medium`}>{item.priority}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
          <p className="text-xs text-slate-500 mt-1">⏰ {item.frequency}</p>
        </div>
      </div>
    </div>
  );
}

export default function UpayClient() {
  const [mahadasha, setMahadasha] = useState("Saturn");
  const [antardasha, setAntardasha] = useState("");
  const [moonSign, setMoonSign] = useState(1);
  const [lagnaSign, setLagnaSign] = useState(1);
  const [hasSadeSati, setHasSadeSati] = useState(false);
  const [hasKaalSarp, setHasKaalSarp] = useState(false);
  const [hasManglik, setHasManglik] = useState(false);

  const [report, setReport] = useState<UpayReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<RemedyCategory | "All">("All");

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/upay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMahadashaPlanet: mahadasha,
          currentAntardashaPlanet: antardasha || undefined,
          moonSignNum: moonSign,
          lagnaSignNum: lagnaSign,
          hasSadeSati, hasKaalSarp, hasManglik,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as UpayReport);
    } catch { setError("Failed to generate Upay report."); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const sections = [
        { label: "Top Priority Remedies", items: report.topThree },
        { label: "Dasha Remedies", items: report.dashaRemedy },
        { label: "Moon Sign Remedies", items: report.moonSignRemedy.slice(0, 5) },
        { label: "Dosha Remedies", items: report.doshaRemedy },
        { label: "General Wellbeing", items: report.generalWellbeing },
      ];

      const lines = sections.flatMap(s => [
        ``,
        `## ${s.label}`,
        ...s.items.map(i => `**${CATEGORY_EMOJI[i.category]} ${i.title}**: ${i.detail} (${i.frequency})`),
      ]);

      const content = [
        `# Upay & Remedy Report`,
        `${report.summary}`,
        ...lines,
      ].join("\n");

      await exportAIReportAsPdf({
        chartName: "Upay Report",
        content,
        fileName: "Upay_Remedy_Report.pdf",
        title: "Personalised Upay & Remedy Guide",
      });
    } catch { setError("PDF download failed."); }
    finally { setDownloading(false); }
  };

  const categories: (RemedyCategory | "All")[] = ["All", "Mantra", "Fasting", "Gemstone", "Donation", "Yantra", "Colour", "Plant", "Temple", "Food", "Lifestyle"];

  const displayedRemedies = activeCategory === "All"
    ? report?.allRemedies ?? []
    : (report?.allRemedies ?? []).filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}

      {!report ? (
        <div className="space-y-5">
          {/* Dasha */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <h2 className="font-bold text-white">Current Dasha Periods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mahadasha Planet *</label>
                <select value={mahadasha} onChange={e => setMahadasha(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none">
                  {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Antardasha Planet (optional)</label>
                <select value={antardasha} onChange={e => setAntardasha(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none">
                  <option value="">— Same as Mahadasha —</option>
                  {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Moon + Lagna */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
            <h2 className="font-bold text-white">Birth Signs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Moon Sign (Rashi) *</label>
                <select value={moonSign} onChange={e => setMoonSign(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none">
                  {SIGN_NAMES.slice(1).map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Lagna (Ascendant Sign) *</label>
                <select value={lagnaSign} onChange={e => setLagnaSign(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none">
                  {SIGN_NAMES.slice(1).map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Doshas */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
            <h2 className="font-bold text-white mb-3">Active Doshas (optional)</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Sade Sati", state: hasSadeSati, set: setHasSadeSati },
                { label: "Kaal Sarp Dosha", state: hasKaalSarp, set: setHasKaalSarp },
                { label: "Manglik Dosha", state: hasManglik, set: setHasManglik },
              ].map(({ label, state, set }) => (
                <button key={label} onClick={() => set(!state)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${state ? "bg-purple-500 border-purple-400 text-white" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"}`}>
                  {state ? "✓ " : ""}{label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
            {loading ? "Generating remedies…" : "🕉️ Generate Personalised Upay Report"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← New report</button>

          {/* Hero */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">🕉️ Personalised Upay</p>
                <h2 className="text-xl font-bold text-white mb-2">{report.summary}</h2>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl text-sm disabled:opacity-50">
                {downloading ? "⏳" : "📥"} PDF
              </button>
            </div>

            {/* Top 3 */}
            {report.topThree.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs text-purple-400 font-semibold uppercase">⭐ Start With These</p>
                {report.topThree.map((item, i) => (
                  <p key={i} className="text-sm text-slate-200">
                    <span className="text-purple-400 font-bold">{i + 1}.</span> {CATEGORY_EMOJI[item.category]} <strong>{item.title}</strong> — {item.detail}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  activeCategory === cat ? "bg-purple-500 border-purple-400 text-white" : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"
                }`}>
                {cat !== "All" && CATEGORY_EMOJI[cat as RemedyCategory]}{" "}{cat} {cat !== "All" && `(${displayedRemedies.filter(r => r.category === cat).length || report.allRemedies.filter(r => r.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Remedies grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedRemedies.map((item, i) => <RemedyCard key={i} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}
