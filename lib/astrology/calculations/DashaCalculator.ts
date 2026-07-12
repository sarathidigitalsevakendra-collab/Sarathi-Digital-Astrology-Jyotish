/**
 * Vimsottari Dasha Calculator
 * 
 * TypeScript port of Python dasha.py for fully self-hosted calculations.
 * Calculates Hindu astrological planetary periods based on Moon's nakshatra at birth.
 */

// Dasha periods in years
export const DASHA_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

// Total cycle length
const TOTAL_DASHA_YEARS = 120;

// Dasha sequence
export const DASHA_SEQUENCE: readonly string[] = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

// Import nakshatra data from unified config (single source of truth)
import { NAKSHATRA_LORDS, NAKSHATRA_NAMES } from './NakshatraConfig';

// Re-export for backward compatibility
export { NAKSHATRA_LORDS, NAKSHATRA_NAMES };

export interface Antardasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_current: boolean;
}

export interface Mahadasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  antardashas: Antardasha[];
}

export interface DashaResult {
  birthNakshatra: string;
  nakshatraLord: string;
  moonLongitude: number;
  currentMahadasha: string | null;
  currentAntardasha: string | null;
  mahadashas: Mahadasha[];
  ayanamsha: string;
  ayanamshaValue: number;
  source: string;
}

/**
 * Check if current date falls within a period
 */
function isCurrentPeriod(start: Date, end: Date): boolean {
  const now = new Date();
  return start <= now && now <= end;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}

/**
 * Calculate Antardasha periods within a Mahadasha
 */
function calculateAntardashas(
  mahadashaLord: string,
  mahaStart: Date,
  mahaEnd: Date
): Antardasha[] {
  const antardashas: Antardasha[] = [];
  const mahaDurationDays = (mahaEnd.getTime() - mahaStart.getTime()) / (1000 * 60 * 60 * 24);
  
  // Start sequence from Mahadasha lord
  const startIndex = DASHA_SEQUENCE.indexOf(mahadashaLord);
  let currentDate = new Date(mahaStart);
  
  for (let i = 0; i < 9; i++) {
    const antarIndex = (startIndex + i) % 9;
    const antarLord = DASHA_SEQUENCE[antarIndex] ?? "Ketu";
    
    // Antardasha proportion
    const antarProportion = (DASHA_YEARS[antarLord] ?? 7) / TOTAL_DASHA_YEARS;
    const antarDays = mahaDurationDays * antarProportion;
    
    const endDate = addDays(currentDate, antarDays);
    
    antardashas.push({
      planet: antarLord ?? "",
      start_date: formatDate(currentDate),
      end_date: formatDate(endDate),
      duration_days: Math.round(antarDays),
      is_current: isCurrentPeriod(currentDate, endDate),
    });
    
    currentDate = endDate;
  }
  
  return antardashas;
}

/**
 * Calculate Vimsottari Dasha periods from Moon's longitude
 */
export function calculateVimsottariDasha(
  moonLongitude: number,
  birthDate: Date,
  yearsToCalculate: number = 100
): DashaResult {
  // Calculate nakshatra (each spans 13°20' = 13.3333°)
  const nakshatraSpan = 360 / 27;
  const nakshatraNum = Math.floor(moonLongitude / nakshatraSpan);
  const nakshatraName = NAKSHATRA_NAMES[nakshatraNum] ?? "Unknown";
  
  // Position within nakshatra (0 to 1)
  const progressInNakshatra = (moonLongitude % nakshatraSpan) / nakshatraSpan;
  
  // Get the ruling planet of this nakshatra
  const firstDashaLord = NAKSHATRA_LORDS[nakshatraNum] ?? "Ketu";
  const firstDashaYears = DASHA_YEARS[firstDashaLord] ?? 7;
  
  // Calculate elapsed portion of first Mahadasha
  const elapsedYears = progressInNakshatra * firstDashaYears;
  const remainingYears = firstDashaYears - elapsedYears;
  
  // Build Mahadasha periods
  const mahadashas: Mahadasha[] = [];
  let currentDate = new Date(birthDate);
  
  // Find index of first dasha lord in sequence
  let dashaIndex = DASHA_SEQUENCE.indexOf(firstDashaLord);
  
  // First Mahadasha (partial)
  const firstEndDate = addDays(currentDate, remainingYears * 365.25);
  mahadashas.push({
    planet: firstDashaLord,
    start_date: formatDate(currentDate),
    end_date: formatDate(firstEndDate),
    duration_years: Math.round(remainingYears * 100) / 100,
    is_current: isCurrentPeriod(currentDate, firstEndDate),
    antardashas: calculateAntardashas(firstDashaLord, currentDate, firstEndDate),
  });
  
  currentDate = firstEndDate;
  let yearsCalculated = remainingYears;
  
  // Subsequent Mahadashas
  while (yearsCalculated < yearsToCalculate) {
    dashaIndex = (dashaIndex + 1) % 9;
    const dashaLord = DASHA_SEQUENCE[dashaIndex] ?? "Ketu";
    const dashaYears = DASHA_YEARS[dashaLord] ?? 7;
    
    const endDate = addDays(currentDate, dashaYears * 365.25);
    
    mahadashas.push({
      planet: dashaLord,
      start_date: formatDate(currentDate),
      end_date: formatDate(endDate),
      duration_years: dashaYears,
      is_current: isCurrentPeriod(currentDate, endDate),
      antardashas: calculateAntardashas(dashaLord, currentDate, endDate),
    });
    
    currentDate = endDate;
    yearsCalculated += dashaYears;
  }
  
  // Find current Mahadasha and Antardasha
  let currentMaha: string | null = null;
  let currentAntar: string | null = null;
  
  for (const maha of mahadashas) {
    if (maha.is_current) {
      currentMaha = maha.planet;
      for (const antar of maha.antardashas) {
        if (antar.is_current) {
          currentAntar = antar.planet;
          break;
        }
      }
      break;
    }
  }
  
  return {
    birthNakshatra: nakshatraName,
    nakshatraLord: firstDashaLord,
    moonLongitude: Math.round(moonLongitude * 10000) / 10000,
    currentMahadasha: currentMaha,
    currentAntardasha: currentAntar,
    mahadashas,
    ayanamsha: "lahiri",
    ayanamshaValue: 24.0, // Approximate Lahiri ayanamsha for modern dates
    source: "internal_ts",
  };
}

/**
 * Get approximate Moon longitude from birth date (simplified)
 * Note: For accurate calculation, use ephemeris data
 */
export function getApproximateMoonLongitude(birthDate: Date): number {
  // Moon completes a full cycle in ~27.3 days
  const moonCycleDays = 27.321582;
  const referenceDate = new Date("2000-01-01T00:00:00Z");
  const referenceMoonLon = 121.0; // Approximate Moon longitude on Jan 1, 2000
  
  const daysSinceRef = (birthDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  const cycles = daysSinceRef / moonCycleDays;
  const moonLon = (referenceMoonLon + cycles * 360) % 360;
  
  return moonLon;
}
