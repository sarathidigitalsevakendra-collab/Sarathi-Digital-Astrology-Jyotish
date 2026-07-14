/**
 * Mangal Dosha (Mars Defect) Calculator
 * 
 * Determins if a chart has Mangal Dosha (Kuja Dosha) based on Mars placement.
 * Checks placement from both Ascendant (Lagna) and Moon.
 * 
 * Rules:
 * Mars in 1, 2, 4, 7, 8, 12 houses = Dosha.
 * 
 * Exceptions (Low Dosha / Cancellation) are also detected.
 */

import { getHouseFromLongitude } from "./VedicMath";

export interface MangalDoshaResult {
  hasDosha: boolean;
  score: number; // 0 = No, 50 = Low/Partial, 100 = High
  description: string;
  isCancelled: boolean;
  factors: {
    fromLagna: boolean;
    fromMoon: boolean;
    marsHouseLagna: number;
    marsHouseMoon: number;
  };
}

// Houses causing Mangal Dosha
const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

/**
 * Calculate Mangal Dosha for a single profile
 * 
 * @param marsLon Longitude of Mars
 * @param ascLon Longitude of Ascendant
 * @param moonLon Longitude of Moon
 */
export function calculateMangalDosha(
  marsLon: number, 
  ascLon: number, 
  moonLon: number
): MangalDoshaResult {
  // 1. Calculate Houses
  const marsHouseLagna = getHouseFromLongitude(marsLon, ascLon);
  const marsHouseMoon = getHouseFromLongitude(marsLon, moonLon);

  // 2. Check Dosha
  const fromLagna = DOSHA_HOUSES.includes(marsHouseLagna);
  const fromMoon = DOSHA_HOUSES.includes(marsHouseMoon);

  // 3. Determine basic presence
  let hasDosha = fromLagna || fromMoon;
  let score = 0;
  let description = "No Mangal Dosha present.";
  let isCancelled = false;

  if (hasDosha) {
    if (fromLagna && fromMoon) {
      score = 100;
      description = "High Mangal Dosha detected (Present from both Lagna and Moon).";
    } else {
      score = 50;
      description = `Partial Mangal Dosha detected (Present from ${  fromLagna ? "Lagna" : "Moon"  }).`;
    }

    // 4. Check Exceptions (Simple Rule set for MVP)
    // Mars in Aries (1) or Scorpio (8) in 1st house is not Dosha
    // Mars in Taurus (2) or Libra (7) in 4th/7th is exception
    // This requires Rashi (Sign) knowledge.
    
    // NOTE: Full exception logic is complex. For MVP we flag simple Cancellations.
    // E.g. Mars in own sign (Aries 1, Scorpio 8) or Exalted (Capricorn 10).
    const marsRashi = Math.floor(marsLon / 30) + 1;
    
    if ([1, 8, 10].includes(marsRashi)) {
      isCancelled = true;
      hasDosha = false;
      score = 0;
      description = "Mangal Dosha cancelled due to Mars being in Own Sign or Exalted.";
    }
  }

  return {
    hasDosha,
    score,
    description,
    isCancelled,
    factors: {
      fromLagna,
      fromMoon,
      marsHouseLagna,
      marsHouseMoon
    }
  };
}
