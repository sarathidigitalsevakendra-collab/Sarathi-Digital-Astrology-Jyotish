/**
 * Yoga Detector
 * 
 * TypeScript port of Python yogas.py for detecting planetary combinations.
 * Identifies special yogas in a birth chart according to Vedic astrology.
 */

import {
  RASHI_LORDS,
  KENDRAS,
  TRIKONAS,
  isExalted,
  isDebilitated,
  getRashiLord,
  getSignName,
} from "./VedicMath";
import type { Yoga, YogaSummary } from "@/types/astrology/birthChart.types";

export interface PlanetData {
  longitude: number;
  rashi: number;
  house: number;
  isExalted?: boolean;
  isDebilitated?: boolean;
}

export interface YogaDetectionResult {
  yogas: Yoga[];
  categories: Record<string, Yoga[]>;
  summary: YogaSummary;
}

/**
 * Detect Raja Yogas (combinations for power and authority)
 */
function detectRajaYogas(
  planets: Map<string, PlanetData>,
  ascRashi: number
): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Get lords of kendras and trikonas
  const kendraLords = new Set<string>();
  const trikonaLords = new Set<string>();
  
  for (const house of KENDRAS) {
    const rashi = ((ascRashi - 1 + house - 1) % 12) + 1;
    const lord = RASHI_LORDS[rashi];
    if (lord) kendraLords.add(lord);
  }
  
  for (const house of TRIKONAS) {
    const rashi = ((ascRashi - 1 + house - 1) % 12) + 1;
    const lord = RASHI_LORDS[rashi];
    if (lord) trikonaLords.add(lord);
  }
  
  // Raja Yoga: Kendra lord + Trikona lord conjunction
  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl === tl) continue;
      
      const klData = planets.get(kl);
      const tlData = planets.get(tl);
      
      if (!klData || !tlData) continue;
      
      // Check conjunction (same sign)
      if (klData.rashi === tlData.rashi) {
        yogas.push({
          name: `${kl}-${tl} Raja Yoga`,
          type: "raja",
          planets: [kl, tl],
          description: `${kl} (Kendra lord) and ${tl} (Trikona lord) are conjunct in ${getSignName(klData.rashi)}`,
          effect: "Grants power, authority, and success in career. Native may achieve high position.",
          strength: "strong",
        });
      }
    }
  }
  
  return yogas;
}

/**
 * Detect Dhana Yogas (combinations for wealth)
 */
function detectDhanaYogas(
  planets: Map<string, PlanetData>,
  ascRashi: number
): Yoga[] {
  const yogas: Yoga[] = [];
  
  // 2nd house lord and 11th house lord conjunction = Dhana Yoga
  const secondHouseRashi = ((ascRashi - 1 + 1) % 12) + 1;
  const eleventhHouseRashi = ((ascRashi - 1 + 10) % 12) + 1;
  
  const secondLord = RASHI_LORDS[secondHouseRashi];
  const eleventhLord = RASHI_LORDS[eleventhHouseRashi];
  
  if (secondLord && eleventhLord && secondLord !== eleventhLord) {
    const secondData = planets.get(secondLord);
    const eleventhData = planets.get(eleventhLord);
    
    if (secondData && eleventhData && secondData.rashi === eleventhData.rashi) {
      yogas.push({
        name: "Dhana Yoga (2-11 Lords)",
        type: "dhana",
        planets: [secondLord, eleventhLord],
        description: `${secondLord} (2nd lord) and ${eleventhLord} (11th lord) are conjunct`,
        effect: "Indicates accumulation of wealth and financial gains through multiple sources.",
        strength: "strong",
      });
    }
  }
  
  // Jupiter in 2nd or 11th house
  const jupiter = planets.get("Jupiter");
  if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) {
    yogas.push({
      name: "Jupiter Dhana Yoga",
      type: "dhana",
      planets: ["Jupiter"],
      description: `Jupiter is placed in the ${jupiter.house === 2 ? "2nd" : "11th"} house`,
      effect: "Jupiter's placement indicates prosperity and financial wisdom.",
      strength: "moderate",
    });
  }
  
  return yogas;
}

/**
 * Detect Pancha Mahapurusha Yogas (5 great person yogas)
 */
function detectMahapurushaYogas(
  planets: Map<string, PlanetData>
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const mahapurushaConfig: Record<string, { name: string; effect: string }> = {
    Mars: {
      name: "Ruchaka Yoga",
      effect: "Courageous, commanding personality. Success in military, sports, or leadership roles.",
    },
    Mercury: {
      name: "Bhadra Yoga",
      effect: "Intelligent, eloquent, skilled in business and communication.",
    },
    Jupiter: {
      name: "Hamsa Yoga",
      effect: "Wise, virtuous, spiritually inclined. Respected by society.",
    },
    Venus: {
      name: "Malavya Yoga",
      effect: "Artistic, luxurious lifestyle, attractive personality, relationship success.",
    },
    Saturn: {
      name: "Shasha Yoga",
      effect: "Hardworking, disciplined, achieves success through perseverance.",
    },
  };
  
  for (const [planet, config] of Object.entries(mahapurushaConfig)) {
    const planetData = planets.get(planet);
    if (!planetData) continue;
    
    const house = planetData.house;
    const rashi = planetData.rashi;
    
    // Mahapurusha Yoga: Planet in own sign or exalted, and in Kendra
    const isInOwnSign = getRashiLord(rashi) === planet;
    const isExaltedSign = isExalted(planet, rashi);
    const isInKendra = KENDRAS.includes(house);
    
    if ((isInOwnSign || isExaltedSign) && isInKendra) {
      yogas.push({
        name: config.name,
        type: "mahapurusha",
        planets: [planet],
        description: `${planet} is ${isExaltedSign ? "exalted" : "in own sign"} in ${getSignName(rashi)} and placed in Kendra (house ${house})`,
        effect: config.effect,
        strength: isExaltedSign ? "very strong" : "strong",
      });
    }
  }
  
  return yogas;
}

