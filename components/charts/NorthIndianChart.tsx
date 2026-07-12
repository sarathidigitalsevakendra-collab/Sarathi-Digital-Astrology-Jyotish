import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Planet {
  name: string;
  house: number; // 1-12
  sign: string;
  degree: number;
  isRetro?: boolean;
}

interface NorthIndianChartProps {
  planets: Planet[];
  ascendantSign: number; // 1-12 (1 = Aries)
  className?: string;
  onPlanetClick?: (planet: Planet) => void;
  onHouseClick?: (houseNumber: number) => void;
}

// Map of house numbers to SVG polygon points (0-100 coordinate system)
// North Indian Chart Layout (Diamond)
// House 1: Top Center Diamond
// House 2: Upper Left Triangle
// House 3: Lower Left Triangle
// House 4: Middle Left Diamond
// House 5: Lower Left Triangle (Bottom)
// House 6: Bottom Left Triangle
// House 7: Bottom Center Diamond
// House 8: Bottom Right Triangle
// House 9: Lower Right Triangle (Bottom)
// House 10: Middle Right Diamond
// House 11: Upper Right Triangle (Top)
// House 12: Upper Right Triangle


// Let's refine the logic.
// House 1: Diamond at Top. Vertices: (50,50), (0,0)-clipped? No.
// Standard North Indian:
// Square border. Diagonals (0,0 to 100,100) and (100,0 to 0,100).
// Inner Square (Midpoints): (50,0), (100,50), (50,100), (0,50).
//
// House 1 (Lagna): Area bounded by (50,0), (50,50), (?- wait, North Indian style is usually:
// 1 is Top Diamond.
// Polygons: 
// 1: 50,50 -> 0,0 -> 100,0 -> close (Triangle)? No, that's not right.
// 
// Let's use the standard "X" and "Diamond" lines.
// Lines: (0,0)-(100,100), (0,100)-(100,0).
// Lines: (50,0)-(0,50), (0,50)-(50,100), (50,100)-(100,50), (100,50)-(50,0).
// 
// House 1: Diamond Top/Center. Vertices: 50,50 (Center), 50,0 (TopMid)? No.
// Actually:
// H1: Polygon(50,50, 50,0, 100,0)? No.
// H1 is the top diamond in the "Lagna Chart". 
// Vertices: (50, 50), (25, 25)??
// let's look at a reference.
// The top diamond is H1.
// Vertices: (50, 50), (50, 0) -- wait, 50,0 is usually the boundary between H1 and H2? No.
// H1 is defined by vertices: (50, 50), (0, 0), (100, 0) ?? No, that covers H1, H2, H12.
//
// Okay, define coordinates precisely:
// H1: 50,50 -> 0,50 -> 0,0 -> 50,0 ??? No.

