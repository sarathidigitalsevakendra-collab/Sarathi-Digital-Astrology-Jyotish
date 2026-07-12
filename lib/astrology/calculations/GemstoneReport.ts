/**
 * Gemstone Recommendation Engine
 *
 * Generates personalised gemstone recommendations based on a birth chart.
 * Classical Jyotish rules:
 *  - Wear gemstone of WEAK FUNCTIONAL BENEFICS (strengthens them)
 *  - NEVER wear gemstone of Functional Malefics
 *  - Ascendant lord gemstone is ALWAYS safe
 */

import { FunctionalNature, DignityLevel, calculateFunctionalNature, calculateDignity, calculateStrengthScore } from "./Dignity";
import { RASHI_LORDS } from "./VedicMath";

// ─── Gemstone Detail Registry ─────────────────────────────────────────────────

export interface GemstoneDetail {
  planet: string;
  gemstone: string;
  alternates: string[];
  metal: string;
  finger: string;
  wearDay: string;
  wearTime: string;
  mantra: string;
  benefits: string;
  caution: string;
}

export const GEMSTONE_DETAILS: Record<string, GemstoneDetail> = {
  Sun: {
    planet: "Sun",
    gemstone: "Ruby (Manik)",
    alternates: ["Red Garnet", "Red Spinel", "Sunstone"],
    metal: "Gold",
    finger: "Ring finger (right hand)",
    wearDay: "Sunday",
    wearTime: "Sunrise hour",
    mantra: "Om Suryaya Namaha (108 times)",
    benefits: "Boosts confidence, authority, father's health, career in government/leadership, eye health.",
    caution: "Avoid if Sun is a functional malefic for your ascendant.",
  },
  Moon: {
    planet: "Moon",
    gemstone: "Pearl (Moti)",
    alternates: ["Moonstone", "White Coral"],
    metal: "Silver",
    finger: "Little finger (right hand)",
    wearDay: "Monday",
    wearTime: "Sunrise hour",
    mantra: "Om Chandraya Namaha (108 times)",
    benefits: "Enhances emotional stability, mother's health, mental peace, intuition.",
    caution: "Natural pearl only — cultured/synthetic pearls have no astrological effect.",
  },
  Mars: {
    planet: "Mars",
    gemstone: "Red Coral (Moonga)",
    alternates: ["Carnelian", "Blood Stone"],
    metal: "Gold or Copper",
    finger: "Ring finger (right hand)",
    wearDay: "Tuesday",
    wearTime: "Sunrise hour",
    mantra: "Om Angarakaya Namaha (108 times)",
    benefits: "Increases energy, courage, sibling harmony, property gains, surgery recovery.",
    caution: "Not recommended for Gemini, Virgo, or Libra ascendants without expert consultation.",
  },
  Mercury: {
    planet: "Mercury",
    gemstone: "Emerald (Panna)",
    alternates: ["Green Tourmaline", "Peridot", "Chrome Diopside"],
    metal: "Gold or Platinum",
    finger: "Little finger (right hand)",
    wearDay: "Wednesday",
    wearTime: "Sunrise hour",
    mantra: "Om Budhaya Namaha (108 times)",
    benefits: "Sharpens intellect, communication, business skills, nervous system health.",
    caution: "Avoid with Pearls (Moon–Mercury conflict for some ascendants).",
  },
  Jupiter: {
    planet: "Jupiter",
    gemstone: "Yellow Sapphire (Pukhraj)",
    alternates: ["Citrine", "Yellow Topaz", "Heliodor"],
    metal: "Gold",
    finger: "Index finger (right hand)",
    wearDay: "Thursday",
    wearTime: "Morning (6–8 AM)",
    mantra: "Om Brihaspataye Namaha (108 times)",
    benefits: "Wealth, wisdom, marriage, children, spiritual growth, good fortune.",
    caution: "One of the safest gemstones — generally beneficial for most ascendants.",
  },
  Venus: {
    planet: "Venus",
    gemstone: "Diamond (Heera)",
    alternates: ["White Sapphire", "White Zircon", "Opal"],
    metal: "Platinum or White Gold",
    finger: "Middle finger (right hand)",
    wearDay: "Friday",
    wearTime: "Morning",
    mantra: "Om Shukraya Namaha (108 times)",
    benefits: "Love, marriage, luxury, artistic talents, vehicles, reproductive health.",
    caution: "Diamond should be flawless — inclusions can amplify negative effects.",
  },
  Saturn: {
    planet: "Saturn",
    gemstone: "Blue Sapphire (Neelam)",
    alternates: ["Amethyst", "Blue Tanzanite", "Iolite"],
    metal: "Gold or Panchdhatu (5-metal alloy)",
    finger: "Middle finger (right hand)",
    wearDay: "Saturday",
    wearTime: "Early morning",
    mantra: "Om Sham Shanicharaya Namaha (108 times)",
    benefits: "Career stability, discipline, longevity, property, service sector success.",
    caution: "MUST be worn on a trial basis for 3 days first. Most powerful and sensitive stone.",
  },
  Rahu: {
    planet: "Rahu",
    gemstone: "Hessonite (Gomed)",
    alternates: ["Zircon (brown/orange)", "Spessartite Garnet"],
    metal: "Silver or Panchdhatu",
    finger: "Middle finger (right hand)",
    wearDay: "Saturday",
    wearTime: "Evening",
    mantra: "Om Rahave Namaha (108 times)",
    benefits: "Favourable for Rahu Mahadasha. Reduces confusion, delays, and deception.",
    caution: "Only wear during Rahu Mahadasha/Antardasha with astrologer guidance.",
  },
  Ketu: {
    planet: "Ketu",
    gemstone: "Cat's Eye (Lehsunia)",
    alternates: ["Chrysoberyl (yellow-green)", "Tourmaline (green)"],
    metal: "Silver or Gold",
    finger: "Ring finger (right hand)",
    wearDay: "Saturday or Tuesday",
    wearTime: "Morning",
    mantra: "Om Ketave Namaha (108 times)",
    benefits: "Spiritual growth, occult knowledge, moksha, reduces fears. Helpful in Ketu Dasha.",
    caution: "Only during Ketu Mahadasha. One of the most sensitive stones.",
  },
};

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface GemstoneRecommendation {
  planet: string;
  priority: "Primary" | "Secondary" | "Avoid";
  reason: string;
  functionalNature: FunctionalNature;
  dignity: DignityLevel;
  strengthScore: number;
  detail: GemstoneDetail;
}

