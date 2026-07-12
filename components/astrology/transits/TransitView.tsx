"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import TransitReport from "@/components/reports/TransitReport";
import { generatePdf } from "@/lib/reports/generatePdf";
import { useToast } from "@/components/ui/toast";
import { TransitSkeleton } from "@/components/ui/skeleton";

interface TransitAspect {
  transitPlanet: string;
  transitLongitude: number;
  natalPlanet: string;
  natalLongitude: number;
  aspect: string;
  nature: "intense" | "challenging" | "harmonious";
  exactness: number;
  effect: string;
  significance: "critical" | "major" | "notable" | "minor";
}

interface TransitsData {
  transitTime: string;
  summary: {
    totalAspects: number;
    overallTone: "challenging" | "favorable" | "mixed";
    interpretation: string;
  };
  activeTransits: TransitAspect[];
}

interface TransitViewProps {
  birthDetails: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: number;
    location: string;
    userName: string;
  };
}

export default function TransitView({ birthDetails }: TransitViewProps) {
  const [data, setData] = useState<TransitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { user } = useSupabaseAuth(); // Keep for auth check if needed, but prefer props for report
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTransits() {
      try {
        const response = await fetch("/api/astrology/transits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateTime: birthDetails.dateTime,
            latitude: birthDetails.latitude,
            longitude: birthDetails.longitude,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transits");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTransits();
    }
  }, [birthDetails, user]);

  if (loading) {
    return <TransitSkeleton />;
  }

  const refetchTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/astrology/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: birthDetails.dateTime,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch transits");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-full">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-200">Unable to load transit data</p>
            <p className="mt-1 text-sm text-red-300/90">{error}</p>
            <p className="mt-2 text-xs text-red-300/70">
              💡 This could be a temporary issue. Check your connection and try again.
            </p>
          </div>
        </div>
        <button
          onClick={refetchTransits}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-200 transition-all hover:bg-red-500/30"
        >
          <span>🔄</span>
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, activeTransits } = data;

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "favorable": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "challenging": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case "harmonious": return "text-emerald-400";
      case "challenging": return "text-red-400";
      case "intense": return "text-purple-400";
      default: return "text-slate-400";
    }
  };

  const handleDownloadPdf = async () => {
    if (!data) return;
    setIsGeneratingPdf(true);
    try {
      // Small delay to ensure render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const safeName = birthDetails.userName.replace(/[^a-zA-Z0-9]/g, "_") || "User";
      const dateStr = birthDetails.dateTime.split("T")[0];
      const filename = `Transits_${safeName}_${dateStr}.pdf`;

      await generatePdf("transit-report-root", filename);
      toast("PDF Downloaded Successfully", "success");
    } catch (e) {
      console.error("PDF Generation failed", e);
      toast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
         <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
         >
            {isGeneratingPdf ? (
               <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  <span>Generating...</span>
               </>
            ) : (
               <>
                  <span>📄</span>
                  <span>Download Report</span>
               </>
            )}
         </button>
      </div>

      {/* Summary Card */}
      <div className={`rounded-xl border p-6 ${getToneColor(summary.overallTone)}`}>
        <h3 className="mb-2 text-lg font-semibold">Cosmic Weather Report</h3>
        <p className="text-xl font-medium mb-1 capitalize">{summary.overallTone} Period</p>
        <p className="text-sm opacity-90">{summary.interpretation}</p>
      </div>

      {/* Active Transits List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Transits</h3>
        
        {activeTransits.map((transit, idx) => (
          <div 
            key={`${transit.transitPlanet}-${transit.natalPlanet}-${idx}`}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            {/* Importance Indicator */}
            {transit.significance === "critical" && (
              <div className="absolute right-0 top-0 rounded-bl-lg bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
                CRITICAL
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-white">{transit.transitPlanet}</span>
                  <span className="text-xs text-slate-500">transiting</span>
                  <span className={`text-sm font-medium ${getNatureColor(transit.nature)} capitalize`}>
                    {transit.aspect}
                  </span>
                  <span className="text-xs text-slate-500">natal</span>
                  <span className="font-semibold text-white">{transit.natalPlanet}</span>
                </div>
                
                <p className="text-sm text-slate-300">{transit.effect}</p>
              </div>
            </div>

            {/* Technical Details (Optional/Collapsible in future) */}
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Orb: {transit.exactness.toFixed(2)} intensity</span>
              <span className="capitalize text-slate-400">{transit.significance}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden PDF Report */}
      <div className="absolute top-0 left-0 -z-50 h-0 w-0 overflow-hidden opacity-0">
         <TransitReport 
            data={data} 
            user={{
               name: birthDetails.userName || user?.user_metadata?.name || "User",
               dateTime: birthDetails.dateTime,
               location: birthDetails.location || "Unknown Location"
            }} 
         />
      </div>
    </div>
  );
}
