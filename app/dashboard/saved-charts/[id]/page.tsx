import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { getSunSignFromDate } from "@/services/astrology/birthChartService";
import { DailyHoroscopePanel } from "@/components/astrology/DailyHoroscopePanel";
import { detectYogas, buildPlanetDataFromChart } from "@/lib/astrology/calculations/YogaDetector";
import { getSignName } from "@/lib/astrology/calculations/VedicMath";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Details | Digital Astrology",
  description: "View your saved birth chart details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedChartDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/saved-charts");
  }

  // Load kundli from database
  const kundli = await prisma.kundli.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      birthDate: true,
      birthTime: true,
      birthPlace: true,
      latitude: true,
      longitude: true,
      timezone: true,
      chartData: true,
      isFavorite: true,
      createdAt: true,
    },
  });

  if (!kundli) {
    redirect("/dashboard/saved-charts");
  }

  // Verify ownership
  if (kundli.userId !== user.id) {
    redirect("/dashboard/saved-charts");
  }

  // --- Processing Chart Data ---
  const chartData: any = kundli.chartData;
  const output = chartData?.output; // Usually structure is { data: ..., output: [...] } or direct
  // Need to extract planets. Assuming standard structure from engine.
  // If structure varies, we need to adapt.
  // Common structure found in other files: output[0] is Rashi chart.
  
  let planetsForYogas: any[] = [];
  let ascendantDegree = 0;

  if (Array.isArray(output) && output.length > 0) {
      // Extract from output[0] (D1 Chart usually)
      const d1 = output[0];
      // Object.values to get planet objects
      Object.values(d1).forEach((val: any) => {
          if (val && typeof val === 'object') {
             if (val.current_sign) { // It's a planet
                 planetsForYogas.push({
                     name: val.name,
                     fullDegree: val.fullDegree,
                     speed: val.speed
                 });
             }
             if (val.name === "Ascendant" || (val.id === 0 && !val.name)) {
                 ascendantDegree = val.fullDegree || 0;
             }
             // Sometimes Ascendant is a specific key or ID 0
             if (typeof val.ascendant !== 'undefined') {
                 ascendantDegree = val.ascendant;
             }
          }
      });
  } else if (chartData?.data) {
      // Alternative structure
       const d = chartData.data;
       ascendantDegree = d.ascendant || 0;
       if (d.planets) {
           planetsForYogas = Object.values(d.planets).map((p: any) => ({
               name: p.name,
               fullDegree: p.fullDegree,
               speed: p.speed
           }));
       }
  }

  // Calculate Yogas
  const planetMap = buildPlanetDataFromChart(planetsForYogas, ascendantDegree);
  const ascendantRashi = Math.floor(ascendantDegree / 30) + 1;
  const yogaResult = detectYogas(planetMap, ascendantRashi);

  // Key Placements
  const getPlanetSign = (name: string) => {
      const p = planetMap.get(name);
      return p ? getSignName(p.rashi) : "Unknown";
  };

  const sunSign = getSunSignFromDate(new Date(kundli.birthDate)); // Or calculate from degree
  const moonSign = getPlanetSign("Moon");
  const risingSign = getSignName(ascendantRashi);

  // Remedies Placeholder Logic (Simple rule-based for now)
  const remedies = [];
  if (yogaResult.summary.by_strength["weak"] > 0) {
      remedies.push("Chanting Beej Mantras for weak planets.");
  }
  // If Saturn is in 1st, 2nd, 12th from Moon -> Sade Sati (Approx check)
  const moonData = planetMap.get("Moon");
  const saturnData = planetMap.get("Saturn");
  if (moonData && saturnData) {
      const diff = (saturnData.rashi - moonData.rashi + 12) % 12;
      if ([0, 1, 11].includes(diff)) {
          remedies.push("Shani Sade Sati is active. Offer water to Peepal tree on Saturdays.");
      }
  }
  if (remedies.length === 0) remedies.push("General meditation and charity.");

  // Construct HoroscopeData
  const horoscopeData = {
    date: new Date().toISOString().split("T")[0]!, 
    sunSign, 
    text: undefined, 
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{kundli.name}</h1>
            <p className="mt-2 text-slate-400">
                {new Date(kundli.birthDate).toLocaleDateString("en-US", {
                    day: "numeric", month: "long", year: "numeric"
                })} • {kundli.birthTime} • {kundli.birthPlace}
            </p>
          </div>
           {/* Visual badge for favorite/type could go here */}
        </div>

        {/* 1. Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-6">
                <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider mb-2">Ascendant (Lagna)</h3>
                <div className="text-2xl font-bold text-white">{risingSign}</div>
                <div className="text-sm text-slate-400 mt-1">Foundational Self</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
                <h3 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Moon Sign (Rashi)</h3>
                <div className="text-2xl font-bold text-white">{moonSign}</div>
                <div className="text-sm text-slate-400 mt-1">Emotional Mind</div>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-6">
                <h3 className="text-sm font-medium text-orange-300 uppercase tracking-wider mb-2">Sun Sign</h3>
                <div className="text-2xl font-bold text-white">{sunSign}</div>
                <div className="text-sm text-slate-400 mt-1">Soul Purpose</div>
            </div>
        </div>

        {/* 2. Key Yogas Section */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-yellow-400">✨</span> Key Planetary Yogas
            </h2>
            
            {yogaResult.yogas.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {yogaResult.yogas.slice(0, 6).map((yoga, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 transition">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-pink-200">{yoga.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    yoga.strength === 'very strong' ? 'bg-green-500/20 text-green-300' :
                                    yoga.strength === 'strong' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-slate-500/20 text-slate-300'
                                }`}>
                                    {yoga.strength}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{yoga.description}</p>
                            <p className="text-xs text-slate-500 italic">{yoga.effect}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 italic">No major special yogas detected in this subset.</p>
            )}
             {yogaResult.yogas.length > 6 && (
                 <p className="text-center text-sm text-slate-500 mt-4">And {yogaResult.yogas.length - 6} more...</p>
             )}
        </div>

        {/* 3. Remedies & Daily Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                 {/* Remedies */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 h-full">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-green-400">🌿</span> Recommended Remedies
                    </h2>
                    <ul className="space-y-3">
                        {remedies.map((remedy, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                                <span className="text-green-500 mt-1">•</span>
                                {remedy}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* AI Insights Placeholder */}
                <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="text-indigo-400">🤖</span> AI Astrologer Insight
                    </h2>
                     <p className="text-slate-300 text-sm mb-4">
                        Unlock deep, personalized insights about this chart using our advanced AI Astrologer.
                    </p>
                    <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition text-sm">
                        Generate Full Reading
                    </button>
                </div>
            </div>

            {/* Daily Horoscope */}
            <div>
                 <DailyHoroscopePanel kundliId={kundli.id} data={horoscopeData} />
            </div>
        </div>
      </div>
    </div>
  );
}
