"use client";

import { useQuery } from "@tanstack/react-query";
import { getPanchangToday } from "@lib/api/panchang";
import { format } from "date-fns";

export default function PanchangDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["panchang", "today", "en"],
    queryFn: () => getPanchangToday({ locale: "en" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
          <span>Loading Panchang...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-300">Failed to load Panchang data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Header */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-orange-300">Today's Panchang</p>
        <p className="mt-2 text-2xl font-bold text-white">
          {data?.date 
            ? format(new Date(data.date), "d MMMM yyyy (EEEE)")
            : format(new Date(), "d MMMM yyyy (EEEE)")}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tithi */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <h3 className="text-lg font-semibold text-white">Tithi</h3>
          </div>
          <p className="text-xl font-medium text-orange-200">{data?.tithi || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">Lunar Day</p>
        </div>

        {/* Nakshatra */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-semibold text-white">Nakshatra</h3>
          </div>
          <p className="text-xl font-medium text-blue-200">{data?.nakshatra || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">Star Constellation</p>
        </div>

        {/* Yoga */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🧘</span>
            <h3 className="text-lg font-semibold text-white">Yoga</h3>
          </div>
          <p className="text-xl font-medium text-purple-200">{data?.yoga || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">Auspicious Combination</p>
        </div>

        {/* Karana */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🔆</span>
            <h3 className="text-lg font-semibold text-white">Karana</h3>
          </div>
          <p className="text-xl font-medium text-teal-200">{data?.karana || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">Half Tithi</p>
        </div>

        {/* Sunrise */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <h3 className="text-lg font-semibold text-white">Sunrise</h3>
          </div>
          <p className="text-xl font-medium text-amber-200">{data?.sunrise || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">Start of Vedic Day</p>
        </div>

        {/* Sunset */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🌇</span>
            <h3 className="text-lg font-semibold text-white">Sunset</h3>
          </div>
          <p className="text-xl font-medium text-rose-200">{data?.sunset || "--"}</p>
          <p className="mt-2 text-sm text-slate-400">End of Day</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-indigo-300">
          <span>📚</span> What is Panchang?
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Panchang is the Vedic Hindu calendar that tracks five key elements: <strong>Tithi</strong> (lunar day), 
          <strong> Nakshatra</strong> (star constellation), <strong>Yoga</strong> (luni-solar combination), 
          <strong> Karana</strong> (half-tithi), and <strong>Vara</strong> (weekday). These elements help determine 
          auspicious timings for religious ceremonies, travel, and important life decisions.
        </p>
      </div>
    </div>
  );
}
