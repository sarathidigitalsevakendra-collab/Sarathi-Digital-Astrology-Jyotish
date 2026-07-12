/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import type { Planet } from "@/types/astrology/birthChart.types";

interface PlanetaryPositionsProps {
  planets: Planet[];
  showHelp: boolean;
}
function MobilePlanetCard({ planet, getDignityColor, getNatureColor }: { 
  planet: Planet, 
  getDignityColor: (d: string | undefined) => string, 
  getNatureColor: (n: string | undefined) => string 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden transition-all">
       {/* Main Row: Always Visible */}
       <div 
         className="p-4 flex items-center justify-between cursor-pointer"
         onClick={() => setIsExpanded(!isExpanded)}
       >
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <span className="font-semibold text-white flex items-center gap-2">
                   {planet.name}
                   {planet.isRetro && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded" title="Retrograde">R</span>}
                </span>
                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                   <span>{planet.sign}</span>
                   <span className="text-slate-600">•</span>
                   <span>H-{planet.house}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className={`text-[10px] px-2 py-1 rounded border ${getDignityColor(planet.dignity)}`}>
                 {planet.dignity || "Neutral"}
             </span>
             <button className="text-slate-500 hover:text-white transition-colors">
                {isExpanded ? "▲" : "▼"}
             </button>
          </div>
       </div>

       {/* Expanded Details */}
       {isExpanded && (
          <div className="px-4 pb-4 pt-0 text-xs border-t border-white/5 mt-0 bg-black/20">
             <div className="grid grid-cols-2 gap-y-3 pt-3">
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Nakshatra</span>
                    <span className="text-slate-200">{planet.nakshatra || "-"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Degree</span>
                    <span className="font-mono text-slate-200">{Math.floor(planet.normDegree)}° {Math.floor((planet.normDegree % 1) * 60)}'</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Nature</span>
                    <span className={`font-medium ${getNatureColor(planet.nature)}`}>{planet.nature || "-"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Full Bhava</span>
                    <span className="text-slate-200">{planet.house}th House</span>
                 </div>
             </div>
          </div>
       )}
    </div>
  );
}

export default function PlanetaryPositions({
  planets,
  showHelp,
}: PlanetaryPositionsProps) {
  
  const getDignityColor = (dignity?: string) => {
    switch (dignity?.toLowerCase()) {
      case "exalted": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "moolatrikona": return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "own sign":
      case "own": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "friend":
      case "great friend": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "neutral": return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      case "enemy":
      case "great enemy": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "debilitated": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getNatureColor = (nature?: string) => {
    switch (nature?.toLowerCase()) {
      case "benefic": return "text-emerald-400";
      case "malefic": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🌍</span> Planetary Positions
        </h3>
        {showHelp && (
           <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
             Dignity shows strength • Nature is functional
           </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="pb-4 font-medium pl-4">Planet</th>
              <th className="pb-4 font-medium">Coordinate</th>
              <th className="pb-4 font-medium">Sign (Rashi)</th>
              <th className="pb-4 font-medium">House</th>
              <th className="pb-4 font-medium">Nakshatra</th>
              <th className="pb-4 font-medium">Dignity</th>
              <th className="pb-4 font-medium pr-4">Nature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {planets.map((planet) => (
              <tr key={planet.name} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 pl-4 font-medium text-white flex items-center gap-2">
                   {planet.name} {planet.isRetro && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300" title="Retrograde">R</span>}
                </td>
                <td className="py-4 text-slate-300 font-mono text-xs">
                  {Math.floor(planet.normDegree)}° {Math.floor((planet.normDegree % 1) * 60)}'
                </td>
                <td className="py-4 text-slate-300">
                  {planet.sign}
                </td>
                <td className="py-4 text-slate-300">
                  {planet.house}
                </td>
                <td className="py-4 text-slate-300">
                  {planet.nakshatra || <span className="text-slate-600">-</span>}
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getDignityColor(planet.dignity)}`}>
                    {planet.dignity || "Neutral"}
                  </span>
                </td>
                <td className="py-4 pr-4">
                   <span className={`text-xs font-medium ${getNatureColor(planet.nature)}`}>
                     {planet.nature || "-"}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {planets.map((planet) => (
          <MobilePlanetCard 
             key={planet.name} 
             planet={planet} 
             getDignityColor={getDignityColor}
             getNatureColor={getNatureColor}
          />
        ))}
      </div>
    </div>
  );
}
