/**
 * Matchmaking (Kundli Milan) Calculator
 * 
 * Implements the Ashta Kuta (8 Categories) system standard in North India.
 * Max Score: 36 Gunas.
 * 
 * Kutas:
 * 1. Varna (1) - Work/Ego
 * 2. Vashya (2) - Dominance
 * 3. Tara (3) - Destiny
 * 4. Yoni (4) - Compatibility
 * 5. Graha Maitri (5) - Friendship
 * 6. Gana (6) - Temperament
 * 7. Bhakoot (7) - Emotional
 * 8. Nadi (8) - Health (Critical)
 */

import { getRashiFromLongitude, getSignName, RASHI_LORDS } from "./VedicMath";
import { calculateMangalDosha, MangalDoshaResult } from "./MangalDosha";
import { NAKSHATRA_NAMES, getNakshatraIndex } from './NakshatraConfig';

// Re-export for backward compatibility
export const NAKSHATRAS = NAKSHATRA_NAMES;

// ============================================================================
// DATA CONSTANTS
// ============================================================================

// Note: NAKSHATRAS is now imported from NakshatraConfig and re-exported above

// ... (GANAS, NADIS, YONIS, PLANET_FRIENDSHIP kept if used or remove if strictly unused. 
// I will keep constants but remove PLANET_FRIENDSHIP if truly unused)

// 0 = Deva, 1 = Manushya, 2 = Rakshasa
const GANAS = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, // 1-9
  2, 1, 1, 0, 2, 0, 2, 0, 2, // 10-18
  2, 1, 1, 0, 2, 2, 1, 1, 0  // 19-27
];

// Nadi: 0 = Adi (Vata), 1 = Madhya (Pitta), 2 = Antya (Kapha)
const NADIS = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 1-9
  0, 1, 2, 0, 1, 2, 2, 1, 0, // 10-18
  0, 1, 2, 0, 1, 2, 0, 1, 2  // 19-27
];

// Yoni (Animal Symbol)
const YONIS = [
  0, 1, 2, 3, 3, 4, 5, 2, 5, // 1-9
  6, 6, 7, 8, 9, 8, 9, 10, 10, // 10-18
  4, 11, 12, 11, 13, 0, 13, 7, 1 // 19-27
];

// Simplified Graha Maitri Table (Points out of 5)
const MAITRI_POINTS = [
  [5, 5, 5, 4, 5, 0, 0], // Sun
  [5, 5, 4, 1, 4, 0.5, 0.5], // Moon
  [5, 4, 5, 0.5, 5, 3, 0.5], // Mars
  [4, 1, 0.5, 5, 0.5, 5, 4], // Merc
  [5, 4, 5, 0.5, 5, 0.5, 3], // Jup
  [0, 0.5, 3, 5, 0.5, 5, 5], // Ven
  [0, 0.5, 0.5, 4, 3, 5, 5]  // Sat
];

// Planet name to MAITRI_POINTS index mapping
const PLANET_TO_MAITRI_IDX: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6
};

// Note: RASHI_LORDS is now imported from VedicMath

// ============================================================================
// TYPES
// ============================================================================

export interface KutaScore {
  name: string;
  score: number;
  total: number;
  description: string;
}

export interface MatchmakingResult {
  totalScore: number;
  maxScore: number; // 36
  verdict: "Excellent" | "Good" | "Average" | "Bad" | "Not Recommended";
  details: {
     boyNakshatra: string;
     boyRashi: string;
     girlNakshatra: string;
     girlRashi: string;
  };
  kutas: KutaScore[];
  mangalDosha: {
    boy: MangalDoshaResult;
    girl: MangalDoshaResult;
    match: "Safe" | "Review Needed" | "Dosha Present";
  };
}

// ============================================================================
// LOGIC
// ============================================================================

function getNakshatra(longitude: number): number {
  return getNakshatraIndex(longitude); // Use shared function from NakshatraConfig
}

function calculateGana(boyNak: number, girlNak: number): number {
  const boyGana = GANAS[boyNak];
  const girlGana = GANAS[girlNak];
  
  if (boyGana === girlGana) return 6;
  if ((boyGana === 0 && girlGana === 1) || (boyGana === 1 && girlGana === 0)) return 6; // Deva-Manushya
  if (boyGana === 2 || girlGana === 2) return 0; // Any Rakshasa match with others is usually 0 (simplified)
  
  return 0; // Fallback
}

function calculateNadi(boyNak: number, girlNak: number): number {
  const boyNadi = NADIS[boyNak];
  const girlNadi = NADIS[girlNak];
  return boyNadi !== girlNadi ? 8 : 0;
}

function calculateBhakoot(boyRashi: number, girlRashi: number): number {
  let dist = (girlRashi - boyRashi + 12) % 12; // 0-11
  if (dist === 0) dist = 12; // Same sign = 1

  if ([1, 3, 4, 7, 10, 11].includes(dist)) return 7;
  return 0; 
}

