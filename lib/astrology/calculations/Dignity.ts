/**
 * Dignity and Strength Calculator
 * 
 * Implements classical Vedic Astrology logic for:
 * 1. Functional Nature (Benefic/Malefic) based on Ascendant
 * 2. Essential Dignity (Exaltation, Moolatrikona, Own Sign)
 * 3. Permanent & Temporary Friendship (Panchadha Maitri)
 * 4. Composite Strength Score (Simplified Shadbala)
 */

export type FunctionalNature = "Yoga Karaka" | "Functional Benefic" | "Functional Malefic" | "Neutral";
export type DignityLevel = "Exalted" | "Moolatrikona" | "Own Sign" | "Great Friend" | "Friend" | "Neutral" | "Enemy" | "Great Enemy" | "Debilitated";

export interface PlanetDignity {
  planet: string;
  functionalNature: FunctionalNature;
  dignityLevel: DignityLevel;
  strengthScore: number; // 0-100 normalized score
  isCombust: boolean; // TODO: Implement if sun data available
}

// 1. Permanent Friendship Table (Naisargika Maitri)
// Structure: Planet -> { Friends, Neutrals, Enemies }
const PERMANENT_RELATIONSHIPS: Record<string, { friends: string[], enemies: string[], neutrals: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutrals: ["Mercury"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutrals: ["Venus", "Saturn"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"], neutrals: ["Mars", "Jupiter", "Saturn"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutrals: ["Saturn"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutrals: ["Mars", "Jupiter"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutrals: ["Jupiter"] },
  Rahu: { friends: ["Venus", "Saturn"], enemies: ["Sun", "Moon", "Mars"], neutrals: ["Mercury", "Jupiter"] },
  Ketu: { friends: ["Mars", "Venus"], enemies: ["Sun", "Moon", "Saturn"], neutrals: ["Mercury", "Jupiter"] }
};

// 2. Exaltation and Debilitation Points (Deepest)
const DIGNITY_POINTS: Record<string, { exaltation: number, debilitation: number, exaltationSign: number, debilitationSign: number }> = {
  Sun: { exaltation: 10, debilitation: 10, exaltationSign: 1, debilitationSign: 7 }, // Aries / Libra
  Moon: { exaltation: 3, debilitation: 3, exaltationSign: 2, debilitationSign: 8 },  // Taurus / Scorpio
  Mars: { exaltation: 28, debilitation: 28, exaltationSign: 10, debilitationSign: 4 }, // Capricorn / Cancer
  Mercury: { exaltation: 15, debilitation: 15, exaltationSign: 6, debilitationSign: 12 }, // Virgo / Pisces
  Jupiter: { exaltation: 5, debilitation: 5, exaltationSign: 4, debilitationSign: 10 }, // Cancer / Capricorn
  Venus: { exaltation: 27, debilitation: 27, exaltationSign: 12, debilitationSign: 6 }, // Pisces / Virgo
  Saturn: { exaltation: 20, debilitation: 20, exaltationSign: 7, debilitationSign: 1 }, // Libra / Aries
  Rahu: { exaltation: -1, debilitation: -1, exaltationSign: 0, debilitationSign: 0 }, // Specifics vary
  Ketu: { exaltation: -1, debilitation: -1, exaltationSign: 0, debilitationSign: 0 }, // Specifics vary
};

// 3. Own Signs (Swakshetra)
// Planet -> Sign Numbers (1-12)
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [5],
  Moon: [4],
  Mars: [1, 8],
  Mercury: [3, 6],
  Jupiter: [9, 12],
  Venus: [2, 7],
  Saturn: [10, 11],
  Rahu: [], // Often represented as co-lord of Aquarius (11)
  Ketu: []  // Often represented as co-lord of Scorpio (8)
};

// 4. Moolatrikona Ranges (Approximate for simplicity)
// Planet -> { sign, degrees }
const MOOLATRIKONA: Record<string, { sign: number, maxDegree: number }> = {
  Sun: { sign: 5, maxDegree: 20 },
  Moon: { sign: 2, maxDegree: 30 }, // Technically 4-30 deg
  Mars: { sign: 1, maxDegree: 12 }, // 0-12
  Mercury: { sign: 6, maxDegree: 20 }, // 16-20
  Jupiter: { sign: 9, maxDegree: 10 }, // 0-10
  Venus: { sign: 7, maxDegree: 15 }, // 0-15
  Saturn: { sign: 11, maxDegree: 20 }, // 0-20
};



/**
 * Determine Functional Nature relative to Ascendant
 * Rules:
 * - Lords of 1, 5, 9 are Benefics.
 * - Lords of 6, 8, 12 are Malefics.
 * - Lords of Angles (1, 4, 7, 10):
 *    - Benefics owning angles become neutral/malefic (Kendradhipati Dosha).
 *    - Malefics owning angles become neutral/benefic.
 * - Yoga Karaka: Lord of a Kendra (1,4,7,10) AND a Trikona (1,5,9).
 */
export function calculateFunctionalNature(planet: string, ascendantSign: number): FunctionalNature {
  // Define house rulerships relative to Ascendant
  // 1. Get Planet's Own Signs
  const ownSigns = OWN_SIGNS[planet] || [];
  if (ownSigns.length === 0) return "Neutral"; // Rahu/Ketu

  // 2. Find which houses these signs fall in relative to Lagna
  const housesOwned = ownSigns.map(sign => {
    let house = sign - ascendantSign + 1;
    if (house <= 0) house += 12;
    return house;
  });

  // 3. Apply Rules
  const isAngle = (h: number) => [1, 4, 7, 10].includes(h);

  const isDusthana = (h: number) => [6, 8, 12].includes(h);
  const isUpachaya311 = (h: number) => [3, 11].includes(h); // 3, 6, 10, 11 are Upachaya, but 6 is Dusthana

  const ownsAngle = housesOwned.some(isAngle);
  const ownsDusthana = housesOwned.some(isDusthana);
  
  // Rule: Yoga Karaka (Angle + Trine) - e.g. Mars for Cancer/Leo, Saturn for Libra/Taurus, Venus for Capricorn/Aquarius
  if (ownsAngle && housesOwned.some(h => [5, 9].includes(h))) { // Exclude 1 as trine here to avoid double counting if 1 is the only match
     return "Yoga Karaka";
  }
  // Special case: Lord of 1 is always benefic (even if it owns 8, like Mars for Aries)
  if (housesOwned.includes(1)) {
    return "Functional Benefic";
  }

  // Rule: Lords of Trines (5, 9) are always functional benefics
  if (housesOwned.some(h => [5, 9].includes(h))) {
     // Even if they own dusthana? Jupiter for Leo (5, 8) -> Benefic.
     return "Functional Benefic";
  }

  // Rule: Lords of Dusthanas (6, 8, 12) are Malefics
  if (ownsDusthana) {
     // If also owns Angle? (e.g. Venus for Aries: 2, 7. Oh wait Venus for Aries is 2 & 7. 2 is Neutral/Maraka).
     // Mars for Gemini (6, 11). Malefic.
     return "Functional Malefic";
  }
  
  // Rule: Lords of 3, 11 (Trishadaya - 3, 6, 11) are Malefic
  if (housesOwned.some(isUpachaya311)) {
     return "Functional Malefic";
  }

  return "Neutral";
}

/**
 * Determine Essential Dignity
 */
export function calculateDignity(planet: string, signPosition: number, degree: number, hostPlanet: string | null): DignityLevel {
  if (!hostPlanet) return "Neutral"; // Fallback
  
  // 1. Exaltation / Debilitation
  const pts = DIGNITY_POINTS[planet];
  if (pts) {
    if (signPosition === pts.exaltationSign) return "Exalted";
    if (signPosition === pts.debilitationSign) return "Debilitated";
  }

  // 2. Moolatrikona
  const moola = MOOLATRIKONA[planet];
  if (moola && signPosition === moola.sign && degree <= moola.maxDegree) {
    return "Moolatrikona";
  }

  // 3. Own Sign
  if ((OWN_SIGNS[planet] || []).includes(signPosition)) {
    return "Own Sign";
  }

  // 4. Temporary Friendship (Tatkalika Maitri)
  // Determine if host is Friend/Enemy of Planet
  // This is complex as it requires positions of ALL planets to determining temporary rels (2,3,4,10,11,12 from planet).
  // Simplified for client-side without full map: Use Permanent Relationship only for MVP Phase 3
  // Or assume "Neutral" temporary and refine permanent.

  const rels = PERMANENT_RELATIONSHIPS[planet];
  if (!rels) return "Neutral";

  if (rels.friends.includes(hostPlanet)) return "Friend";
  if (rels.enemies.includes(hostPlanet)) return "Enemy";
  
  return "Neutral";
}

/**
 * Calculate simple Composite Strength Score (0-100)
 */
export function calculateStrengthScore(dignity: DignityLevel, isRetro: boolean): number {
  let score = 50;

  switch (dignity) {
    case "Exalted": score = 100; break;
    case "Moolatrikona": score = 90; break;
    case "Own Sign": score = 80; break;
    case "Great Friend": score = 75; break;
    case "Friend": score = 70; break;
    case "Neutral": score = 50; break;
    case "Enemy": score = 30; break;
    case "Great Enemy": score = 20; break;
    case "Debilitated": score = 10; break;
  }

  // Chestha Bala Proxy: Retrograde planets are strong (bright) even if malefic
  if (isRetro) {
    score = Math.min(score * 1.3, 100);
  }

  return Math.round(score);
}