// RESTART COORDINATES
// Middle Box (Diamond) is usually H1, H4, H7, H10? No.
// House 1 = Top Diamond.
// House 4 = Left Diamond.
// House 7 = Bottom Diamond.
// House 10 = Right Diamond.
//
// H1 Vertices: 50,50 (Center), 0,50 (L-Mid)? No.
// The "Diamond" is 50,0 -> 0,50 -> 50,100 -> 100,50.
// H1 is usually the "Top" part of the chart.
// 
// Let's assume standard layout:
// H1: Polygon(50,50, 50,0) - wait, H1 is a rhomboid-like shape?
// Actually, H1 is the top diamond.
// Points: 50,50 (Center), 100,0 (Top Right Corner), 0,0 (Top Left Corner)?
// No, those are H2 and H12.
//
// Let's try this set:
// H1: 50,50 -> 50,25 -> ...
//
// Revised Path Set (Standard):
// H1 (Top Diamond): 50,50, 100,0, 50,0, 0,0? No.
// 
// H1 = P(50,50, 25,25, 50,0, 75,25) ?? 
//
// Search "North Indian Horoscope SVG Coordinates" mental model:
// Outer Square 0,0 to 100,100.
// H1 is Top Middle Diamond.
// Points: 50,50 (Center), 25,25 (?), 75,25 (?).
//
// Let's use a simpler approach. Define by triangles.
// H1 = 50,50 -> 100,0 -> 0,0 ?? No.
//
// Let's look at `H1`: Top Triangle? 
// H1 = 50,50 -> 100,0 -> 0,0. This triangle contains H1, H2, H12.
// Correction: H1 is H1. H2 is left of H1. H12 is right of H1.
// Usually H1 is the "Middle Top Diamond".
//
// Let's use the provided standard implementation for North Indian Chart.
// Lines drawn:
// 1. (0,0) to (100,100)
// 2. (0,100) to (100,0)
// 3. (50,0) to (0,50)
// 4. (0,50) to (50,100)
// 5. (50,100) to (100,50)
// 6. (100,50) to (50,0)
//
// Now identify houses in these zones:
// H1: The top diamond. 
//     Bounded by (50,50), (25,25), (50,0), (75,25).
// H2: The triangle to the left of H1, upper part.
//     Bounded by (25,25), (0,0), (50,0).
// H3: The triangle below H2.
//     Bounded by (0,0), (0,50), (25,25).
// H4: The left diamond.
//     Bounded by (50,50), (25,25), (0,50), (25,75).
// H5: The triangle below H4.
//     Bounded by (0,50), (0,100), (25,75).
// H6: The triangle to the right of H5 (bottom left).
//     Bounded by (25,75), (0,100), (50,100).
// H7: The bottom diamond.
//     Bounded by (50,50), (25,75), (50,100), (75,75).
// H8: The triangle to the right of H7 (bottom right).
//     Bounded by (50,100), (100,100), (75,75).
// H9: The triangle above H8.
//     Bounded by (75,75), (100,100), (100,50).
// H10: The right diamond.
//      Bounded by (50,50), (75,75), (100,50), (75,25).
// H11: The triangle above H10.
//      Bounded by (100,50), (100,0), (75,25).
// H12: The triangle to the left of H11 (top right).
//      Bounded by (75,25), (100,0), (50,0).

// Coordinate Map (0-100 scale):
// H1:  50,50  75,25  50,0   25,25
// H2:  50,0   25,25  0,0
// H3:  0,0    25,25  0,50
// H4:  50,50  25,25  0,50   25,75
// H5:  0,50   25,75  0,100
// H6:  0,100  25,75  50,100
// H7:  50,50  25,75  50,100 75,75
// H8:  50,100 75,75  100,100
// H9:  100,100 75,75 100,50
// H10: 50,50  75,75  100,50 75,25
// H11: 100,50 75,25  100,0
// H12: 100,0  75,25  50,0

// Text Anchor Points (approximate center for numbers/planets)
// H1: 50,25
// H2: 25,8   (Top middle of H2)
// H3: 8,25   (Left middle of H3)
// H4: 25,50
// H5: 8,75
// H6: 25,92
// H7: 50,75
// H8: 75,92
// H9: 92,75
// H10: 75,50
// H11: 92,25
// H12: 75,8
const HOUSE_CONFIG = [
  { id: 1, points: "50,50 25,25 50,0 75,25", cx: 50, cy: 30, signPos: { x: 50, y: 45 } },
  { id: 2, points: "50,0 25,25 0,0", cx: 25, cy: 12, signPos: { x: 25, y: 5 } },
  { id: 3, points: "0,0 25,25 0,50", cx: 12, cy: 25, signPos: { x: 5, y: 25 } },
  { id: 4, points: "50,50 25,25 0,50 25,75", cx: 30, cy: 50, signPos: { x: 45, y: 50 } }, // Left Diamond, sign roughly center-right
  { id: 5, points: "0,50 25,75 0,100", cx: 12, cy: 75, signPos: { x: 5, y: 75 } },
  { id: 6, points: "0,100 25,75 50,100", cx: 25, cy: 88, signPos: { x: 25, y: 95 } },
  { id: 7, points: "50,50 25,75 50,100 75,75", cx: 50, cy: 70, signPos: { x: 50, y: 55 } },
  { id: 8, points: "50,100 75,75 100,100", cx: 75, cy: 88, signPos: { x: 75, y: 95 } },
  { id: 9, points: "100,100 75,75 100,50", cx: 88, cy: 75, signPos: { x: 95, y: 75 } },
  { id: 10, points: "50,50 75,75 100,50 75,25", cx: 70, cy: 50, signPos: { x: 55, y: 50 } }, // Right Diamond
  { id: 11, points: "100,50 75,25 100,0", cx: 88, cy: 25, signPos: { x: 95, y: 25 } },
  { id: 12, points: "100,0 75,25 50,0", cx: 75, cy: 12, signPos: { x: 75, y: 5 } },
];

