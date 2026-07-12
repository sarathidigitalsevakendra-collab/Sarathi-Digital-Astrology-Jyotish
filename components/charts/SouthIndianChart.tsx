import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Planet {
  name: string;
  house?: number;
  sign: string;
  degree: number;
  isRetro?: boolean;
}

interface SouthIndianChartProps {
  planets: Planet[];
  ascendantSign: number; // 1-12 (1 = Aries)
  className?: string;
  onPlanetClick?: (planet: Planet) => void;
  onSignClick?: (signId: number) => void;
}

// Sign ID map to Grid coordinates (Row, Col)
// Grid is 4x4.
// 0,0 is Top Left.
const SIGN_GRID_POS = {
  1: { x: 25, y: 0, label: "Ar" },   // Aries
  2: { x: 50, y: 0, label: "Ta" },   // Taurus
  3: { x: 75, y: 0, label: "Ge" },   // Gemini
  4: { x: 75, y: 25, label: "Cn" },  // Cancer
  5: { x: 75, y: 50, label: "Le" },  // Leo
  6: { x: 75, y: 75, label: "Vi" },  // Virgo
  7: { x: 50, y: 75, label: "Li" },  // Libra
  8: { x: 25, y: 75, label: "Sc" },  // Scorpio
  9: { x: 0, y: 75, label: "Sa" },   // Sagittarius
  10: { x: 0, y: 50, label: "Cp" },  // Capricorn
  11: { x: 0, y: 25, label: "Aq" },  // Aquarius
  12: { x: 0, y: 0, label: "Pi" },   // Pisces
};

export default function SouthIndianChart({
  planets,
  ascendantSign,
  className = "w-full h-full",
  onPlanetClick,
  onSignClick,
}: SouthIndianChartProps) {

  const PLANET_COLORS: Record<string, string> = {
    Sun: "#fbbf24",
    Moon: "#e2e8f0",
    Mars: "#f87171",
    Mercury: "#4ade80",
    Jupiter: "#facc15",
    Venus: "#f472b6",
    Saturn: "#60a5fa",
    Rahu: "#94a3b8",
    Ketu: "#94a3b8",
  };

  const SIGN_NAMES = ["", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  // Helper to get sign index from name
  const getSignIndex = (name: string) => {
    return SIGN_NAMES.findIndex(s => s.toLowerCase() === name.toLowerCase()) || 0;
  };

  // Group planets by sign
  const planetsBySign = useMemo(() => {
    const map: Record<number, Planet[]> = {};
    planets.forEach(p => {
      const idx = getSignIndex(p.sign);
      if (idx > 0) {
        if (!map[idx]) map[idx] = [];
        map[idx].push(p);
      }
    });
    return map;
  }, [planets]);

  const getPlanetShortName = (name: string) => name.substring(0, 2);

  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Background */}
      <rect x="0" y="0" width="100" height="100" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      
      {/* Center Void (optional fill) */}
      <rect x="25" y="25" width="50" height="50" fill="rgba(0,0,0,0.2)" />

      {/* Grid Lines */}
      {/* Vertical */}
      <line x1="25" y1="0" x2="25" y2="100" stroke="#334155" strokeWidth="0.5" />
      <line x1="50" y1="0" x2="50" y2="100" stroke="#334155" strokeWidth="0.5" />
      <line x1="75" y1="0" x2="75" y2="100" stroke="#334155" strokeWidth="0.5" />
      {/* Horizontal */}
      <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.5" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" />
      <line x1="0" y1="75" x2="100" y2="75" stroke="#334155" strokeWidth="0.5" />

      {/* Render Signs */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((signId) => {
        const pos = SIGN_GRID_POS[signId as keyof typeof SIGN_GRID_POS];
        const isAscendant = signId === ascendantSign;
        const signPlanets = planetsBySign[signId] || [];

        return (
          <g key={signId} onClick={() => onSignClick?.(signId)} className="cursor-pointer hover:opacity-80">
            {/* Box Highlight for Ascendant */}
            {isAscendant && (
               <g>
                 <line x1={pos.x} y1={pos.y + 25} x2={pos.x + 10} y2={pos.y} stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
                 <line x1={pos.x} y1={pos.y + 25} x2={pos.x + 25} y2={pos.y} stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
                 <text x={pos.x + 2} y={pos.y + 8} fontSize="3" fill="#fbbf24" fontWeight="bold">Asc</text>
               </g>
            )}

            {/* Hover overlay */}
            <rect x={pos.x} y={pos.y} width="25" height="25" fill="transparent" className="hover:fill-white/5" />

            {/* Sign Label (faint) */}
            {!isAscendant && (
               <text x={pos.x + 2} y={pos.y + 8} fontSize="3" fill="rgba(255,255,255,0.2)">
                 {pos.label}
               </text>
            )}

            {/* Planets */}
            {signPlanets.map((planet, idx) => {
               // Layout logic: 2 columns, max 3 rows? per box 25x25
               // 25x25 box. Center is 12.5, 12.5.
               // Simple stack: 
               const col = idx % 2;
               const row = Math.floor(idx / 2);
               const px = pos.x + 6 + (col * 12);
               const py = pos.y + 12 + (row * 6);

               return (
                 <motion.text
                   key={planet.name}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.05 }}
                   x={px}
                   y={py}
                   fontSize="3.5"
                   fill={PLANET_COLORS[planet.name] || "white"}
                   textAnchor="middle"
                   fontWeight="bold"
                   dominantBaseline="middle"
                   onClick={(e) => {
                      e.stopPropagation();
                      onPlanetClick?.(planet);
                   }}
                 >
                   {getPlanetShortName(planet.name)}
                 </motion.text>
               );
            })}
          </g>
        );
      })}
    </svg>
  );
}
