"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { exportAIReportAsPdf } from "@/lib/pdf";

interface AIInterpretationPanelProps {
  chartData: any;
  chartName: string;
  birthDetails?: {
    date: string;
    time: string;
    location: string;
  };
  // Birth data for enriched AI context (Dasha calculation)
  birthDate?: string;   // ISO date string e.g. "1990-01-15"
  birthTime?: string;   // HH:MM format e.g. "10:30"
  birthTimeKnown?: boolean;  // false = Surya Kundli (noon default)
  // Lifted state props for persistence across tab switches
  completion: string;
  setCompletion: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
  onClear?: () => void;
  
  // New props for variant
  variant?: "chat" | "report";
  title?: string;
  subtitle?: string | React.ReactNode;
  customPrompt?: string;
}

export default function AIInterpretationPanel({
  chartData,
  chartName,
  birthDetails,
  birthDate,
  birthTime,
  birthTimeKnown,
  completion,
  setCompletion,
  isLoading,
  setIsLoading,
  error,
  setError,
  onClear,
  variant = "chat",
  title = "AI Astrologer Insights",
  subtitle = "Get a personalized reading powered by Vedic logic.",
  customPrompt
}: AIInterpretationPanelProps) {
  // AbortController stays local (it's transient per-generation)
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const stop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setCompletion("");
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Send minimal necessary data to save tokens
      const { planets, ascendant } = chartData;
      const minimalData = { 
          ascendant, 
          planets: planets.map((p: any) => ({ 
              name: p.name, 
              fullDegree: p.fullDegree,
              sign: p.sign, 
              house: p.house, 
              nakshatra: p.nakshatra,
              isRetro: p.isRetro,
              dignity: p.dignity 
          }))
      };
      
      const defaultPrompt = variant === "report" 
        ? "Please provide a comprehensive, detailed Vedic Astrology report covering planetary positions, nature, strengths, and key predictions. Format with clear headings."
        : "Please provide a concise, friendly summary of the key highlights of my birth chart. Keep it chatty and brief (under 200 words).";

      const response = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           chartData: minimalData,
           prompt: customPrompt || defaultPrompt,
           birthDate,
           birthTime,
           birthTimeKnown,
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        accumulated += text;
        setCompletion(accumulated);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error("AI Error:", err);
        setError(err.message || "Failed to generate reading");
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!completion) return;
    setDownloadingPdf(true);
    try {
      const fileName = `${chartName.replace(/\s+/g, "_")}_${
        variant === "report" ? "Full_Report" : "Insights"
      }.pdf`;

      await exportAIReportAsPdf({
        chartName,
        birthDetails,
        content: completion,
        fileName,
        title:
          variant === "report"
            ? "Detailed Vedic Astrology Report"
            : "Astrological Insights",
      });
    } catch (err) {
      console.error("PDF download failed:", err);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleStartNew = () => {
    if (onClear) {
      onClear();
    }
  };


  const isReport = variant === "report";

  return (
    <div className={`w-full ${isReport ? "" : "max-w-4xl mx-auto"} space-y-6`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {title} {variant === "chat" && <span className="text-sm font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded ml-2">Beta</span>}
          </h2>
          <p className="text-slate-400">
            {chartName} — {subtitle}
          </p>
        </div>
        
        {/* Initial state - show Generate button */}
        {!isLoading && !completion && (
            <button
            onClick={handleGenerate}
            className={`px-6 py-3 font-semibold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                isReport 
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-emerald-500/25"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25"
            }`}
            >
            <span>{isReport ? "📑" : "✨"}</span> {isReport ? "Generate Full Report" : "Ask AI"}
            </button>
        )}
        
        {/* Loading state - show Stop button */}
        {isLoading && (
            <button
            onClick={stop}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-600 transition-all flex items-center gap-2"
            >
            <span>⏹</span> Stop Generation
            </button>
        )}

        {/* Completed state - show action buttons (Only for Report or if explicitly enabled) */}
        {!isLoading && completion && isReport && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 
                         hover:from-blue-500 hover:to-cyan-500 
                         text-white font-medium rounded-xl shadow-lg 
                         shadow-blue-500/20 transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
            >
              {downloadingPdf ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>📥</span>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-600 transition-all flex items-center gap-2"
            >
                🖨 Print
            </button>
          </div>
        )}
        
        {!isLoading && completion && !isReport && onClear && (
            <button
               onClick={handleStartNew}
               className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-600 rounded-xl"
            >
                🔄 Refresh
            </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200">
           <strong>Error:</strong> {error}
        </div>
      )}

      {/* Output Area */}
      {(completion || isLoading) && (
        <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 min-h-[100px] shadow-inner ${isReport ? "prose-lg" : ""}`}>
           {completion ? (
            <div className={`prose prose-invert ${isReport ? "max-w-none" : "prose-purple max-w-none"}`}>
                <ReactMarkdown>{completion}</ReactMarkdown>
            </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-48 space-y-4 text-slate-500 animate-pulse">
                <div className="text-4xl">🔮</div>
                <p>Consulting the stars...</p>
             </div>
           )}
           
           {isLoading && completion && (
             <div className="mt-4 flex gap-1 justify-center opacity-50">
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           )}
        </div>
      )}
      
      {!completion && !isLoading && !error && (
         <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
               {isReport ? "📑" : "✨"}
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">{isReport ? "Generate Detailed Report" : "Get Quick Insights"}</h3>
            <p className="text-slate-500 max-w-md mx-auto">
               {isReport 
                 ? "Generate a comprehensive analysis of planetary positions, dignities, and houses."
                 : "Get a concise summary and highlights of your birth chart."}
            </p>
         </div>
      )}

    </div>
  );
}

