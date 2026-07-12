"use client";

import { useState } from "react";
import MatchInputForm, { MatchProfile } from "./MatchInputForm";
import MatchResult from "./MatchResult";
import { MatchmakingResult } from "@/lib/astrology/calculations/Matchmaking";
import MatchmakingReport from "@/components/reports/MatchmakingReport";
import { generatePdf } from "@/lib/reports/generatePdf";
import { useToast } from "@/components/ui/toast";

export default function MatchingPanel() {
  const [result, setResult] = useState<MatchmakingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState({ 
     boyName: "", boyTime: "", boyLoc: "",
     girlName: "", girlTime: "", girlLoc: "" 
  });

  const handleMatch = async (boy: MatchProfile, girl: MatchProfile) => {
    setLoading(true);
    setError(null);
    setProfiles({ 
       boyName: boy.name, boyTime: boy.dateTime, boyLoc: boy.location,
       girlName: girl.name, girlTime: girl.dateTime, girlLoc: girl.location
    });

    try {
      const response = await fetch("/api/astrology/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boy: { 
             dateTime: boy.dateTime,
             latitude: boy.latitude, 
             longitude: boy.longitude 
          },
          girl: { 
             dateTime: girl.dateTime, 
             latitude: girl.latitude, 
             longitude: girl.longitude 
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate match");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 500)); // Render wait
      await generatePdf("matchmaking-report-root", `Match_${profiles.boyName}_${profiles.girlName}.pdf`);
      toast("Match Report Downloaded Successfully", "success");
    } catch (e) {
      console.error(e);
      setError("Failed to generate PDF");
      toast("Failed to generate PDF", "error");
    } finally {
       setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm relative">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
         <div>
            <h2 className="text-2xl font-bold text-white">Check Compatibility</h2>
            <p className="text-sm text-slate-400">Enter birth details for both individuals</p>
         </div>
         
         {result && (
            <button
               onClick={handleDownloadPdf}
               disabled={isGeneratingPdf}
               className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-50"
            >
               {isGeneratingPdf ? "Generating..." : "📄 Download Report"}
            </button>
         )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-red-300">
          {error}
        </div>
      )}

      {!result ? (
        <MatchInputForm loading={loading} onSubmit={handleMatch} />
      ) : (
        <MatchResult 
           result={result} 
           profiles={{ boyName: profiles.boyName, girlName: profiles.girlName }} 
           onReset={() => setResult(null)} 
        />
      )}
      
      {/* Hidden Report */}
      {result && (
         <div className="absolute top-0 left-0 -z-50 h-0 w-0 overflow-hidden opacity-0">
            <MatchmakingReport 
               data={{
                  result,
                  boy: { name: profiles.boyName, dateTime: profiles.boyTime, location: profiles.boyLoc },
                  girl: { name: profiles.girlName, dateTime: profiles.girlTime, location: profiles.girlLoc }
               }} 
            />
         </div>
      )}
    </div>
  );
}
