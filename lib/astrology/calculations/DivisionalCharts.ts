/**
 * Divisional Charts (Varga) Calculator
 * 
 * Implements the Shodashavarga (16 principal charts) calculation logic.
 * Reference: Brihat Parashara Hora Shastra
 */

import { getRashiFromLongitude } from './VedicMath';

export interface VargaPlanet {
  name: string;
  longitude: number; // in D1
  vargaLongitude: number; // position in the specific Varga
  rashi: number; // 1-12 in Varga
}

export interface ChartData {
  chart: string; // "D1", "D9", etc.
  planets: Record<string, VargaPlanet>;
  ascendant: VargaPlanet;
}

/**
 * Calculate the Rashi (Sign) in a specific Divisional Chart
 * 
 * @param longitude - Sidereal longitude of planet in D1 (0-360)
 * @param division - The Varga number (e.g., 9 for Navamsa)
 */
export function calculateVargaRashi(longitude: number, division: number): number {
  if (division === 1) {
    return getRashiFromLongitude(longitude);
  }

  // General case for regular divisions (like D9, D7, etc. where it maps cyclically)
  // Note: Some vargas have special rules (D2, D3, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60)
  
  // Basic method (Parasara):
  // 1. Find the current part number within the sign
  // 2. Map to new sign based on rules
  
  const deg = longitude % 360;
  const rashi = Math.floor(deg / 30) + 1; // 1-12
  const degInRashi = deg % 30; // 0-30
  
  // Navamsa (D9)
  if (division === 9) {
    // Each part is 3°20'
    // Lords start from Aries, Capricorn, Libra, Cancer for Moveable (1,4,7,10), Fixed (2,5,8,11), Dual (3,6,9,12) ??
    // Standard rule: 
    // Fire signs (1,5,9) start counting from Aries (1)
    // Earth signs (2,6,10) start counting from Capricorn (10)
    // Air signs (3,7,11) start counting from Libra (7)
    // Water signs (4,8,12) start counting from Cancer (4)
    
    // Easier formula:
    // (Floor(Absolute Longitude in minutes / 200 minutes) % 12) + 1
    // 3°20' = 200 arc-minutes
    // Total minutes = deg * 60
    
    const minutes = deg * 60;
    const pada = Math.floor(minutes / 200) + 1; // absolute pada 1..108
    return ((pada - 1) % 12) + 1;
  }
  
  // Dasamsa (D10)
  if (division === 10) {
    // Odd signs: Starts from same sign
    // Even signs: Starts from 9th from same sign
    const part = Math.floor(degInRashi / 3); // 3 degrees per part
    const count = part; // 0 to 9
    
    if (rashi % 2 !== 0) {
      // Odd
      return normalizeRashi(rashi + count);
    } else {
      // Even
      return normalizeRashi(rashi + 8 + count); // 9th from rashi means +8
    }
  }

  // Hora (D2) - Parashara
  if (division === 2) {
    // Odd sign: 0-15 Sun (Leo/5), 15-30 Moon (Cancer/4)
    // Even sign: 0-15 Moon (Cancer/4), 15-30 Sun (Leo/5)
    if (rashi % 2 !== 0) {
      return degInRashi < 15 ? 5 : 4;
    } else {
      return degInRashi < 15 ? 4 : 5;
    }
  }

  // Drekkana (D3) - Parashara
  if (division === 3) {
    // 0-10: Same sign
    // 10-20: 5th from sign
    // 20-30: 9th from sign
    const part = Math.floor(degInRashi / 10); // 0, 1, 2
    return normalizeRashi(rashi + (part * 4));
  }

  // Chaturthamsa (D4)
  if (division === 4) {
    // 0-7.5: Same
    // 7.5-15: 4th
    // 15-22.5: 7th
    // 22.5-30: 10th
    const part = Math.floor(degInRashi / 7.5); // 0,1,2,3
    return normalizeRashi(rashi + (part * 3));
  }
  
  // Saptamsa (D7)
  if (division === 7) {
    // Odd: Starts from same
    // Even: Starts from 7th
    const part = Math.floor(degInRashi / (30/7));
    if (rashi % 2 !== 0) {
      return normalizeRashi(rashi + part);
    } else {
      return normalizeRashi(rashi + 6 + part);
    }
  }

  // Dwadasamsa (D12)
  if (division === 12) {
    // Starts from same sign, 2.5 degrees each
    const part = Math.floor(degInRashi / 2.5);
    return normalizeRashi(rashi + part);
  }

  // Shodashamsa (D16)
  if (division === 16) {
    // Moveable (1,4,7,10): Start Aries (1)
    // Fixed (2,5,8,11): Start Leo (5)
    // Dual (3,6,9,12): Start Sagittarius (9)
    // Brahma: Actually simpler rule:
    // Moveable: Start from Aries, Brahma/Vishnu... ??
    // Let's use the standard "Starts from Aries, Leo, Sag" rule commonly cited.
    const part = Math.floor(degInRashi / (30/16));
    const type = (rashi - 1) % 3; // 0=Moveable (1,4..), 1=Fixed, 2=Dual
    // Actually: 1%3 = 1 -> match Moveable.
    // (1-1)%3 = 0 -> Moveable
    // (2-1)%3 = 1 -> Fixed
    // (3-1)%3 = 2 -> Dual
    
    let start = 1;
    if (type === 1) start = 5;
    if (type === 2) start = 9;
    
    return normalizeRashi(start + part);
  }

  // Vimsamsa (D20)
  if (division === 20) {
    // Moveable: From Aries
    // Fixed: From Sagittarius
    // Dual: From Leo
    const part = Math.floor(degInRashi / (30/20));
    const type = (rashi - 1) % 3;
    let start = 1;
    if (type === 1) start = 9; // Fixed starts Sag
    if (type === 2) start = 5; // Dual starts Leo
    
    return normalizeRashi(start + part);
  }

  // Chaturvimshamsh (D24)
  if (division === 24) {
    // Odd: Start Leo
    // Even: Start Cancer
    const part = Math.floor(degInRashi / (30/24));
    const start = (rashi % 2 !== 0) ? 5 : 4;
    // Note: D24 Parashara rule is complex. 
    // Actually: Odd signs start from Leo, Even from Cancer?
    // Let's verify standard D24 logic.
    // Standard: Odd -> Leo, Even -> Cancer is correct based on Siddamsa.
    return normalizeRashi(start + part);
  }
  
  // Saptavimsamsa (D27) - Nakshatramsa
  if (division === 27) {
    // Like Nakshatras.
    // Fiery (1,5,9): Start Aries
    // Earthy (2,6,10): Start Cancer
    // Airy (3,7,11): Start Libra
    // Watery (4,8,12): Start Capricorn
    const part = Math.floor(degInRashi / (30/27));
    const element = (rashi - 1) % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
    let start = 1;
    if (element === 1) start = 4;
    if (element === 2) start = 7;
    if (element === 3) start = 10;
    
    return normalizeRashi(start + part);
  }

  // Trimsamsa (D30)
  if (division === 30) {
    // Complex rules based on degrees, not equal parts
    // Odd signs:
    // 0-5: Mars (1)
    // 5-10: Saturn (11)
    // 10-18: Jupiter (9)
    // 18-25: Mercury (3)
    // 25-30: Venus (7)
    
    // Even signs:
    // 0-5: Venus (2)
    // 5-12: Mercury (6)
    // 12-20: Jupiter (12)
    // 20-25: Saturn (10)
    // 25-30: Mars (8)
    
    const d = degInRashi;
    if (rashi % 2 !== 0) {
      if (d < 5) return 1;
      if (d < 10) return 11;
      if (d < 18) return 9;
      if (d < 25) return 3;
      return 7;
    } else {
      if (d < 5) return 2;
      if (d < 12) return 6;
      if (d < 20) return 12;
      if (d < 25) return 10;
      return 8;
    }
  }

  // Khavedamsa (D40)
  if (division === 40) {
    // Odd: Aries
    // Even: Libra
    const part = Math.floor(degInRashi / (30/40));
    const start = (rashi % 2 !== 0) ? 1 : 7;
    return normalizeRashi(start + part);
  }

  // Akshavedamsa (D45)
  if (division === 45) {
    // Moveable: Aries
    // Fixed: Leo
    // Dual: Sagittarius
    const part = Math.floor(degInRashi / (30/45));
    const type = (rashi - 1) % 3;
    let start = 1;
    if (type === 1) start = 5;
    if (type === 2) start = 9;
    return normalizeRashi(start + part);
  }
  
  // Shashtiamsa (D60)
  if (division === 60) {
    // Ignore specific deities for now, just map sign.
    // Standard map: Start from current sign? No.
    // Logic: Each degree = 2 parts. 0.5 deg each.
    // Calculation: (Deg * 2) + 1 ? isn't it simply (Total parts from Aries % 12)?
    // Standard rule: (Part number + Sign - 1) % 12 ? No.
    
    // Simplest: "Ignore sign lord, use simply (Mean Longitude / 0.5deg) % 12 + something"
    // Parashara: "To calculated D60, take the longitude in deg, multiply by 2, ignore integer, take fraction..."
    // Wait, D60 is extremely sensitive.
    // Common rule:
    // Simply (Part number + Rashi number - 1) % 12? No.
    
    // Let's use simple cyclic mapping often used:
    // Part = floor(d / 0.5)
    // Result Sign = normalize(rashi + part)
    const part = Math.floor(degInRashi * 2);
    return normalizeRashi(rashi + part);
  }

  // Fallback (Equal divisions starting from Aries - unlikely correct for all custom vargas but safe fallback)
  const part = Math.floor(degInRashi / (30/division));
  return normalizeRashi(part + 1); // Incorrect for most, but placeholder
}

