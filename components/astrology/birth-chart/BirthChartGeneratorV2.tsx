/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useMemo, useState } from "react";
import { useBirthChart } from "@/hooks/astrology/useBirthChart";
import { useBirthChartActions } from "@/hooks/astrology/useBirthChartActions";
import BirthChartForm from "./BirthChartForm";
import BirthChartDisplay from "./BirthChartDisplay";
import DivisionalChartsPanel from "./DivisionalChartsPanel";
import AIInterpretationPanel from "../AIInterpretationPanel";
import { exportChartAsPdf, isPdfExportEnabled } from "@/lib/pdf";
import {
  getFullChartName,
  getFormattedBirthDateTime,
  buildDownloadFilename,
  DIVISIONAL_CHARTS,
} from "@/services/astrology/birthChartService";
import { useToast } from "@/components/ui/toast";
import { BirthChartSkeleton } from "@/components/ui/skeleton";
import { calculateDignity, calculateFunctionalNature, calculateStrengthScore } from "@/lib/astrology/calculations/Dignity";
import { RASHI_LORDS } from "@/lib/astrology/calculations/VedicMath";
import { Planet } from "@/types/astrology/birthChart.types";
import { formatDistanceToNow } from "date-fns";

interface BirthChartGeneratorProps {
  userId: string;
  userEmail: string;
}

