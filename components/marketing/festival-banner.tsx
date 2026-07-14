"use client";

import { useState, useEffect } from "react";
import { Festival, getActiveFestival } from "@/lib/festivals";

export function FestivalBanner() {
  const [festival, setFestival] = useState<Festival | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // For demo purposes, if no festival is active today, we can randomly show one
    // or just show Makar Sankranti for testing if uncommented.
    // const active = getActiveFestival() || festivals[1]; 
    const active = getActiveFestival();
    
    if (active) {
      const dismissed = localStorage.getItem(`dismissed_festival_${active.id}`);
      if (!dismissed) {
        setFestival(active);
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible || !festival) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`dismissed_festival_${festival.id}`, "true");
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-xl">🪔</span>
          <p>{festival.message}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-sm">
          <div className="bg-white/20 px-3 py-1 rounded border border-white/30 flex items-center gap-2">
            Code: <strong className="tracking-wider">{festival.discountCode}</strong>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
