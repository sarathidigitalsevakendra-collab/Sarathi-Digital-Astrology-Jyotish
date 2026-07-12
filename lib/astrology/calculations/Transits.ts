/**
 * Transit Predictions Calculator (Gochar)
 * 
 * TypeScript port of Python transits.py for detecting planetary transits and their effects.
 * Analyzes aspects between current transiting planets and natal planet positions.
 */

import { calculatePlanetaryPositions } from "./PlanetaryPositions";
import { PlanetData } from "./YogaDetector";

// Aspect definitions with orbs and effects
const ASPECTS = {
  conjunction: { angle: 0, orb: 8, nature: "intense" },
  opposition: { angle: 180, orb: 8, nature: "challenging" },
  trine: { angle: 120, orb: 6, nature: "harmonious" },
  square: { angle: 90, orb: 6, nature: "challenging" },
  sextile: { angle: 60, orb: 4, nature: "harmonious" },
} as const;

type AspectName = keyof typeof ASPECTS;
type AspectNature = "intense" | "challenging" | "harmonious";

// Planet significations for interpretation
const PLANET_SIGNIFICATIONS: Record<string, string[]> = {
  Sun: ["self", "vitality", "authority", "career", "father"],
  Moon: ["mind", "emotions", "mother", "public", "comfort"],
  Mars: ["energy", "action", "courage", "conflict", "siblings"],
  Mercury: ["communication", "intellect", "business", "education"],
  Jupiter: ["wisdom", "luck", "expansion", "spirituality", "guru"],
  Venus: ["love", "beauty", "wealth", "arts", "relationships"],
  Saturn: ["discipline", "karma", "delays", "structure", "lessons"],
  Rahu: ["desires", "obsession", "unconventional", "foreign"],
  Ketu: ["spirituality", "detachment", "past karma", "liberation"],
};

// Transit effects based on nature
const TRANSIT_EFFECTS: Record<AspectNature, Record<string, string>> = {
  harmonious: {
    Sun: "Positive energy boost for self-expression and authority",
    Moon: "Emotional harmony and mental peace",
    Mars: "Constructive action and healthy competition",
    Mercury: "Clear communication and good decisions",
    Jupiter: "Growth opportunities and good fortune",
    Venus: "Love, beauty, and financial gains",
    Saturn: "Productive discipline and lasting achievements",
    Rahu: "Unconventional opportunities that work out well",
    Ketu: "Spiritual insights and letting go gracefully",
  },
  challenging: {
    Sun: "Ego conflicts and need to prove yourself",
    Moon: "Emotional turbulence and mental stress",
    Mars: "Impulsive actions and potential conflicts",
    Mercury: "Miscommunication and hasty decisions",
    Jupiter: "Overconfidence and missed opportunities",
    Venus: "Relationship tensions and overspending",
    Saturn: "Obstacles, delays, and hard lessons",
    Rahu: "Confusion and unhealthy desires",
    Ketu: "Detachment anxiety and loss of direction",
  },
  intense: {
    Sun: "Powerful transformation of self-identity",
    Moon: "Intensified emotions and new beginnings",
    Mars: "Surge of energy for major initiatives",
    Mercury: "Important communications and new ideas",
    Jupiter: "Major expansion and life-changing luck",
    Venus: "Significant relationships and financial changes",
    Saturn: "Major karmic events and restructuring",
    Rahu: "Obsessive focus on new desires",
    Ketu: "Deep spiritual awakening or release",
  },
};

// Slow planets (their transits are more significant)
const SLOW_PLANETS = new Set(["Jupiter", "Saturn", "Rahu", "Ketu"]);

export interface TransitAspect {
  transitPlanet: string;
  transitLongitude: number;
  natalPlanet: string;
  natalLongitude: number;
  aspect: AspectName;
  nature: AspectNature;
  exactness: number; // 0 to 1
  orb: number;
  effect: string;
  significance: "critical" | "major" | "notable" | "minor";
  significations: string[];
}

export interface TransitsResult {
  transitTime: string;
  currentPositions: Record<string, number>;
  activeTransits: TransitAspect[];
  summary: {
    totalAspects: number;
    majorTransits: number;
    challengingCount: number;
    harmoniousCount: number;
    overallTone: "challenging" | "favorable" | "mixed";
    interpretation: string;
  };
}

/**
 * Check if there's an aspect between transit and natal position.
 */
