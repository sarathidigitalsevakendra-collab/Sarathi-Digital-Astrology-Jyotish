/* eslint-disable react/no-unescaped-entities */
"use client";

import type {
  BirthData,
  BirthChartResponse,
  ChartSVGResponse,
} from "@/types/astrology/birthChart.types";
import {
  getDisplayChartName,
  getSignName,
  formatDegree,
} from "@/services/astrology/birthChartService";
import { getFormattedBirthDateTime } from "@/services/astrology/birthChartService";
import PlanetaryPositions from "./PlanetaryPositions";
import HousesGuide from "./HousesGuide";
import NorthIndianChart from "@/components/charts/NorthIndianChart";
import SouthIndianChart from "@/components/charts/SouthIndianChart";
import { useState, useEffect } from "react";

import InterpretationModal from "./InterpretationModal";
import { useChartInterpretation } from "@/hooks/astrology/useChartInterpretation";
import DashaPanel from "./DashaPanel";
import YogasPanel from "./YogasPanel";
import PDFExportButton from "@/components/pdf/PDFExportButton";

interface BirthChartDisplayProps {
  birthData: BirthData;
  chartData: BirthChartResponse;
  svgData: ChartSVGResponse | undefined;
  showHelp: boolean;
  onSwitchToForm: () => void;
  onSwitchToDivisional: () => void;
  downloadingPNG: boolean;
  downloadingPDF: boolean;
  copiedLink: boolean;
  savingChart: boolean;
  savedChartId: string | null;
  onDownloadPNG: () => void;
  onDownloadPDF: (interpretation?: any) => void;
  onDownloadChartPDF?: () => void | Promise<void>;
  onCopyLink: () => void;
  onSaveChart: () => void;
}

