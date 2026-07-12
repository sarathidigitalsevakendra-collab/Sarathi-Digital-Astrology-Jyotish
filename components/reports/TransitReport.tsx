"use client";

import PdfContainer from "./PdfContainer";
import PdfPage from "./PdfPage";

interface TransitAspect {
  transitPlanet: string;
  transitLongitude: number;
  natalPlanet: string;
  natalLongitude: number;
  aspect: string;
  nature: "intense" | "challenging" | "harmonious";
  exactness: number;
  effect: string;
  significance: "critical" | "major" | "notable" | "minor";
}

export interface TransitsData {
  transitTime: string;
  summary: {
    totalAspects: number;
    overallTone: "challenging" | "favorable" | "mixed";
    interpretation: string;
  };
  activeTransits: TransitAspect[];
}

interface TransitReportProps {
  data: TransitsData;
  user: {
     name: string;
     dateTime: string;
     location: string;
  };
}

import { ReportHeader } from "./ReportHeader";
import { ReportFooter } from "./ReportFooter";
import { formatSignDegree } from "@/lib/astrology/formatting";

// ... existing code ...

export default function TransitReport({ data, user }: TransitReportProps) {
  const { summary, activeTransits } = data;

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "favorable": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "challenging": return "text-orange-700 bg-orange-50 border-orange-200";
      default: return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  const getNatureBadgeColor = (nature: string) => {
    switch (nature) {
      case "harmonious": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "challenging": return "bg-red-100 text-red-800 border-red-200";
      case "intense": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <PdfContainer id="transit-report-root">
      {/* Page 1: Summary */}
      <PdfPage pageNumber={1} title="Transit Predictions">
         <div className="flex flex-col h-full">
            {/* Header Info */}
            <ReportHeader title="Gochar Report" subtitle={`Transit Analysis for ${user.name}`} icon="🪐" />

            {/* User Details */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 mt-4">
               <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4 border-b border-slate-200 pb-2">
                  Prepared For
               </h3>
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="text-slate-500 block text-xs">Name</span>
                     <span className="font-medium text-slate-900 text-lg">{user.name}</span>
                  </div>
                  <div>
                     <span className="text-slate-500 block text-xs">Date of Birth</span>
                     <span className="font-medium text-slate-900">
                        {new Date(user.dateTime).toLocaleDateString()}
                     </span>
                  </div>
                  <div>
                     <span className="text-slate-500 block text-xs">Location</span>
                     <span className="font-medium text-slate-900">{user.location}</span>
                  </div>
                   <div>
                     <span className="text-slate-500 block text-xs">Report Date</span>
                     <span className="font-medium text-slate-900">
                        {new Date().toLocaleDateString()}
                     </span>
                  </div>
               </div>
            </div>

            {/* Cosmic Weather Summary */}
            <div className={`rounded-xl border p-6 mb-8 ${getToneColor(summary.overallTone)}`}>
               <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span>Cosmic Weather</span>
                  <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-white/50 border border-black/5 uppercase tracking-wider text-xs">
                     {summary.overallTone}
                  </span>
               </h2>
               <p className="text-base leading-relaxed opacity-90 mb-6">
                  {summary.interpretation}
               </p>
               
               {/* Quantitative Breakdown */}
               <div className="bg-white/40 rounded-lg p-4 border border-black/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">Planetary Influence Breakdown</h4>
                  <div className="flex items-center gap-4 text-sm font-medium">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{activeTransits.filter(t => t.nature === 'harmonious').length} Harmonious</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>{activeTransits.filter(t => t.nature === 'challenging').length} Challenging</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>{activeTransits.filter(t => t.nature === 'intense').length} Intense</span>
                     </div>
                  </div>
               </div>


               <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-4 text-sm font-medium opacity-80">
                  <span>Total Active Transits: {summary.totalAspects}</span>
               </div>
            </div>
            
            {/* Strategic Guidance & Interpretation */}
            {(() => {
               // Analysis Logic
               const harmoniousCount = activeTransits.filter(t => t.nature === 'harmonious').length;
               const challengingCount = activeTransits.filter(t => t.nature === 'challenging').length;
               // const intenseCount = activeTransits.filter(t => t.nature === 'intense').length; // Unused for now
               
               const netScore = harmoniousCount - challengingCount; // Simple metric
               
               // Dominant Planet Logic
               const planetCounts: Record<string, number> = {};
               activeTransits.forEach(t => {
                  planetCounts[t.transitPlanet] = (planetCounts[t.transitPlanet] || 0) + 1;
               });
               const dominantPlanet = Object.entries(planetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

               // Dynamic Takeaways
               const getTakeaways = () => {
                  const tips = [];
                  if (netScore > 0) tips.push("Capitalize on opportunities now; luck is on your side.");
                  else if (netScore < 0) tips.push("Exercise caution and patience; avoid unnecessary risks.");
                  else tips.push("Balance is key; navigate ups and downs with steadiness.");

                  if (dominantPlanet === "Saturn") tips.push("Focus on discipline, hard work, and long-term goals.");
                  else if (dominantPlanet === "Jupiter") tips.push("Look for growth, learning, and spiritual expansion.");
                  else if (dominantPlanet === "Mars") tips.push("Channel your energy constructively; avoid conflict.");
                  else if (dominantPlanet === "Venus") tips.push("Nurture relationships and creative pursuits.");
                  else if (dominantPlanet === "Mercury") tips.push("Communication and analysis are favored.");
                  else if (dominantPlanet === "Rahu" || dominantPlanet === "Ketu") tips.push("Be mindful of sudden changes or unconventional paths.");
                  else tips.push("Stay adaptable to changing cosmic energies.");

                  return tips;
               };

               const takeaways = getTakeaways();

               return (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🧭</span> Strategic Guidance
                     </h3>
                     
                     <div className="grid md:grid-cols-2 gap-6">
                        {/* Themes */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                           <h4 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">Dominant Themes</h4>
                           <div className="space-y-2">
                              {dominantPlanet && (
                                 <div className="flex items-center gap-2 text-sm text-slate-800">
                                    <span className="font-bold text-indigo-600">{dominantPlanet}</span>
                                    <span>is heavily influencing your chart right now.</span>
                                 </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-slate-800">
                                 <span className="font-bold">Net Balance:</span>
                                 <span className={netScore > 0 ? "text-emerald-600 font-medium" : netScore < 0 ? "text-orange-600 font-medium" : "text-slate-600"}>
                                    {netScore > 0 ? "Mostly Positive" : netScore < 0 ? "Challenging" : "Balanced"}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Takeaways */}
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                           <h4 className="font-semibold text-blue-800 mb-2 text-sm uppercase tracking-wide">Actionable Advice</h4>
                           <ul className="space-y-2">
                              {takeaways.map((tip, i) => (
                                 <li key={i} className="flex gap-2 text-sm text-slate-700">
                                    <span className="text-blue-500 font-bold">•</span>
                                    {tip}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
               );
            })()}

            <ReportFooter />
         </div>
      </PdfPage>

      {/* Pages 2+: Detailed Aspects (Paginated) */}
      {(() => {
         const ITEMS_PER_PAGE = 4;
         const chunks = [];
         
         for (let i = 0; i < activeTransits.length; i += ITEMS_PER_PAGE) {
            chunks.push(activeTransits.slice(i, i + ITEMS_PER_PAGE));
         }

         return chunks.map((chunk, pageIdx) => (
            <PdfPage key={pageIdx} pageNumber={2 + pageIdx} title={pageIdx === 0 ? "Active Transits" : "Active Transits (Cont.)"}>
               <div className="space-y-6">
                  {pageIdx === 0 && (
                     <h3 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-500 pl-4 mb-2">
                        Detailed Analysis
                     </h3>
                  )}

                  <div className="space-y-4">
                     {chunk.map((transit, idx) => (
                        <div key={`${pageIdx}-${idx}`} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm break-inside-avoid">
                           {/* Aspect Header Line */}
                           <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-3">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                       {transit.transitPlanet}
                                    </span>
                                    <span className="text-xs text-slate-400">at</span>
                                    <span className="text-xs text-slate-500 font-mono">
                                       {formatSignDegree(transit.transitLongitude)}
                                    </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider border ${getNatureBadgeColor(transit.nature)}`}>
                                       {transit.aspect}
                                    </span>
                                    <span className="text-xs text-slate-400 mx-1">to</span>
                                    <span className="text-sm font-medium text-slate-900">
                                       Natal {transit.natalPlanet}
                                    </span>
                                     <span className="text-xs text-slate-500 font-mono">
                                       ({formatSignDegree(transit.natalLongitude)})
                                    </span>
                                 </div>
                              </div>

                              {transit.significance === "critical" && (
                                 <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 uppercase tracking-widest">
                                    Critical Effect
                                 </span>
                              )}
                           </div>
                           
                           {/* Interpretation */}
                           <div className="mb-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Effect</h4>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                 {transit.effect}
                              </p>
                           </div>

                           {/* Technical Details Footer */}
                           <div className="flex items-center gap-4 text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                              <div className="flex items-center gap-1">
                                 <span className="font-semibold">Nature:</span> 
                                 <span className="capitalize">{transit.nature}</span>
                              </div>
                              <div className="h-3 w-px bg-slate-300"></div>
                              <div className="flex items-center gap-1">
                                 <span className="font-semibold">Orb/Intensity:</span> 
                                 <span>{transit.exactness.toFixed(2)}</span>
                              </div>
                              <div className="h-3 w-px bg-slate-300"></div>
                              <div className="flex items-center gap-1">
                                 <span className="font-semibold">Significance:</span> 
                                 <span className="capitalize">{transit.significance}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </PdfPage>
         ));
      })()}
    </PdfContainer>
  );
}
