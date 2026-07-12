"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, User, Calendar, Percent, Moon, ArrowUpCircle } from "lucide-react";
import { useSavedCharts } from "@/hooks/user/useSavedCharts";
import { getSunSignFromDate, getSignName } from "@/services/astrology/birthChartService";
import { BirthChartResponse } from "@/types/astrology/birthChart.types";
import { WelcomeSkeleton } from "@/components/ui/skeleton";

interface SmartWelcomeProps {
    displayName: string;
}

export default function SmartWelcome({ displayName }: SmartWelcomeProps) {
    const { charts, loading } = useSavedCharts();
    const [stats, setStats] = useState({
        sunSign: "Sagittarius ♐",
        moonSign: "Taurus ♉",
        ascendant: "Gemini ♊",
        chartsCount: 0,
        completion: 40, // Base completion for signing up
        nextConsultation: "None scheduled"
    });

    useEffect(() => {
        if (!loading && charts.length > 0) {
            // Assume the first chart created is the user's "primary" chart for now
            const primary = charts[0];
            if (!primary) return;

            const data = primary.chartData as unknown as BirthChartResponse;

            let sunSignName = "Unknown";
            let moonSignName = "Unknown";
            let ascendantName = "Unknown";

            // Extract from Chart Data if available
            if (data?.data?.planets) {
                const planets = data.data.planets;
                const sun = planets.find(p => p.name === "Sun");
                const moon = planets.find(p => p.name === "Moon");
                
                sunSignName = sun?.sign || getSunSignFromDate(new Date(primary.birthDate));
                moonSignName = moon?.sign || "Unknown";

                const ascDegree = data.data.ascendant;
                if (typeof ascDegree === 'number') {
                     const signNum = Math.floor(ascDegree / 30) + 1;
                     ascendantName = getSignName(signNum);
                }
            } else {
                // Fallback if no chart data processed yet
                sunSignName = getSunSignFromDate(new Date(primary.birthDate));
            }

            setStats(prev => ({
                ...prev,
                sunSign: `${sunSignName}`,
                moonSign: `${moonSignName}`,
                ascendant: `${ascendantName}`,
                chartsCount: charts.length,
                completion: data?.data ? 80 : 60, // Higher completion if chart data exists
            }));
        }
    }, [charts, loading]);

    // Show skeleton while loading
    if (loading) {
        return <WelcomeSkeleton />;
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f3c] to-[#0f1225] p-4 sm:p-6 shadow-xl border border-white/5">

            {/* Background Decorations */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

            <div className="relative z-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {displayName}!
                        </h1>
                        <p className="text-slate-400 max-w-lg mb-6 leading-relaxed">
                             Your cosmic journey is unfolding perfectly. Here is your daily astrological snapshot.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
                             {/* Sun Sign - Full width on mobile */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-3 sm:min-w-0">
                                 <div className="h-10 w-10 shrink-0 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                     <Sparkles className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <p className="text-xs text-slate-400">Sun Sign</p>
                                     <p className="text-sm font-semibold text-white truncate">{stats.sunSign}</p>
                                 </div>
                             </div>

                             {/* Moon Sign */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-3 sm:min-w-0">
                                 <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                     <Moon className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <p className="text-xs text-slate-400">Moon Sign</p>
                                     <p className="text-sm font-semibold text-white truncate">{stats.moonSign}</p>
                                 </div>
                             </div>

                             {/* Ascendant */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-3 sm:min-w-0">
                                 <div className="h-10 w-10 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                     <ArrowUpCircle className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <p className="text-xs text-slate-400">Ascendant</p>
                                     <p className="text-sm font-semibold text-white truncate">{stats.ascendant}</p>
                                 </div>
                             </div>

                             {/* Profile Completion - Spans 2 cols on sm+ */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-3 sm:col-span-2 lg:col-span-1 sm:min-w-0">
                                 <div className="h-10 w-10 shrink-0 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                     <Percent className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-slate-400">Profile</p>
                                        <span className="text-xs text-green-400 font-medium">{stats.completion}%</span>
                                     </div>
                                     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${stats.completion}%` }}
                                         />
                                     </div>
                                 </div>
                             </div>

                             {/* Next Consultation - Spans full width on mobile */}
                             <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-4 py-3 sm:col-span-2 lg:col-span-1">
                                 <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                     <Calendar className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <p className="text-xs text-slate-400">Next Session</p>
                                     <div className="flex items-center gap-2 flex-wrap">
                                         <p className="text-sm font-semibold text-white">{stats.nextConsultation}</p>
                                         <Link href="/consultations" className="text-xs text-orange-400 hover:text-orange-300 font-medium uppercase tracking-wide whitespace-nowrap">
                                            Book Now →
                                         </Link>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-6 md:mt-0 flex flex-col gap-3">
                        {stats.completion < 100 && (
                            <Link 
                               href="/dashboard/birth-chart"
                               className="group flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
                            >
                                <div>
                                    <p className="text-sm font-bold">Complete Your Profile</p>
                                    <p className="text-xs text-purple-200/80">Unlock deeper predictions</p>
                                </div>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        
                        <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-slate-400 mb-1">Saved Charts</p>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-300" />
                                <span className="text-lg font-bold text-white">{stats.chartsCount}</span>
                                <span className="text-xs text-slate-500">profiles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
