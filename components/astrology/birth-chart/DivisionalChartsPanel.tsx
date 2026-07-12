"use client";

import type { ChartSVGResponse, BirthChartResponse } from "@/types/astrology/birthChart.types";
import { DIVISIONAL_CHARTS } from "@/services/astrology/birthChartService";
import NorthIndianChart from "@/components/charts/NorthIndianChart";
import SouthIndianChart from "@/components/charts/SouthIndianChart";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DivisionalChartsPanelProps {
  svgData: { [key: string]: ChartSVGResponse };
  divisionalData?: { [key: string]: BirthChartResponse };
  selectedDivisional: string;
  onSelectDivisional: (code: string) => void;
}

export default function DivisionalChartsPanel({
  svgData,
  divisionalData,
  selectedDivisional,
  onSelectDivisional,
}: DivisionalChartsPanelProps) {
  const selectedChart = DIVISIONAL_CHARTS.find((c) => c.code === selectedDivisional);
  const beginnerCharts = DIVISIONAL_CHARTS.filter((c) => c.beginner);
  const advancedCharts = DIVISIONAL_CHARTS.filter((c) => !c.beginner);
  
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const savedStyle = localStorage.getItem("chartStyle");
    if (savedStyle === "north" || savedStyle === "south") {
      setChartStyle(savedStyle);
    }
  }, []);

  // Update preference handler
  const handleSetChartStyle = (style: "north" | "south") => {
    setChartStyle(style);
    localStorage.setItem("chartStyle", style);
  };
  
  const activeData = divisionalData?.[selectedDivisional]?.data;
  const hasInteractiveChart = activeData && activeData.planets && activeData.ascendant !== undefined;

  return (
    <div className="space-y-6">
      {/* Header code unchanged ... */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-blue-100">
          <span className="text-2xl">🔍</span>
          Dive Deeper Into Your Life
        </p>
        <p className="text-sm text-blue-300/90">
          Divisional charts (Vargas) provide focused insights into specific life areas
        </p>
      </div>

      {/* Chart Selection Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Beginner Charts - Always Visible */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span>⭐</span>
            <span>Start Here</span>
          </h3>

          <div className="space-y-2.5">
            {beginnerCharts.map((chart) => (
              <button
                key={chart.code}
                onClick={() => onSelectDivisional(chart.code)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedDivisional === chart.code
                    ? "border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{chart.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{chart.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                  </div>
                  {selectedDivisional === chart.code && (
                    <span className="text-lg text-orange-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Charts - Collapsible on Mobile */}
        <div className="space-y-3">
          <div className="flex items-center justify-between" onClick={() => setShowAdvanced(!showAdvanced)}>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                <span>🎓</span>
                <span>Advanced</span>
              </h3>
              <button className="md:hidden p-1 text-slate-400">
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
          </div>

          <div className={`space-y-2.5 ${!showAdvanced ? "hidden md:block" : "block animate-in fade-in slide-in-from-top-2"}`}>
            {advancedCharts.map((chart) => (
              <button
                key={chart.code}
                onClick={() => onSelectDivisional(chart.code)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedDivisional === chart.code
                    ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{chart.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{chart.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                  </div>
                  {selectedDivisional === chart.code && (
                    <span className="text-lg text-purple-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {!showAdvanced && (
              <button 
                  onClick={() => setShowAdvanced(true)}
                  className="md:hidden w-full py-2 text-xs font-medium text-slate-500 hover:text-white border border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Show {advancedCharts.length} more charts
              </button>
          )}
        </div>
      </div>

      {/* Selected Chart Display */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
           <h3 className="text-xl font-semibold text-white">
             {selectedChart?.name || selectedDivisional}
           </h3>

           {hasInteractiveChart && (
            <div className="flex rounded-lg border border-white/10 bg-black/20 p-1">
              <button
                onClick={() => handleSetChartStyle("north")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  chartStyle === "north"
                    ? "bg-indigo-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                North
              </button>
              <button
                onClick={() => handleSetChartStyle("south")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  chartStyle === "south"
                    ? "bg-indigo-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                South
              </button>
            </div>
           )}
        </div>

        {hasInteractiveChart ? (
             <div className="flex justify-center rounded-xl bg-slate-900 p-8 shadow-inner">
                 {chartStyle === "north" ? (
                   <NorthIndianChart 
                     planets={activeData!.planets!.map(p => ({
                        name: p.name,
                        house: p.house || 1,
                        sign: p.sign || "",
                        degree: p.fullDegree,
                        isRetro: Boolean(p.isRetro)
                     }))}
                     ascendantSign={Math.floor(activeData!.ascendant! / 30) + 1}
                   />
                 ) : (
                   <SouthIndianChart
                     planets={activeData!.planets!.map(p => ({
                        name: p.name,
                        house: p.house || 1,
                        sign: p.sign || "",
                        degree: p.fullDegree,
                        isRetro: Boolean(p.isRetro)
                     }))}
                     ascendantSign={Math.floor(activeData!.ascendant! / 30) + 1}
                   />
                 )}
             </div>
        ) : svgData[selectedDivisional] ? (
          <div
            className="flex justify-center rounded-xl bg-white p-8 shadow-inner"
            dangerouslySetInnerHTML={{
              __html: svgData[selectedDivisional].data.svg_code,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 py-20">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-orange-500"></div>
            <p className="text-sm text-slate-400">Loading {selectedDivisional} chart...</p>
          </div>
        )}
      </div>
    </div>
  );
}
