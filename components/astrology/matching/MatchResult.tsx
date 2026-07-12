"use client";

import { MatchmakingResult } from "@/lib/astrology/calculations/Matchmaking";

interface MatchResultProps {
  result: MatchmakingResult;
  profiles: {
    boyName: string;
    girlName: string;
  };
  onReset: () => void;
}

export default function MatchResult({ result, profiles, onReset }: MatchResultProps) {
  const { totalScore, maxScore, verdict, kutas, mangalDosha, details } = result;

  const percentage = Math.round((totalScore / maxScore) * 100);

  const getVerdictStyle = (v: string) => {
     switch (v) {
        case "Excellent": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "Good": return "text-green-400 bg-green-500/10 border-green-500/20";
        case "Average": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        case "Not Recommended": 
        case "Bad": return "text-red-400 bg-red-500/10 border-red-500/20";
        default: return "text-slate-400 bg-slate-500/10";
     }
  };

  const verdictStyle = getVerdictStyle(verdict);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Score Card */}
       <div className={`rounded-2xl border p-6 text-center ${verdictStyle}`}>
          <h3 className="mb-2 text-lg font-medium opacity-80">Compatibility Verdict</h3>
          <p className="mb-4 text-3xl font-bold uppercase tracking-wider">{verdict}</p>
          
          <div className="flex items-center justify-center gap-4">
             <div className="text-right">
                <p className="text-4xl font-bold">{totalScore}</p>
                <p className="text-xs opacity-60">Gunas Obtained</p>
             </div>
             <div className="h-12 w-px bg-current opacity-20"></div>
             <div className="text-left">
                <p className="text-4xl font-bold opacity-60">{maxScore}</p>
                <p className="text-xs opacity-60">Total Gunas</p>
             </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/20">
             <div 
               className={`h-full transition-all duration-1000 ease-out ${verdict === 'Excellent' ? 'bg-emerald-400' : verdict === 'Good' ? 'bg-green-400' : verdict === 'Average' ? 'bg-yellow-400' : 'bg-red-400'}`} 
               style={{ width: `${percentage}%` }}
             ></div>
          </div>
          <p className="mt-1 text-xs opacity-50">{percentage}% Compatibility</p>
       </div>

       {/* Mangal Dosha Alert */}
       <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
             <span className="text-orange-500">🔥</span> Mangal Dosha Check
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-3">
             <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs text-slate-400">{profiles.boyName}'s Status</p>
                <p className={`font-medium ${mangalDosha.boy.hasDosha ? "text-red-400" : "text-green-400"}`}>
                   {mangalDosha.boy.hasDosha ? (mangalDosha.boy.isCancelled ? "Cancelled Dosha" : "Dosha Present") : "No Dosha"}
                </p>
             </div>
             <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs text-slate-400">{profiles.girlName}'s Status</p>
                <p className={`font-medium ${mangalDosha.girl.hasDosha ? "text-red-400" : "text-green-400"}`}>
                   {mangalDosha.girl.hasDosha ? (mangalDosha.girl.isCancelled ? "Cancelled Dosha" : "Dosha Present") : "No Dosha"}
                </p>
             </div>
             <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs text-slate-400">Overall Match</p>
                <p className={`font-bold ${mangalDosha.match === "Safe" ? "text-green-400" : "text-red-400"}`}>
                   {mangalDosha.match}
                </p>
             </div>
          </div>
          
          {mangalDosha.match !== "Safe" && (
             <p className="mt-4 text-sm text-red-300">
                ⚠️ Mangal Dosha mismatch detected. Consulting an astrologer is recommended before proceeding.
             </p>
          )}
       </div>
       
       {/* Details Table */}
       <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
               <p className="font-semibold text-blue-300">🤵 {profiles.boyName}</p>
               <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                     <span className="text-slate-400">Rashi:</span>
                     <span className="text-white">{details?.boyRashi || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-400">Nakshatra:</span>
                     <span className="text-white">{details?.boyNakshatra || "Unknown"}</span>
                  </div>
               </div>
            </div>
            
            <div className="rounded-lg bg-pink-500/10 p-4 border border-pink-500/20">
               <p className="font-semibold text-pink-300">👰 {profiles.girlName}</p>
               <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                     <span className="text-slate-400">Rashi:</span>
                     <span className="text-white">{details?.girlRashi || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-400">Nakshatra:</span>
                     <span className="text-white">{details?.girlNakshatra || "Unknown"}</span>
                  </div>
               </div>
            </div>
       </div>

       {/* Kuta Breakdown */}
       <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Ashta Kuta Breakdown</h4>
          <div className="space-y-3">
             {kutas.map((koot) => (
                <div key={koot.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition hover:bg-white/10">
                   <div>
                      <p className="font-medium text-white">{koot.name}</p>
                      <p className="text-xs text-slate-400">{koot.description}</p>
                   </div>
                   <div className="text-right">
                      <p className={`font-bold ${koot.score === koot.total ? "text-green-400" : koot.score === 0 ? "text-red-400" : "text-yellow-400"}`}>
                         {koot.score} <span className="text-slate-500 font-normal">/ {koot.total}</span>
                      </p>
                   </div>
                </div>
             ))}
          </div>
       </div>

       <button
          onClick={onReset}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
       >
          Check Another Match
       </button>
    </div>
  );
}