export default function BirthChartGeneratorV2({
  userId: _userId,
  userEmail: _userEmail,
}: BirthChartGeneratorProps) {
  const {
    state,
    // activeTab, // Unused
    showHelp,
    // expandedPlanet, // Unused
    aiInsights,
    setBirthData,
    // setActiveTab, // Unused
    // setShowHelp, // Unused
    // setExpandedPlanet, // Unused
    setError,
    setAiInsights,
    generateBirthChart,
    selectDivisional,
    clearAiInsights,
  } = useBirthChart();

  const {
    downloadingPNG,
    downloadingPDF,
    copiedLink,
    savingChart,
    savedChartId,
    handleDownloadPNG,
    handleCopyShareLink,
    handleSaveChart,
  } = useBirthChartActions({
    birthData: state.birthData,
    chartData: state.chartData,
    selectedDivisional: state.selectedDivisional,
    setError,
  });

  const { toast } = useToast();

  const [isGeneratingPdf, _setIsGeneratingPdf] = useState(false);

  // Removed unused advanced report data fetching and KundliReport rendering
  // If needed, we can re-enable specialized data fetching hooks here.

  const handleDownloadChartPDF = async () => {
    if (!state.birthData) return;
    try {
      const fullChartName = getFullChartName(
        state.birthData,
        state.selectedDivisional,
        DIVISIONAL_CHARTS
      );
      const filename = buildDownloadFilename(
        state.birthData,
        state.selectedDivisional,
        "pdf"
      );
      const formatted = getFormattedBirthDateTime(state.birthData.dateTime);
      await exportChartAsPdf({
        elementId: "rasi-chart",
        fileName: filename,
        chartName: fullChartName,
        birthDate: formatted.full,
        birthPlace: state.birthData.location,
      });
      toast("Chart PDF Downloaded", "success");
    } catch (e) {
      console.error("Chart PDF download failed:", e);
      setError("Failed to download chart as PDF. Please try again.");
      toast("Chart PDF Download Failed", "error");
    }
  };

  // Calculate Processed Planets with Dignity/Nature for Display
  const processedChartData = useMemo(() => {
    if (!state.chartData?.data?.planets) return state.chartData;

    const ascendant = state.chartData.data.ascendant || 0;
    const ascendantSign = Math.floor(ascendant / 30) + 1;

    const enhancedPlanets = state.chartData.data.planets.map((p: Planet) => {
       const signNum = Math.floor(p.fullDegree / 30) + 1;
       const host = RASHI_LORDS[signNum] || "Neutral";
       const dignity = calculateDignity(p.name, signNum, p.fullDegree % 30, host);
       const nature = calculateFunctionalNature(p.name, ascendantSign);
       const strength = calculateStrengthScore(dignity, !!p.isRetro);

       return {
         ...p,
         dignity,
         nature,
         strength
       };
    });

    return {
      ...state.chartData,
      data: {
        ...state.chartData.data,
        planets: enhancedPlanets
      }
    };
  }, [state.chartData]);

  // Derived Highlights for UI
  const strongestPlanet = useMemo(() => {
    if (!processedChartData?.data?.planets) return null;
    return [...processedChartData.data.planets].sort((a, b) => (b.strength || 0) - (a.strength || 0))[0];
  }, [processedChartData]);
  
  const ascendantSignName = useMemo(() => {
     if (state.chartData?.data?.ascendant === undefined) return "Unknown";
     const signNum = Math.floor(state.chartData.data.ascendant / 30) + 1;
     // Simple lookup array - imported or local? 
     // Using a local fallback if valid service is not imported, but `getSignName` is imported?
     // Actually I'll use logic consistent with existing code or imports.
     // `getSignName` is NOT imported in this file, but `RASHI_LORDS` is.
     // I'll check imports. `getSignName` IS NOT imported.
     // I will use a simple array or just numeric for now, or import `getSignName`.
     // Step 71 shows `getSignName` imported in `BirthChartDisplay`.
     // I will duplicate a simple array to avoid import issues or just import it.
     // I'll assume standard Zodiac order.
     const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
     return signs[signNum - 1] || "Unknown";
  }, [state.chartData]);

  // Handler to scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!state.chartData) {
    // Show loading skeleton while chart is being generated
    if (state.loading) {
      return <BirthChartSkeleton />;
    }

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

  return (
    <div className="space-y-12">
      {/* Navigation / Quick Actions Bar */}
      <div className="sticky top-2 sm:top-4 z-40 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all">
         <div className="flex items-center gap-3 shrink-0">
             <button
               onClick={() => window.location.reload()}
               className="flex h-10 w-10 sm:w-auto items-center justify-center sm:justify-start gap-2 rounded-lg bg-white/5 px-0 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
               title="New Chart"
             >
               <span>←</span> <span className="hidden sm:inline">New Chart</span>
             </button>
             <h2 className="hidden text-sm font-semibold text-white md:block">
               {state.birthData.chartName || "Birth Chart"}
             </h2>
         </div>

         <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
            <button onClick={() => scrollToSection('ai-quick')} className="shrink-0 rounded-full bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-transform" title="AI Insights">
               🤖 AI
            </button>
            <button onClick={() => scrollToSection('chart-visual')} className="shrink-0 rounded-full bg-orange-500/10 px-4 py-2 text-xs font-medium text-orange-300 hover:bg-orange-500/20 active:scale-95 transition-transform" title="Chart Visualization">
               🌟 Chart
            </button>
            <button onClick={() => scrollToSection('divisional')} className="shrink-0 rounded-full bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 hover:bg-blue-500/20 active:scale-95 transition-transform" title="Divisional Charts">
               🔍 Div
            </button>
            <button onClick={() => scrollToSection('full-report')} className="shrink-0 rounded-full bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-300 hover:bg-teal-500/20 active:scale-95 transition-transform" title="Detailed Report">
               📑 Report
            </button>
         </div>
      </div>

      {/* SECTION 1: Quick AI Reading */}
      <div id="ai-quick" className="scroll-mt-28">
         <AIInterpretationPanel
            chartData={processedChartData!.data}
            chartName={state.birthData.chartName || "User"}
            birthDate={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toISOString().split("T")[0] : undefined}
            birthTime={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined}
            completion={aiInsights?.completion ?? ""}
            setCompletion={(val) => setAiInsights((prev: any) => ({
              completion: val,
              isLoading: prev?.isLoading ?? false,
              error: prev?.error ?? null,
              generatedAt: prev?.generatedAt
            }))}
            isLoading={aiInsights?.isLoading ?? false}
            setIsLoading={(val) => setAiInsights((prev: any) => ({
              completion: prev?.completion ?? "",
              isLoading: val,
              error: prev?.error ?? null,
              generatedAt: val ? undefined : new Date()
            }))}
            error={aiInsights?.error ?? null}
            setError={(val) => setAiInsights((prev: any) => ({
              completion: prev?.completion ?? "",
              isLoading: prev?.isLoading ?? false,
              error: val,
              generatedAt: prev?.generatedAt
            }))}
            variant="chat"
            title="Quick AI Insights"
            subtitle={
                <div className="flex flex-col gap-2">
                   <div className="flex items-center justify-between">
                       <span className="flex items-center gap-2">
                            Highlights & Key Strengths 
                            <span className="hidden sm:inline text-slate-500">•</span> 
                            <span className="text-xs text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                Powered by Jyotishya AI Astrologer – Beta
                            </span>
                       </span>
                       {aiInsights?.generatedAt && (
                           <span className="text-xs text-slate-400">
                              Updated {formatDistanceToNow(new Date(aiInsights.generatedAt), { addSuffix: true })}
                           </span>
                       )}
                   </div>
                   {/* Data-Driven Highlights */}
                   <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        {strongestPlanet && (
                            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10">
                                <span>💪</span> Strongest: <span className="text-white font-medium">{strongestPlanet.name}</span>
                            </span>
                        )}
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10">
                             <span>🌅</span> Ascendant: <span className="text-white font-medium">{ascendantSignName}</span>
                        </span>
                   </div>
                </div>
            }
            onClear={clearAiInsights}
         />
         {/* Follow-up Link */}
         <div className="mt-2 text-right">
             <button 
                 onClick={() => window.open('/dashboard/ask-ai', '_blank')} 
                 className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-end gap-1 ml-auto"
             >
                 <span>💬</span> Ask follow-up in Ask AI tab →
             </button>
         </div>
      </div>

      {/* SECTION 2: Main Chart & Planetary Data */}
      <div id="chart-visual" className="scroll-mt-28">
        <BirthChartDisplay
          birthData={state.birthData}
          chartData={processedChartData!}
          svgData={state.svgData["D1"]}
          showHelp={showHelp}
          onSwitchToForm={() => window.location.reload()}
          onSwitchToDivisional={() => scrollToSection('divisional')}
          downloadingPNG={downloadingPNG}
          downloadingPDF={isGeneratingPdf || downloadingPDF}
          copiedLink={copiedLink}
          savingChart={savingChart}
          savedChartId={savedChartId}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={() => scrollToSection('full-report')} // Redirect PDF action to report section
          onDownloadChartPDF={isPdfExportEnabled() ? handleDownloadChartPDF : undefined}
          onCopyLink={handleCopyShareLink}
          onSaveChart={handleSaveChart}
        />
      </div>

      {/* SECTION 3: Divisional Charts */}
      <div id="divisional" className="scroll-mt-28 pt-8 border-t border-slate-800/50">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">📊</span> Divisional Charts
        </h3>
        <DivisionalChartsPanel
          svgData={state.svgData}
          divisionalData={state.divisionalData}
          selectedDivisional={state.selectedDivisional}
          onSelectDivisional={selectDivisional}
        />
      </div>

      {/* SECTION 4: Detailed Report Preview */}
      <div id="full-report" className="scroll-mt-28 pt-8 border-t border-slate-800/50">
         {/* We use a separate state for the detailed report to avoid conflict with the summary */}
         {/* For simplicity in this refactor, we instantiate a second panel requiring manual generation or automated if we want */}
         {/* Note: In a real app we might want to store this in a separate state key than 'aiInsights' which is used for the summary. */}
         {/* I'll use a local state for the detailed report if not passed from prop, but AIInterpretationPanel expects props. */}
         {/* I'll use the 'reportExtras' state I saw earlier or add a new state in this component for 'detailedReport' */}
         
         <DetailedReportSection 
             chartData={processedChartData!.data} 
             chartName={state.birthData.chartName || "User"}
             birthDate={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toISOString().split("T")[0] : undefined}
             birthTime={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined}
             birthDetails={{
                date: new Date(state.birthData.dateTime).toLocaleDateString(),
                time: new Date(state.birthData.dateTime).toLocaleTimeString(),
                location: state.birthData.location
             }}
         />
      </div>

      {/* Hidden PDF Report (Rendered only when chart data exists) */}
      {/* Keeping legacy hidden report for compatibility if needed, but AI panel has its own PDF */}
    </div>
  );
}