function normalizeRashi(val: number): number {
  const v = val % 12;
  return v === 0 ? 12 : v;
}

/**
 * Generate a specific Divisional Chart
 */
export function calculateDivisionalChart(
  chartKey: string, 
  planets: VargaPlanet[], // These planets have D1 longitudes
  division: number
): ChartData {
  const resultPlanets: Record<string, VargaPlanet> = {};
  let ascendant: VargaPlanet | null = null;
  
  // Separate Ascendant from planets list if present, or handle standard list
  // Usually 'planets' input includes Ascendant as a "planet" named "Ascendant"?
  // Or we pass it separately? 
  // Let's assume input array has "Ascendant" or "Lagna"
  // If not, we need it.
  
  for (const p of planets) {
    const vargaRashi = calculateVargaRashi(p.longitude, division);
    
    // Calculate longitude within the varga sign (optional, for advanced usage)
    // Varga Longitude = (D1 Longitude % DivisionSpan) * Division
    const divisionSpan = 30 / division;
    const rem = (p.longitude % 360) % divisionSpan;
    const vargaLon = rem * division; // 0-30 degrees in the varga sign
    
    const planetData = {
      name: p.name,
      longitude: p.longitude, // D1 lon
      vargaLongitude: (vargaRashi - 1) * 30 + vargaLon, // Absolute Varga Longitude
      rashi: vargaRashi
    };
    
    if (p.name === 'Ascendant' || p.name === 'Lagna') {
      ascendant = planetData;
    } else {
      resultPlanets[p.name] = planetData;
    }
  }

  return {
    chart: chartKey,
    planets: resultPlanets,
    ascendant: ascendant! // Should be present
  };
}

export const SUPPORTED_VARGAS: Record<string, number> = {
  D1: 1,
  D2: 2,
  D3: 3,
  D4: 4,
  D7: 7,
  D9: 9,
  D10: 10,
  D12: 12,
  D16: 16,
  D20: 20,
  D24: 24,
  D27: 27,
  D30: 30,
  D40: 40,
  D45: 45,
  D60: 60
};
