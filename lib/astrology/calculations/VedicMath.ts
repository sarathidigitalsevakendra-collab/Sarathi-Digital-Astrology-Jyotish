/**
 * Vedic Math Utilities
 * 
 * Common utility functions for Vedic astrology calculations.
 */

// Rashi lords mapping (1-12)
export const RASHI_LORDS: Record<number, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
  5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
  9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// Exaltation signs
export const EXALTATION: Record<string, number> = {
  Sun: 1, Moon: 2, Mars: 10, Mercury: 6,
  Jupiter: 4, Venus: 12, Saturn: 7
};

// Debilitation signs
export const DEBILITATION: Record<string, number> = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12,
  Jupiter: 10, Venus: 6, Saturn: 1
};

// Kendra houses (angular)
export const KENDRAS = [1, 4, 7, 10];

// Trikona houses (trinal)
export const TRIKONAS = [1, 5, 9];

// Dusthanas (malefic houses)
export const DUSTHANAS = [6, 8, 12];

// Natural benefics and malefics
export const BENEFICS = ["Jupiter", "Venus", "Moon", "Mercury"];
export const MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

// Sign names
export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Get rashi number (1-12) from longitude
 */
export function getRashiFromLongitude(longitude: number): number {
  return Math.floor(longitude / 30) + 1;
}

/**
 * Get sign name from rashi number
 */
export function getSignName(rashi: number): string {
  return SIGN_NAMES[(rashi - 1) % 12] ?? "Unknown";
}

/**
 * Get house number (1-12) from planet and ascendant longitude
 */
// Use Whole Sign system (Rashi based)
export function getHouseFromLongitude(planetLon: number, ascLon: number): number {
  const planetRashi = Math.floor(planetLon / 30) + 1;
  const ascRashi = Math.floor(ascLon / 30) + 1;
  return ((planetRashi - ascRashi + 12) % 12) + 1;
}

/**
 * Check if planet is in exaltation sign
 */
export function isExalted(planet: string, rashi: number): boolean {
  return EXALTATION[planet] === rashi;
}

/**
 * Check if planet is in debilitation sign
 */
export function isDebilitated(planet: string, rashi: number): boolean {
  return DEBILITATION[planet] === rashi;
}

/**
 * Get lord of a rashi
 */
export function getRashiLord(rashi: number): string {
  return RASHI_LORDS[((rashi - 1) % 12) + 1] ?? "Unknown";
}

/**
 * Check if a house is a kendra
 */
export function isKendra(house: number): boolean {
  return KENDRAS.includes(house);
}

/**
 * Check if a house is a trikona
 */
export function isTrikona(house: number): boolean {
  return TRIKONAS.includes(house);
}

/**
 * Get approximate Lahiri ayanamsha for a given year
 */
export function getLahiriAyanamsha(year: number): number {
  // Lahiri ayanamsha at J2000 (Jan 1, 2000, 12:00 TT) is approx 23° 51' 12"
  // Rate is approx 50.27 arc-seconds per year
  const baseYear = 2000;
  const baseValue = 23.8533; // 23 + 51/60 + 12/3600
  const yearlyRate = 50.27 / 3600; // Convert arc-seconds to degrees
  
  return baseValue + (year - baseYear) * yearlyRate;
}

// Alias for compatibility
export const getAyanamsha = getLahiriAyanamsha;

/**
 * Convert radians to degrees
 */
export function toDeg(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Convert degrees to radians
 */
export function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Normalize degree to 0-360 range
 */
export function normalizeDegree(deg: number): number {
  return (deg % 360 + 360) % 360;
}