// Local wrapper for Detailed Report to manage its own state independent of the summary
function DetailedReportSection({ chartData, chartName, birthDetails, birthDate, birthTime }: { chartData: any, chartName: string, birthDetails: any, birthDate?: string, birthTime?: string }) {
   const [completion, setCompletion] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [generatedAt, setGeneratedAt] = useState<Date | null>(null);



   // Better approach: Update timestamp when loading finishes successfully
   const handleSetIsLoading = (val: boolean) => {
       setIsLoading(val);
       if (!val && completion) {
           setGeneratedAt(new Date());
       }
   };

   return (
     <AIInterpretationPanel 
        chartData={chartData}
        chartName={chartName}
        birthDetails={birthDetails}
        birthDate={birthDate}
        birthTime={birthTime}
        completion={completion}
        setCompletion={setCompletion}
        isLoading={isLoading}
        setIsLoading={handleSetIsLoading}
        error={error}
        setError={setError}
        variant="report"
        title="Detailed AI Jyotish Reading"
        subtitle={
            <div className="flex flex-col gap-1">
                <span>Comprehensive Analysis suitable for Print/PDF. Note: Full content included in PDF download.</span>
                {generatedAt && (
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <span>Last generated: {generatedAt.toLocaleTimeString()} {generatedAt.toLocaleDateString()}</span>
                        <span className="hidden sm:inline text-slate-600">•</span>
                        <span className="text-indigo-300">Updated {formatDistanceToNow(generatedAt, { addSuffix: true })}</span>
                    </span>
                )}
            </div>
        }
     />
   );
}
