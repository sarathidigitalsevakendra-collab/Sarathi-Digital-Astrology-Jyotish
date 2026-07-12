"use client";

import { useState } from "react";
import { useBirthChart } from "@/hooks/astrology/useBirthChart";
import BirthChartForm from "@/components/astrology/birth-chart/BirthChartForm";
import { BirthChartSkeleton } from "@/components/ui/skeleton";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type { GemstoneReport, GemstoneRecommendation } from "@/lib/astrology/calculations/GemstoneReport";

const PRIORITY_CONFIG = {
  Primary: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    card: "border-emerald-500/30 bg-emerald-500/5",
    icon: "✨",
    label: "Primary — Recommended",
  },
  Secondary: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    card: "border-blue-500/20 bg-blue-500/5",
    icon: "💎",
    label: "Secondary — Dasha Period",
  },
  Avoid: {
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    card: "border-red-500/20 bg-red-500/5",
    icon: "⚠️",
    label: "Avoid",
  },
};

const PLANET_EMOJI: Record<string, string> = {
  Sun: "☀️", Moon: "🌙", Mars: "🔥", Mercury: "💬",
  Jupiter: "🎓", Venus: "💝", Saturn: "⏱️", Rahu: "🌑", Ketu: "🌑",
};

function GemstoneCard({ rec }: { rec: GemstoneRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[rec.priority];

  return (
    <div className={`rounded-2xl border p-5 transition-all ${cfg.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PLANET_EMOJI[rec.planet] ?? "🪐"}</span>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {rec.planet}
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                {cfg.icon} {cfg.label}
              </span>
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">{rec.detail.gemstone}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-slate-400 hover:text-white transition-colors text-sm shrink-0"
        >
          {expanded ? "▲ Less" : "▼ Details"}
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-300">{rec.reason}</p>

      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <DetailRow label="Alternates" value={rec.detail.alternates.join(", ")} />
            <DetailRow label="Metal" value={rec.detail.metal} />
            <DetailRow label="Finger" value={rec.detail.finger} />
            <DetailRow label="Day to Wear" value={rec.detail.wearDay} />
            <DetailRow label="Best Time" value={rec.detail.wearTime} />
          </div>
          <div className="space-y-2">
            <DetailRow label="Mantra" value={rec.detail.mantra} />
            <DetailRow label="Benefits" value={rec.detail.benefits} />
          </div>
          {rec.priority !== "Avoid" && (
            <div className="col-span-2 mt-1 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-200 text-xs">
              ⚠️ <strong>Caution:</strong> {rec.detail.caution}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-500 text-xs uppercase tracking-wide">{label}</span>
      <p className="text-slate-200 text-sm">{value}</p>
    </div>
  );
}

export default function GemstoneReportClient({ userId: _userId, userEmail: _userEmail }: { userId: string; userEmail: string }) {
  const {
    state,
    showHelp,
    setBirthData,
    setError,
    generateBirthChart,
  } = useBirthChart();

  const [report, setReport] = useState<GemstoneReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommended" | "all" | "avoid">("recommended");

  // Auto-generate when chart is ready
  const handleGenerateFromChart = async () => {
    if (!state.chartData?.data?.planets || state.chartData?.data?.ascendant === undefined) return;
    setLoading(true);
    try {
      const res = await fetch("/api/astrology/gemstone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planets: state.chartData.data.planets,
          ascendant: state.chartData.data.ascendant,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json() as GemstoneReport;
      setReport(data);
    } catch (e) {
      setError("Failed to generate gemstone report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloadingPdf(true);
    try {
      const name = state.birthData?.chartName || "Chart";
      const lines: string[] = [
        "# Personalised Gemstone Recommendations",
        "",
        `## Primary Gemstone`,
        report.primaryGemstone
          ? `${report.primaryGemstone.gemstone} — Wear on ${report.primaryGemstone.finger} on a ${report.primaryGemstone.wearDay} in ${report.primaryGemstone.metal}.`
          : "No single primary gemstone identified. See details below.",
        "",
        `## General Advice`,
        report.generalAdvice,
        "",
        "## Planet-by-Planet Recommendations",
        "",
        ...report.recommendations.flatMap((r) => [
          `### ${r.planet} — ${r.detail.gemstone} (${r.priority})`,
          r.reason,
          `- Alternates: ${r.detail.alternates.join(", ")}`,
          `- Metal: ${r.detail.metal}`,
          `- Wear on: ${r.detail.finger} on ${r.detail.wearDay} at ${r.detail.wearTime}`,
          `- Mantra: ${r.detail.mantra}`,
          `- Benefits: ${r.detail.benefits}`,
          `- Caution: ${r.detail.caution}`,
          "",
        ]),
      ];

      await exportAIReportAsPdf({
        chartName: name,
        birthDetails: state.birthData ? {
          date: new Date(state.birthData.dateTime).toLocaleDateString("en-IN"),
          time: new Date(state.birthData.dateTime).toLocaleTimeString("en-IN"),
          location: state.birthData.location,
        } : undefined,
        content: lines.join("\n"),
        fileName: `${name.replace(/\s+/g, "_")}_Gemstone_Report.pdf`,
        title: "Gemstone Recommendation Report",
      });
    } catch {
      setError("PDF download failed.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // — No chart yet: show form
  if (!state.chartData) {
    if (state.loading) return <BirthChartSkeleton />;
    return (
      <BirthChartForm
        birthData={state.birthData}
        setBirthData={setBirthData}
        loading={state.loading}
        error={state.error}
        showHelp={showHelp}
        onGenerate={generateBirthChart}
        onDismissError={() => setError(null)}
      />
    );
  }

  const filteredRecs = report?.recommendations.filter((r) => {
    if (activeTab === "recommended") return r.priority === "Primary";
    if (activeTab === "avoid") return r.priority === "Avoid";
    return r.priority === "Secondary";
  }) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero Summary */}
      {!report && !loading && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <div className="text-5xl mb-4">💎</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Gemstone Report is Ready</h2>
          <p className="text-slate-400 mb-6">
            Based on your birth chart for <strong className="text-white">{state.birthData.chartName || "User"}</strong>.
            Get personalised gemstone recommendations from classical Jyotish.
          </p>
          <button
            onClick={handleGenerateFromChart}
            className="mx-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <span>✨</span> Generate My Gemstone Report
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-48 space-y-4 text-slate-500">
          <div className="text-4xl animate-pulse">💎</div>
          <p>Analysing your birth chart...</p>
        </div>
      )}

      {report && (
        <>
          {/* Primary Gem Highlight */}
          {report.primaryGemstone && (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-widest font-medium mb-1">⭐ Your Primary Gemstone</p>
                  <h2 className="text-3xl font-bold text-white">{report.primaryGemstone.gemstone}</h2>
                  <p className="text-slate-400 mt-1">
                    Ascendant lord: <strong className="text-white">{report.ascendantLord}</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-300">
                    <span>🔩 {report.primaryGemstone.metal}</span>
                    <span>💍 {report.primaryGemstone.finger}</span>
                    <span>📅 {report.primaryGemstone.wearDay}</span>
                  </div>
                  <p className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    🙏 Mantra: {report.primaryGemstone.mantra}
                  </p>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {downloadingPdf ? <><span className="animate-spin">⏳</span> Generating...</> : <><span>📥</span> Download PDF</>}
                </button>
              </div>
            </div>
          )}

          {/* General Advice */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300">
            <span className="text-slate-500">ℹ️ General Advice: </span>{report.generalAdvice}
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-2 mb-4">
              {[
                { key: "recommended", label: "✨ Recommended", count: report.recommendations.filter(r => r.priority === "Primary").length },
                { key: "all", label: "💎 Secondary", count: report.recommendations.filter(r => r.priority === "Secondary").length },
                { key: "avoid", label: "⚠️ Avoid", count: report.recommendations.filter(r => r.priority === "Avoid").length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredRecs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No gemstones in this category.</p>
              ) : (
                filteredRecs.map((rec) => <GemstoneCard key={rec.planet} rec={rec} />)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
