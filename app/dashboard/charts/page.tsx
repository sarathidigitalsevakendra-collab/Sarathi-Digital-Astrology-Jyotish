"use client";

import { useSavedCharts, SavedChart } from "@/hooks/user/useSavedCharts";
import { getSunSignFromDate } from "@/services/astrology/birthChartService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SavedChartsPage() {
  const { charts, loading, error, deleteChart } = useSavedCharts();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredCharts = charts.filter(chart => 
    chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.birthPlace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadChart = (chart: SavedChart) => {
    // Navigate to generator with pre-filled data via query params
    const params = new URLSearchParams({
        dt: chart.birthDate,
        time: chart.birthTime,
        lat: chart.latitude.toString(),
        lon: chart.longitude.toString(),
        tz: chart.timezone,
        loc: chart.birthPlace,
        name: chart.name
    });
    router.push(`/dashboard/birth-chart?${params.toString()}`);
  };

  const getSunSign = (dateStr: string) => {
    try {
        return getSunSignFromDate(new Date(dateStr));
    } catch {
        return "Unknown";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white">Saved Charts</h1>
            <p className="text-slate-400">Manage your collection of birth charts</p>
        </div>
        
        <div className="flex gap-3">
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search charts..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                />
             </div>
             <Link 
                href="/dashboard/birth-chart" 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
             >
                <span>+ New</span>
             </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {[1, 2, 3].map(i => (
               <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse border border-white/5"></div>
           ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
             <p className="text-red-400">{error}</p>
        </div>
      ) : filteredCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-white/5 rounded-2xl border-dashed">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Saved Charts</h3>
            <p className="text-slate-400 mb-6 max-w-sm text-center">
                You haven't saved any charts yet. Generate a new chart and click "Save" to build your collection.
            </p>
            <Link 
                href="/dashboard/birth-chart" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
            >
                Generate Chart
            </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCharts.map(chart => (
                <div key={chart.id} className="group relative bg-slate-900 border border-white/10 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-2xl border border-indigo-500/20">
                            {/* Simple mapping for visual variety based on first letter or sign */}
                            {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][Math.floor(Math.random() * 12)]}
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(confirm("Are you sure you want to delete this chart?")) {
                                    deleteChart(chart.id);
                                }
                            }}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                        >
                            🗑️
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{chart.name}</h3>
                    <p className="text-sm text-indigo-300 font-medium mb-3">
                         {getSunSign(chart.birthDate)} Sun
                    </p>
                    
                    <div className="space-y-1.5 mb-5">
                         <div className="flex items-center gap-2 text-xs text-slate-400">
                             <span>📅</span>
                             <span>{new Date(chart.birthDate).toLocaleDateString()} at {chart.birthTime}</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                             <span>📍</span>
                             <span className="truncate">{chart.birthPlace}</span>
                         </div>
                    </div>
                    
                    <button 
                         onClick={() => handleLoadChart(chart)}
                         className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white py-2.5 rounded-lg text-sm font-semibold transition-all border border-white/5 hover:border-transparent group-hover:bg-indigo-600 group-hover:text-white"
                    >
                        Load Chart
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