export default function BirthChartDisplay({
  birthData,
  chartData,
  svgData,
  showHelp,
  onSwitchToDivisional,
  downloadingPNG,
  downloadingPDF,
  copiedLink,
  savingChart,
  savedChartId,
  onDownloadPNG,
  onDownloadPDF,
  onDownloadChartPDF,
  onCopyLink,
  onSaveChart,
}: BirthChartDisplayProps) {
  const formatted = getFormattedBirthDateTime(birthData.dateTime);
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [showInterpretation, setShowInterpretation] = useState(false);

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
  
  const { interpreting, interpretation, generateInterpretation } = useChartInterpretation({
    chartData,
    onError: (err) => console.error(err) // Could use toast here
  });


  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Success Banner */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5">
        <p className="flex items-center gap-2.5 text-lg font-semibold text-green-100">
          <span className="text-2xl">🎉</span>
          {getDisplayChartName(birthData, true)} is Ready!
        </p>
        <div className="mt-3 flex flex-col gap-2 text-sm text-green-200/90 sm:flex-row sm:items-center">
             <span className="flex items-center gap-2">
                <span>📅</span> {formatted.date}
             </span>
             <span className="hidden sm:inline opacity-50">•</span>
             <span className="flex items-center gap-2">
                <span>🕐</span> {formatted.time}
             </span>
             <span className="hidden sm:inline opacity-50">•</span>
             <span className="flex items-center gap-2">
                <span>📍</span> {birthData.location}
             </span>
        </div>
      </div>

      {/* Understanding Your Chart */}
      {showHelp && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
            <span className="text-xl">📘</span>
            Understanding Your Chart
          </p>
          <p className="text-sm leading-relaxed text-blue-300/90">
            Your birth chart is a cosmic snapshot of the sky at your birth moment. It shows where
            planets were positioned, influencing your personality and life path.
          </p>
        </div>
      )}

      {/* Ascendant Display */}
      {chartData.data.ascendant !== undefined && (
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-pink-500/15 p-6 shadow-lg">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-orange-200">
                <span className="text-xl">🌅</span>
                Rising Sign (Ascendant)
              </p>
              <p className="text-4xl font-bold text-white">
                {getSignName(Math.floor(chartData.data.ascendant / 30) + 1)}{" "}
                {formatDegree(chartData.data.ascendant % 30)}
              </p>
            </div>
            {chartData.from_cache && (
              <span className="self-start rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                From cache
              </span>
            )}
          </div>

          {showHelp && (
            <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-white">What is the Ascendant?</p>
              <p className="text-sm leading-relaxed text-slate-200">
                How others perceive you and your approach to life, determined by your exact birth
                time and place.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Planetary Positions */}
      {chartData.data.planets && chartData.data.planets.length > 0 && (
        <PlanetaryPositions
          planets={chartData.data.planets}
          showHelp={showHelp}
        />
      )}

      {/* Houses Guide */}
      {showHelp && <HousesGuide />}

      {/* Vimsottari Dasha Panel */}
      <DashaPanel
        birthData={{
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }}
        showHelp={showHelp}
      />

      {/* Yogas (Planetary Combinations) Panel */}
      <YogasPanel
        birthData={{
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }}
        showHelp={showHelp}
      />

      {/* Chart Visualization */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-2xl">📈</span>
              Visual Chart
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
                 {/* Chart Style Toggle */}
                <div className="flex rounded-lg border border-white/10 bg-black/20 p-1">
                  <button
                    onClick={() => handleSetChartStyle("north")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      chartStyle === "north"
                        ? "bg-indigo-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    North
                  </button>
                  <button
                    onClick={() => handleSetChartStyle("south")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      chartStyle === "south"
                        ? "bg-indigo-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    South
                  </button>
                </div>
                
                <button
                   onClick={() => setShowInterpretation(true)}
                   className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/20 hover:shadow-lg transition-all min-h-[40px]"
                >
                  <span>✨</span>
                  <span>AI Analysis</span>
                </button>
            </div>
            
            {/* Mobile AI Analysis Button - Full Width */}
             <button
                   onClick={() => setShowInterpretation(true)}
                   className="sm:hidden w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 active:scale-[0.98]"
                >
                  <span>✨</span>
                  <span>AI Analysis</span>
             </button>
          </div>



          {/* Action Buttons - Mobile Grid */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <button
              onClick={onSaveChart}
              disabled={savingChart || !!savedChartId}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-h-[44px] active:scale-[0.98]"
              title="Save to your account"
            >
              {savingChart ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : savedChartId ? (
                <>
                  <span>✅</span>
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Chart</span>
                </>
              )}
            </button>

            <button
              onClick={onDownloadPNG}
              disabled={downloadingPNG}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-h-[44px] active:scale-[0.98]"
              title="Download as image"
            >
              {downloadingPNG ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  <span>PNG</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Download PNG</span>
                </>
              )}
            </button>

            {onDownloadChartPDF ? (
              <PDFExportButton
                onExportChart={onDownloadChartPDF}
                onExportReport={() => onDownloadPDF(interpretation)}
                disabled={downloadingPDF}
                showReportOption={true}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-h-[44px] active:scale-[0.98]"
              />
            ) : (
              <button
                onClick={() => onDownloadPDF(interpretation)}
                disabled={downloadingPDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-h-[44px] active:scale-[0.98]"
                title="Download as PDF"
              >
                {downloadingPDF ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    <span>PDF</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onCopyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl min-h-[44px] active:scale-[0.98]"
              title="Copy shareable link"
            >
              {copiedLink ? (
                <>
                  <span>✅</span>
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Share Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showHelp && (
          <p className="mb-5 text-sm text-slate-400">
            {chartStyle === "north" 
              ? "North Indian (Diamond) style chart. Houses are fixed, Signs move." 
              : "South Indian (Square) style chart. Signs are fixed, Houses move via Ascendant."}
             Click to focus.
          </p>
        )}

        <div
          id="rasi-chart"
          className="flex justify-center items-center rounded-xl bg-slate-900 p-4 sm:p-6 md:p-8 shadow-inner overflow-hidden max-w-full"
        >
          {chartData.data.planets && chartData.data.ascendant !== undefined ? (
            chartStyle === "north" ? (
              <NorthIndianChart 
                planets={chartData.data.planets.map(p => ({
                  name: p.name,
                  house: p.house || 1,
                  sign: p.sign || "",
                  degree: p.fullDegree,
                  isRetro: Boolean(p.isRetro)
                }))}
                ascendantSign={Math.floor(chartData.data.ascendant / 30) + 1}
              />
            ) : (
              <SouthIndianChart
                planets={chartData.data.planets.map(p => ({
                  name: p.name,
                  house: p.house || 1,
                  sign: p.sign || "",
                  degree: p.fullDegree,
                  isRetro: Boolean(p.isRetro)
                }))}
                ascendantSign={Math.floor(chartData.data.ascendant / 30) + 1}
              />
            )
          ) : svgData ? (
             <div dangerouslySetInnerHTML={{ __html: svgData.data.svg_code }} />
          ) : (
             <p className="text-slate-500">Chart data unavailable</p>
          )}
        </div>
      </div>

      {/* Next Steps Card */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
        <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <span className="text-xl">🎯</span>
          Next Steps
        </p>
        <ul className="mb-5 space-y-2.5 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>
              Explore <strong className="text-white">Divisional Charts</strong> for marriage,
              career, and wealth insights
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>Consult with an astrologer for personalized readings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>Save this chart for future reference and analysis</span>
          </li>
        </ul>
        <button
          onClick={onSwitchToDivisional}
          className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl"
        >
          <span>Explore Divisional Charts</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
      <InterpretationModal
        isOpen={showInterpretation}
        onClose={() => setShowInterpretation(false)}
        loading={interpreting}
        interpretation={interpretation}
        onGenerate={() => generateInterpretation()}
      />
    </div>
  );
}