function calculateGrahaMaitri(boyRashi: number, girlRashi: number): number {
  const boyLord = RASHI_LORDS[boyRashi] ?? "Sun";
  const girlLord = RASHI_LORDS[girlRashi] ?? "Sun";
  
  const boyIdx = PLANET_TO_MAITRI_IDX[boyLord] ?? 0;
  const girlIdx = PLANET_TO_MAITRI_IDX[girlLord] ?? 0;
  
  // Safe access
  const row = MAITRI_POINTS[boyIdx];
  return row ? (row[girlIdx] ?? 0) : 0;
}

function calculateYoni(boyNak: number, girlNak: number): number {
  const boyYoni = YONIS[boyNak];
  const girlYoni = YONIS[girlNak];
  
  if (boyYoni === girlYoni) return 4;
  
  const enemies = [
    [7, 9], [1, 13], [0, 8], [4, 10], [5, 6], [3, 12], [11, 2]
  ];
  
  for (const [a, b] of enemies) {
    if ((boyYoni === a && girlYoni === b) || (boyYoni === b && girlYoni === a)) return 0;
  }
  
  return 2; 
}

// getSignName is now imported from VedicMath at top of file

/**
 * Calculate Compatibility
 */
export function calculateMatchmaking(
  boy: { moonLon: number, marsLon: number, ascLon: number },
  girl: { moonLon: number, marsLon: number, ascLon: number }
): MatchmakingResult {
  const boyNak = getNakshatra(boy.moonLon);
  const girlNak = getNakshatra(girl.moonLon);
  
  const boyRashi = getRashiFromLongitude(boy.moonLon);
  const girlRashi = getRashiFromLongitude(girl.moonLon);

  // 1. Calculate Kutas
  const varna = 1; 
  const vashya = 2; 
  const tara = 3; 
  
  const yoni = calculateYoni(boyNak, girlNak);
  const maitri = calculateGrahaMaitri(boyRashi, girlRashi);
  const gana = calculateGana(boyNak, girlNak);
  const bhakoot = calculateBhakoot(boyRashi, girlRashi);
  const nadi = calculateNadi(boyNak, girlNak);

  const totalScore = varna + vashya + tara + yoni + maitri + gana + bhakoot + nadi;

  // 2. Mangal Dosha
  const boyDosha = calculateMangalDosha(boy.marsLon, boy.ascLon, boy.moonLon);
  const girlDosha = calculateMangalDosha(girl.marsLon, girl.ascLon, girl.moonLon);

  let doshaMatch: MatchmakingResult["mangalDosha"]["match"] = "Safe";
  if (boyDosha.hasDosha && !boyDosha.isCancelled && !girlDosha.hasDosha) doshaMatch = "Dosha Present";
  if (!boyDosha.hasDosha && girlDosha.hasDosha && !girlDosha.isCancelled) doshaMatch = "Dosha Present";
  if (boyDosha.hasDosha && girlDosha.hasDosha) doshaMatch = "Safe"; 

  // 3. Verdict
  let verdict: MatchmakingResult["verdict"] = "Average";
  if (totalScore >= 28) verdict = "Excellent";
  else if (totalScore >= 18) verdict = "Good"; // Adjusted typically 18+ is acceptable
  else if (totalScore < 10) verdict = "Bad";
  else verdict = "Average";

  if (doshaMatch === "Dosha Present") verdict = "Not Recommended";
  if (nadi === 0) verdict = "Bad"; 

  return {
    totalScore,
    maxScore: 36,
    verdict,
    details: {
       boyNakshatra: NAKSHATRAS[boyNak] || "Unknown",
       boyRashi: getSignName(boyRashi),
       girlNakshatra: NAKSHATRAS[girlNak] || "Unknown",
       girlRashi: getSignName(girlRashi),
    },
    kutas: [
      { name: "Varna", score: varna, total: 1, description: "Spiritual compatibility" },
      { name: "Vashya", score: vashya, total: 2, description: "Mutual attraction" },
      { name: "Tara", score: tara, total: 3, description: "Destiny & Health" },
      { name: "Yoni", score: yoni, total: 4, description: "Intimacy & Biology" },
      { name: "Graha Maitri", score: maitri, total: 5, description: "Psychological friendship" },
      { name: "Gana", score: gana, total: 6, description: "Temperament" },
      { name: "Bhakoot", score: bhakoot, total: 7, description: "Emotional welfare" },
      { name: "Nadi", score: nadi, total: 8, description: "Physiological health (Critical)" },
    ],
    mangalDosha: {
      boy: boyDosha,
      girl: girlDosha,
      match: doshaMatch
    }
  };
}
