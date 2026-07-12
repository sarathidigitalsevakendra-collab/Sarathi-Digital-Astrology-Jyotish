"use client";

import Image from "next/image";
import { getPanchangToday } from "@lib/api/panchang";
import { useQuery } from "@tanstack/react-query";

export default function PanchangHighlights(): React.ReactElement {
  const { data, isLoading } = useQuery({
    queryKey: ["panchang", "today", "en"],
    queryFn: () => getPanchangToday({ locale: "en" }),
  });

  return (
    <section className="px-6 lg:px-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="gradient-title">दैनिक पंचांग • Daily Panchang</h2>
          <p className="mt-3 max-w-xl text-base text-slate-300">
            Accurate sunrise timings, tithi and nakshatra fetched from Drik Panchang to plan your
            <span className="text-orange-200 mx-1" title="Puja (Worship)">पूजा</span>, 
            <span className="text-orange-200 mx-1" title="Yatra (Travel)">यात्रा</span> and 
            <span className="text-orange-200 mx-1" title="Life Decisions">जीवन निर्णय</span>.
          </p>
        </div>
        <div className="relative h-28 w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 hidden md:block lg:order-last">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
            alt="Panchang calendar"
            fill
            className="object-cover opacity-70"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Tithi Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] cursor-pointer">
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Tithi</h3>
            <p className="text-base md:text-lg font-medium text-orange-200 mb-2">{data?.tithi ?? "--"}</p>
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              {isLoading ? "Loading Panchang details…" : "Auspicious timings aligned with Lunar Month (चंद्र मास)."}
            </p>
        </div>

        {/* Nakshatra Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] cursor-pointer">
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Nakshatra</h3>
            <p className="text-base md:text-lg font-medium text-blue-200 mb-2">{data?.nakshatra ?? "--"}</p>
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              {isLoading ? "" : "Ideal for Vastu, Travel (यात्रा), and Rituals (संस्कार)."}
            </p>
        </div>

        {/* Festival Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 active:scale-[0.98] cursor-pointer">
            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Next Festival</h3>
            <p className="text-base md:text-lg font-medium text-pink-200 mb-2">Ekadashi • Jan 24</p>
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              {isLoading ? "" : "Prepare for Shattila Ekadashi fast & Vishnu puja."}
            </p>
        </div>
      </div>
      
      {/* Mobile-only Image (below cards) */}
      <div className="mt-8 md:hidden relative h-32 w-full overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
            alt="Panchang calendar"
            fill
            className="object-cover opacity-70"
          />
      </div>

      <div className="mt-8 text-center">
         <button className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/40 transition-all">
            View Full Panchang Calendar
         </button>
      </div>
    </section>
  );
}
