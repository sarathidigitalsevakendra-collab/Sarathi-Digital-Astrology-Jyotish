"use client";

import { useEffect, useState } from "react";
import type { SunSign } from "@digital-astrology/lib";
import { X } from "lucide-react";

interface Props {
  onSelect: (sign: SunSign) => void;
}

const SIGN_ICONS: Array<{ sign: SunSign; icon: string; name: string }> = [
  { sign: "aries", icon: "♈", name: "Aries" },
  { sign: "taurus", icon: "♉", name: "Taurus" },
  { sign: "gemini", icon: "♊", name: "Gemini" },
  { sign: "cancer", icon: "♋", name: "Cancer" },
  { sign: "leo", icon: "♌", name: "Leo" },
  { sign: "virgo", icon: "♍", name: "Virgo" },
  { sign: "libra", icon: "♎", name: "Libra" },
  { sign: "scorpio", icon: "♏", name: "Scorpio" },
  { sign: "sagittarius", icon: "♐", name: "Sagittarius" },
  { sign: "capricorn", icon: "♑", name: "Capricorn" },
  { sign: "aquarius", icon: "♒", name: "Aquarius" },
  { sign: "pisces", icon: "♓", name: "Pisces" },
];

export default function FirstVisitModal({ onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedSign = localStorage.getItem("userSunSign");
    if (!savedSign) {
       const timer = setTimeout(() => setIsOpen(true), 1500);
       return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleSelect = (sign: SunSign) => {
    setIsOpen(false);
    onSelect(sign);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#0a0f29] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            What is your Zodiac Sign?
          </h2>
          <p className="text-slate-400 text-sm">
             Select your sign to personalize your daily cosmic guidance.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {SIGN_ICONS.map((item) => (
               <button
                  key={item.sign}
                  onClick={() => handleSelect(item.sign)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all hover:scale-105 group"
               >
                   <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                   <span className="text-xs font-medium text-slate-300 group-hover:text-white">{item.name}</span>
               </button>
           ))}
        </div>
      </div>
    </div>
  );
}
