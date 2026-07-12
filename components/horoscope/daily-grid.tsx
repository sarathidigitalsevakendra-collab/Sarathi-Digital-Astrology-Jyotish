"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import HoroscopeCard from "@components/horoscope/horoscope-card";
import FirstVisitModal from "@components/dialogs/FirstVisitModal";
import { getDailyHoroscope } from "@lib/api/horoscope";
import type { LocaleCode, SunSign } from "@digital-astrology/lib";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SIGN_MAP: Array<{
  sunSign: SunSign;
  western: string;
  vedic: string;
  icon: string;
}> = [
  { sunSign: "aries", western: "Aries", vedic: "Mesha", icon: "♈" },
  { sunSign: "taurus", western: "Taurus", vedic: "Vrishabha", icon: "♉" },
  { sunSign: "gemini", western: "Gemini", vedic: "Mithuna", icon: "♊" },
  { sunSign: "cancer", western: "Cancer", vedic: "Karka", icon: "♋" },
  { sunSign: "leo", western: "Leo", vedic: "Simha", icon: "♌" },
  { sunSign: "virgo", western: "Virgo", vedic: "Kanya", icon: "♍" },
  { sunSign: "libra", western: "Libra", vedic: "Tula", icon: "♎" },
  { sunSign: "scorpio", western: "Scorpio", vedic: "Vrishchika", icon: "♏" },
  { sunSign: "sagittarius", western: "Sagittarius", vedic: "Dhanu", icon: "♐" },
  { sunSign: "capricorn", western: "Capricorn", vedic: "Makara", icon: "♑" },
  { sunSign: "aquarius", western: "Aquarius", vedic: "Kumbha", icon: "♒" },
  { sunSign: "pisces", western: "Pisces", vedic: "Meena", icon: "♓" },
];

type SystemType = "vedic" | "western";

export default function DailyHoroscopeGrid(): React.ReactElement {
  const [system, setSystem] = useState<SystemType>("western");
  const [selectedSign, setSelectedSign] = useState<SunSign>("aries");
  const [viewMode, setViewMode] = useState<"focused" | "grid">("focused");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const locale: LocaleCode = system === "vedic" ? "hi" : "en";

  const { data, isLoading } = useQuery({
    queryKey: ["horoscope", "daily", system],
    queryFn: () => getDailyHoroscope({ system, locale }),
  });

  // Persist user preference
  useEffect(() => {
    const savedSign = localStorage.getItem("userSunSign");
    if (savedSign) {
        // Validate it's a valid sign
        const valid = SIGN_MAP.find(s => s.sunSign === savedSign);
        if (valid) setSelectedSign(savedSign as SunSign);
    }
  }, []);

  const handleSignSelect = (sign: SunSign) => {
    setSelectedSign(sign);
    localStorage.setItem("userSunSign", sign);
    setViewMode("focused");
  };

  const signs = SIGN_MAP.map((sign) => ({
    ...sign,
    label: system === "vedic" ? sign.vedic : sign.western,
    dataKey: sign.western,
  }));

  const selectedSignData = signs.find(s => s.sunSign === selectedSign);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
        const scrollAmount = 200;
        scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    }
  };

  return (
    <section id="daily-horoscope" className="px-6 lg:px-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h2 className="gradient-title">Today's Horoscope</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-300">
             Your daily cosmic guidance tailored to your sign.
             Updated sunrise to sunrise.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
             {/* System Toggle */}
             <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-200">
                <button
                    className={`rounded-full px-4 py-2 transition ${system === "vedic" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "hover:text-white"}`}
                    onClick={() => setSystem("vedic")}
                >
                    Vedic
                </button>
                <button
                    className={`rounded-full px-4 py-2 transition ${system === "western" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "hover:text-white"}`}
                    onClick={() => setSystem("western")}
                >
                    Western
                </button>
             </div>

              {/* View Mode Toggle */}
             <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
                 <button
                    onClick={() => setViewMode("focused")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "focused" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                    title="Focused View"
                 >
                    <span className="text-sm">📋</span> Focused
                 </button>
                 <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "grid" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                    title="Grid View"
                 >
                    <span className="text-sm">🔲</span> Grid
                 </button>
             </div>
        </div>
      </div>

      <FirstVisitModal onSelect={handleSignSelect} />

      {/* Carousel Selector - Mobile Optimized */}
      <div className="relative mb-8">
         {/* Left Arrow - Always visible on mobile with touch-friendly size */}
         <button 
             onClick={() => scroll("left")}
             aria-label="Scroll left"
             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-slate-900/90 border border-white/20 rounded-full text-white shadow-lg -ml-3 md:-ml-4 focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-95 transition-transform"
         >
             <ChevronLeft className="w-6 h-6 md:w-5 md:h-5" />
         </button>
         
         <div 
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
         >
             {signs.map((sign) => (
                 <button
                    key={sign.sunSign}
                    onClick={() => handleSignSelect(sign.sunSign)}
                    aria-label={`Select ${sign.label}`}
                    className={`flex flex-col items-center gap-2 min-w-[88px] md:min-w-[80px] p-4 md:p-3 rounded-2xl border transition-all snap-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-95 ${
                        selectedSign === sign.sunSign
                            ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105"
                            : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                 >
                     <span className="text-3xl md:text-2xl">{sign.icon}</span>
                     <span className={`text-sm md:text-xs font-medium ${selectedSign === sign.sunSign ? "text-orange-200" : "text-slate-400"}`}>
                         {sign.label}
                     </span>
                 </button>
             ))}
         </div>

         {/* Right Arrow */}
         <button 
             onClick={() => scroll("right")}
             aria-label="Scroll right"
             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-slate-900/90 border border-white/20 rounded-full text-white shadow-lg -mr-3 md:-mr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-95 transition-transform"
         >
             <ChevronRight className="w-6 h-6 md:w-5 md:h-5" />
         </button>
      </div>

      {/* Content Area */}
      {viewMode === "focused" && selectedSignData ? (
          <div key={selectedSign} className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <HoroscopeCard
                sign={selectedSignData.label}
                sunSign={selectedSignData.sunSign}
                data={data?.[selectedSignData.dataKey]}
                loading={isLoading}
                locale={locale}
             />
             
             <div className="mt-8 text-center">
                 <button 
                    onClick={() => setViewMode("grid")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
                 >
                    View all 12 signs
                    <ChevronRight className="w-4 h-4 text-orange-400" />
                 </button>
             </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {signs.map((sign) => (
            <HoroscopeCard
                key={sign.label}
                sign={sign.label}
                sunSign={sign.sunSign}
                data={data?.[sign.dataKey]}
                loading={isLoading}
                locale={locale}
            />
            ))}
        </div>
      )}
    </section>
  );
}