/**
 * Detect Gaja Kesari Yoga (Jupiter-Moon combination)
 */
function detectGajaKesariYoga(
  planets: Map<string, PlanetData>
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const jupiter = planets.get("Jupiter");
  const moon = planets.get("Moon");
  
  if (!jupiter || !moon) return yogas;
  
  // Gaja Kesari: Jupiter in Kendra from Moon
  const moonHouse = moon.house;
  const jupiterHouse = jupiter.house;
  const houseFromMoon = ((jupiterHouse - moonHouse + 12) % 12) + 1;
  
  if (KENDRAS.includes(houseFromMoon)) {
    yogas.push({
      name: "Gaja Kesari Yoga",
      type: "prosperity",
      planets: ["Jupiter", "Moon"],
      description: `Jupiter is in Kendra (${houseFromMoon}th house) from Moon`,
      effect: "Indicates fame, intelligence, and lasting reputation. Native is respected and prosperous.",
      strength: jupiter.isExalted ? "very strong" : "strong",
    });
  }
  
  return yogas;
}

/**
 * Detect Neecha Bhanga Raja Yoga (cancellation of debilitation)
 */
function detectNeechaBhangaYoga(
  planets: Map<string, PlanetData>
): Yoga[] {
  const yogas: Yoga[] = [];
  
  for (const [planetName, planetData] of planets.entries()) {
    if (!isDebilitated(planetName, planetData.rashi)) continue;
    
    // Check if the lord of debilitation sign is in Kendra
    const debSignLord = getRashiLord(planetData.rashi);
    const lordData = planets.get(debSignLord);
    
    if (lordData && KENDRAS.includes(lordData.house)) {
      yogas.push({
        name: `Neecha Bhanga (${planetName})`,
        type: "raja",
        planets: [planetName, debSignLord],
        description: `${planetName} is debilitated but ${debSignLord} (sign lord) is in Kendra`,
        effect: "Debilitation is cancelled, turning weakness into strength. Native overcomes obstacles.",
        strength: "moderate",
      });
    }
  }
  
  return yogas;
}

/**
 * Main function to detect all yogas in a chart
 */
export function detectYogas(
  planets: Map<string, PlanetData>,
  ascendantRashi: number
): YogaDetectionResult {
  const allYogas: Yoga[] = [];
  
  // Detect various yoga types
  allYogas.push(...detectRajaYogas(planets, ascendantRashi));
  allYogas.push(...detectDhanaYogas(planets, ascendantRashi));
  allYogas.push(...detectMahapurushaYogas(planets));
  allYogas.push(...detectGajaKesariYoga(planets));
  allYogas.push(...detectNeechaBhangaYoga(planets));
  
  // Categorize yogas
  const categories: Record<string, Yoga[]> = {};
  for (const yoga of allYogas) {
    const category = categories[yoga.type];
    if (!category) {
      categories[yoga.type] = [yoga];
    } else {
      category.push(yoga);
    }
  }
  
  // Build summary
  const strengthCounts = { "very strong": 0, strong: 0, moderate: 0, weak: 0 };
  for (const yoga of allYogas) {
    strengthCounts[yoga.strength]++;
  }
  
  const summary: YogaSummary = {
    total_yogas: allYogas.length,
    by_strength: strengthCounts,
    has_mahapurusha: (categories["mahapurusha"]?.length ?? 0) > 0,
    has_raja_yoga: (categories["raja"]?.length ?? 0) > 0,
    has_dhana_yoga: (categories["dhana"]?.length ?? 0) > 0,
  };
  
  return {
    yogas: allYogas,
    categories,
    summary,
  };
}

/**
 * Build planet data from birth chart response
 * Returns a Map instead of Record for security (prevents prototype pollution)
 */
export function buildPlanetDataFromChart(
  planets: Array<{ name: string; fullDegree: number; house?: number }>,
  ascendant: number
): Map<string, PlanetData> {
  const result = new Map<string, PlanetData>();
  
  for (const planet of planets) {
    const rashi = Math.floor(planet.fullDegree / 30) + 1;
    // Use Whole Sign system (Rashi = House) for Yoga detection
    // This aligns better with standard Parashari yoga definitions
    const house = ((rashi - Math.floor(ascendant / 30) - 1 + 12) % 12) + 1;
    
    // Security check for prototype pollution (redundant with Map but good practice)
    if (planet.name === "__proto__" || planet.name === "constructor" || planet.name === "prototype") {
      continue;
    }

    result.set(planet.name, {
      longitude: planet.fullDegree,
      rashi,
      house,
      isExalted: isExalted(planet.name, rashi),
      isDebilitated: isDebilitated(planet.name, rashi),
    });
  }
  
  return result;
}