export default function NorthIndianChart({
  planets,
  ascendantSign,
  className = "w-full h-full",
  onPlanetClick,
  onHouseClick,
}: NorthIndianChartProps) {
  
  // Calculate which sign is in House 1, 2, etc.
  // In North Indian Chart, houses are fixed. Signs map to them.
  // H1 = Ascendant Sign
  // H2 = Ascendant + 1
  const getHouseSign = (houseNum: number) => {
    // ((Asc + house - 1) - 1) % 12 + 1
    const sign = ((ascendantSign + houseNum - 2) % 12) + 1;
    return sign;
  };

  // Group planets by house
  const planetsByHouse = useMemo(() => {
    const map: Record<number, Planet[]> = {};
    planets.forEach(p => {
      if (!map[p.house]) {
          map[p.house] = [];
      }
      map[p.house]!.push(p);
    });
    return map;
  }, [planets]);

  const PLANET_COLORS: Record<string, string> = {
    Sun: "#fbbf24", // orange-400
    Moon: "#e2e8f0", // slate-200
    Mars: "#f87171", // red-400
    Mercury: "#4ade80", // green-400
    Jupiter: "#facc15", // yellow-400
    Venus: "#f472b6", // pink-400
    Saturn: "#60a5fa", // blue-400
    Rahu: "#94a3b8", // slate-400
    Ketu: "#94a3b8", // slate-400
  };

  const getPlanetShortName = (name: string) => {
    return name.substring(0, 2);
  };

  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Background */}
      <rect x="0" y="0" width="100" height="100" fill="#0F172A" stroke="#334155" strokeWidth="0.5" />

      {/* House Zones */}
      {HOUSE_CONFIG.map((house) => {
        const housePlanets = planetsByHouse[house.id] || [];
        const signNum = getHouseSign(house.id);
        
        return (
          <g key={house.id} onClick={() => onHouseClick?.(house.id)} className="cursor-pointer hover:opacity-80">
            <polygon
              points={house.points}
              fill="rgba(255,255,255,0.03)"
              stroke="#334155"
              strokeWidth="0.5"
              className="transition-colors hover:fill-white/10"
            />
            {/* Sign Number */}
            <text
              x={house.signPos.x}
              y={house.signPos.y}
              fontSize="4"
              fill="rgba(255,255,255,0.3)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {signNum}
            </text>

            {/* Planets */}
            {housePlanets.map((planet, idx) => {
               // Simple spacing logic for planets
               // If multiple, stack them or spread them?
               // Let's stack them vertically roughly around cx, cy
               const offsetY = (idx - (housePlanets.length - 1) / 2) * 6;
               const px = house.cx;
               const py = house.cy + offsetY;
               
               return (
                 <motion.g 
                   key={planet.name}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   onClick={(e) => {
                      e.stopPropagation();
                      onPlanetClick?.(planet);
                   }}
                 >
                   <text
                    x={px}
                    y={py}
                    fontSize="3.5"
                    fill={PLANET_COLORS[planet.name] || "white"}
                    textAnchor="middle"
                    fontWeight="bold"
                    dominantBaseline="middle"
                    className="cursor-pointer"
                   >
                     {getPlanetShortName(planet.name)} {planet.isRetro ? "(R)" : ""}
                   </text>
                 </motion.g>
               );
            })}
          </g>
        );
      })}
    </svg>
  );
}