function calculateAspect(transitLon: number, natalLon: number): {
  aspect: AspectName;
  angle: number;
  actualAngle: number;
  orb: number;
  exactness: number;
  nature: AspectNature;
} | null {
  let diff = Math.abs(transitLon - natalLon);
  if (diff > 180) {
    diff = 360 - diff;
  }

  for (const [aspectName, data] of Object.entries(ASPECTS)) {
    const { angle, orb, nature } = data;
    const diffFromAngle = Math.abs(diff - angle);

    if (diffFromAngle <= orb) {
      const exactness = 1 - (diffFromAngle / orb);
      return {
        aspect: aspectName as AspectName,
        angle,
        actualAngle: Number(diff.toFixed(2)),
        orb: Number(diffFromAngle.toFixed(2)),
        exactness: Number(exactness.toFixed(2)),
        nature: nature as AspectNature,
      };
    }
  }

  return null;
}

/**
 * Calculate transit effects on natal chart.
 * 
 * @param natalPlanets Map of planet name -> PlanetData (contains longitude)
 * @param date Time for transit calculation (default: now)
 */
export function calculateTransits(
  natalPlanets: Map<string, PlanetData>,
  date: Date = new Date(),
  transitPositions?: { name: string; longitude: number }[]
): TransitsResult {
  // 1. Get current transits
  const currentPositions: Record<string, number> = {};

  if (transitPositions) {
    // Use external positions if provided (Hybrid Strategy)
    for (const p of transitPositions) {
      currentPositions[p.name] = p.longitude;
    }
  } else {
    // Fallback to local calculation
    // We use 0,0 for lat/lon as geocentric positions are independent of location for standard astrology
    const currentPositionsList = calculatePlanetaryPositions(date, 0, 0);
    
    for (const p of currentPositionsList) {
      currentPositions[p.name] = p.longitude;
    }
  }

  // 2. Analyze aspects
  const activeTransits: TransitAspect[] = [];
  const priorityOrder = { critical: 0, major: 1, notable: 2, minor: 3 };

  for (const [transitName, transitLon] of Object.entries(currentPositions)) {
    // Skip if not in our signification list (e.g. Earth, outer planets if not supported)
    if (!PLANET_SIGNIFICATIONS[transitName]) continue;

    for (const [natalName, natalData] of natalPlanets.entries()) {
       // Skip if not in our signification list
       if (!PLANET_SIGNIFICATIONS[natalName]) continue;

       const aspectData = calculateAspect(transitLon, natalData.longitude);

       if (aspectData) {
         const nature = aspectData.nature;
         const effect = TRANSIT_EFFECTS[nature]?.[transitName] || "Significant transit";
         const isSlow = SLOW_PLANETS.has(transitName);
         
         let significance: TransitAspect["significance"] = isSlow ? "major" : "minor";
         if (aspectData.exactness > 0.8) {
           significance = isSlow ? "critical" : "notable";
         }

         activeTransits.push({
           transitPlanet: transitName,
           transitLongitude: transitLon,
           natalPlanet: natalName,
           natalLongitude: natalData.longitude,
           aspect: aspectData.aspect,
           nature,
           exactness: aspectData.exactness,
           orb: aspectData.orb,
           effect,
           significance,
           significations: PLANET_SIGNIFICATIONS[transitName] || [],
         });
       }
    }
  }

  // Sort by significance and exactness
  activeTransits.sort((a, b) => {
    const sigDiff = priorityOrder[a.significance] - priorityOrder[b.significance];
    if (sigDiff !== 0) return sigDiff;
    return b.exactness - a.exactness;
  });

  // Generate Summary
  const majorTransits = activeTransits.filter(t => t.significance === "critical" || t.significance === "major");
  const challenging = majorTransits.filter(t => t.nature === "challenging");
  const harmonious = majorTransits.filter(t => t.nature === "harmonious");

  let overallTone: "challenging" | "favorable" | "mixed" = "mixed";
  let interpretation = "Current transits bring a mix of opportunities and challenges.";

  if (challenging.length > harmonious.length) {
    overallTone = "challenging";
    interpretation = "Current transits indicate a period requiring patience and careful action.";
  } else if (harmonious.length > challenging.length) {
    overallTone = "favorable";
    interpretation = "Current transits support positive developments and opportunities.";
  }

  return {
    transitTime: date.toISOString(),
    currentPositions,
    activeTransits,
    summary: {
      totalAspects: activeTransits.length,
      majorTransits: majorTransits.length,
      challengingCount: challenging.length,
      harmoniousCount: harmonious.length,
      overallTone,
      interpretation,
    }
  };
}
