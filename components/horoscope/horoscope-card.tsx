"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HoroscopeEntry, LocaleCode, SunSign } from "@digital-astrology/lib";
import { getDailyInterpretation } from "@lib/api/horoscope";
import { MOCK_HOROSCOPE_DATA } from "@lib/api/mock-horoscope-data";
import { Clock, Info, Moon, Sparkles } from "lucide-react";

interface Props {
  sign: string;
  sunSign: SunSign;
  locale: LocaleCode;
  data?: HoroscopeEntry;
  loading?: boolean;
}

const SIGN_COLORS: Record<string, string> = {
    aries: "from-red-500/10 to-orange-500/5",
    taurus: "from-green-500/10 to-emerald-500/5",
    gemini: "from-yellow-500/10 to-orange-500/5",
    cancer: "from-blue-500/10 to-indigo-500/5",
    leo: "from-orange-500/10 to-amber-500/5",
    virgo: "from-emerald-500/10 to-green-500/5",
    libra: "from-pink-500/10 to-rose-500/5",
    scorpio: "from-purple-900/20 to-indigo-900/10",
    sagittarius: "from-purple-500/10 to-violet-500/5",
    capricorn: "from-slate-700/20 to-slate-800/10",
    aquarius: "from-cyan-500/10 to-blue-500/5",
    pisces: "from-teal-500/10 to-cyan-500/5"
};

export default function HoroscopeCard({ sign, sunSign, locale, data, loading }: Props) {
  const [showInterpretation, setShowInterpretation] = useState(false);
  
  // Use mock data for realism until API is live
  const mockContent = MOCK_HOROSCOPE_DATA[sunSign];
  const bgGradient = SIGN_COLORS[sunSign] || "from-white/10 via-white/5 to-white/0";

  const {
    data: interpretation,
    refetch,
    isFetching,
    isFetched,
    status,
  } = useQuery({
    queryKey: ["horoscope", "interpretation", sunSign, locale],
    queryFn: () =>
      getDailyInterpretation({
        sunSign,
        locale,
        tone: "uplifting",
        focus: "career",
      }),
    enabled: false,
    staleTime: 1000 * 60 * 60, // cache for an hour per sign/locale combo
  });

  const handleToggleInterpretation = async () => {
    if (!isFetched) {
      const result = await refetch();
      if (result.error) {
        return;
      }
    }

    setShowInterpretation((prev) => !prev);
  };

  const interpretationError = status === "error";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${bgGradient} p-6 shadow-xl transition-all hover:border-white/10`}>
       {/* Card header with icon and planet */}
       <div className="flex justify-between items-start mb-4">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-xl font-bold text-white">{sign}</h3>
                     <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                         {mockContent.element}
                     </span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                     <Moon className="w-3 h-3" />
                     <span>Waning Crescent</span>
                 </div>
            </div>
            <div className="text-right">
                 <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ruling Planet</p>
                 <p className="text-sm text-indigo-300 font-medium">{mockContent.planet}</p>
            </div>
       </div>

       {loading ? (
        <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-200 font-light">
                {data?.summary && !data.summary.toLowerCase().includes("sample") ? data.summary : mockContent.summary}
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/20 rounded-lg p-2.5 flex items-center gap-2 border border-white/5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <div>
                        <p className="text-slate-500">Lucky Number</p>
                        <p className="text-white font-mono">{data?.luckyNumber || mockContent.number}</p>
                    </div>
                </div>
                <div className="bg-black/20 rounded-lg p-2.5 flex items-center gap-2 border border-white/5">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-500" style={{ backgroundColor: (data?.luckyColor || mockContent.color).toLowerCase() }}></div>
                    <div>
                        <p className="text-slate-500">Power Color</p>
                        <p className="text-white">{data?.luckyColor || mockContent.color}</p>
                    </div>
                </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5">
                 <div className="flex items-center gap-1.5" title="Refreshed at 6:00 AM based on sunrise">
                     <Clock className="w-3 h-3" />
                     <span>Updated 2h ago</span>
                 </div>
                 <div className="flex items-center gap-1">
                     <span>Confidence:</span>
                     <span className="text-green-400 font-medium">98%</span>
                 </div>
            </div>
        </div>
      )}

      {/* AI Insight Section */}
      <div className="mt-5">
        <button
          onClick={handleToggleInterpretation}
          disabled={loading || isFetching}
          className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:grayscale"
        >
           <Sparkles className="w-5 h-5 text-white animate-pulse" />
           {isFetching ? "Asking Stars..." : showInterpretation ? "Hide Cosmic Detail" : (
             <span className="flex items-center gap-1">
                Get AI Insight <span className="bg-white/20 px-1.5 py-0.5 rounded textxs text-white/90">Premium</span>
             </span>
           )}
        </button>
        
        {interpretationError && (
          <p className="mt-2 text-xs text-red-300 text-center">
            Cosmic interference. Try again later.
          </p>
        )}
        
        {showInterpretation && interpretation && (
          <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 text-sm text-slate-200 animate-in fade-in slide-in-from-top-2">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">
                <Info className="w-3 h-3" />
                AI Astrologer Analysis
            </h4>
            <p className="leading-relaxed whitespace-pre-line text-xs md:text-sm opacity-90">
              {interpretation.interpretation.narrative}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