export interface GemstoneReport {
  ascendantSign: number;
  ascendantLord: string;
  recommendations: GemstoneRecommendation[];
  primaryGemstone: GemstoneDetail | null;
  generalAdvice: string;
}

// ─── Main Function ────────────────────────────────────────────────────────────

export function generateGemstoneReport(planets: {
  name: string;
  fullDegree: number;
  isRetro?: boolean;
}[], ascendant: number): GemstoneReport {
  const ascendantSign = Math.floor(ascendant / 30) + 1;
  const ascendantLord = RASHI_LORDS[ascendantSign] ?? "Sun";

  const recommendations: GemstoneRecommendation[] = [];

  for (const planet of planets) {
    const signNum = Math.floor(planet.fullDegree / 30) + 1;
    const host = RASHI_LORDS[signNum] ?? "Sun";
    const dignity = calculateDignity(planet.name, signNum, planet.fullDegree % 30, host);
    const nature = calculateFunctionalNature(planet.name, ascendantSign);
    const strength = calculateStrengthScore(dignity, !!planet.isRetro);
    const detail = GEMSTONE_DETAILS[planet.name];

    if (!detail) continue;

    let priority: GemstoneRecommendation["priority"];
    let reason: string;

    if (nature === "Functional Malefic") {
      priority = "Avoid";
      reason = `${planet.name} is a functional malefic for your ascendant. Wearing its gemstone may amplify negative effects.`;
    } else if (
      (nature === "Functional Benefic" || nature === "Yoga Karaka") &&
      strength < 50
    ) {
      priority = "Primary";
      reason = `${planet.name} is beneficial for you but weak (${dignity}, strength ${strength}%). Its gemstone will strengthen it significantly.`;
    } else if (planet.name === ascendantLord) {
      priority = "Primary";
      reason = `${planet.name} is your ascendant lord — its gemstone is always beneficial for health, vitality, and overall life.`;
    } else if (nature === "Neutral") {
      priority = "Secondary";
      reason = `${planet.name} is neutral for your chart. Its gemstone can be tried during its Mahadasha/Antardasha.`;
    } else {
      priority = "Secondary";
      reason = `${planet.name} is reasonably strong (strength ${strength}%). Gemstone recommended only during its Dasha period.`;
    }

    recommendations.push({
      planet: planet.name,
      priority,
      reason,
      functionalNature: nature,
      dignity,
      strengthScore: strength,
      detail,
    });
  }

  // Sort: Primary first, then Secondary, then Avoid
  recommendations.sort((a, b) => {
    const order = { Primary: 0, Secondary: 1, Avoid: 2 };
    return order[a.priority] - order[b.priority];
  });

  const primaryRec = recommendations.find((r) => r.priority === "Primary");

  return {
    ascendantSign,
    ascendantLord,
    recommendations,
    primaryGemstone: primaryRec?.detail ?? null,
    generalAdvice: `Your ascendant lord is ${ascendantLord}. Always wear gemstones after a 3-day trial. Purchase from certified dealers. Minimum weight: 3 carats for most stones.`,
  };
}
