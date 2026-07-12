/**
 * Chart Context Builder
 *
 * Orchestrates all existing calculation modules to build a structured
 * astrological context object. This is injected into AI prompts so the LLM
 * receives pre-computed house lordships, Dasha state, yogas, doshas, and
 * transits — instead of having to infer them from raw degree numbers
 * (which it often gets wrong).
 *
 * This module does NOT introduce any new calculation logic. It purely
 * orchestrates existing functions from the /lib/astrology/calculations/ folder.
 */

import {
  calculateFunctionalNature,
  calculateDignity,
  calculateStrengthScore,
  type FunctionalNature,
  type DignityLevel,
} from "@/lib/astrology/calculations/Dignity";
import {
  RASHI_LORDS,
  getHouseFromLongitude,
  getRashiFromLongitude,
  getSignName,
} from "@/lib/astrology/calculations/VedicMath";
import {
  calculateVimsottariDasha,
  type Mahadasha,
} from "@/lib/astrology/calculations/DashaCalculator";
import {
  detectYogas,
  buildPlanetDataFromChart,
} from "@/lib/astrology/calculations/YogaDetector";
import {
  generateDoshaAnalysisReport,
} from "@/lib/astrology/calculations/DoshaAnalysis";
import {
  calculateTransits,
  type TransitAspect,
} from "@/lib/astrology/calculations/Transits";
import {
  generateSadeSatiReport,
} from "@/lib/astrology/calculations/SadeSati";
import type { Yoga } from "@/types/astrology/birthChart.types";

// ─── Input / Output Types ──────────────────────────────────────────────────────

/** Minimal planet shape expected from the chart API */
export interface ChartPlanet {
  name: string;
  fullDegree: number;
  normDegree?: number;
  sign?: string;
  house?: number;
  isRetro?: boolean | string;
  nakshatra?: string;
  nakshatraLord?: string;
  signLord?: string;
}

export interface ChartContextInput {
  ascendant: number;         // Ascendant longitude in degrees
  planets: ChartPlanet[];
  birthDate?: string;        // ISO 8601 date string
  birthTime?: string;        // HH:MM format
  birthTimeKnown?: boolean;  // false = Surya Kundli (noon default)
}

// ─── Enriched Context (what the AI receives) ────────────────────────────────

export interface PlanetContext {
  planet: string;
  sign: string;
  signNumber: number;
  house: number;
  functionalNature: FunctionalNature;
  dignity: DignityLevel;
  strengthScore: number;
  isRetro: boolean;
  housesRuled: number[];
  signification: string;
}

export interface DashaContext {
  mahadasha: string;
  antardasha: string;
  mahadashaStart: string;
  mahadashaEnd: string;
  antardashaEnd: string;
  remainingYears: number;
  birthNakshatra: string;
}

export interface DoshaContext {
  kaalSarpPresent: boolean;
  kaalSarpType: string;
  kaalSarpSeverity: string;
  manglikPresent: boolean;
  manglikSeverity: string;
  manglikCancelled: boolean;
  overallDosha: string;
}

export interface SadeSatiContext {
  isActive: boolean;
  phase: string;
  intensity: string;
  moonSign: string;
  saturnSign: string;
}

export interface TransitHighlight {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  nature: string;
  significance: string;
  effect: string;
}

export interface EnrichedChartContext {
  ascendantSign: string;
  ascendantSignNumber: number;
  ascendantLord: string;
  birthTimeKnown: boolean;
  planetContexts: PlanetContext[];
  dasha: DashaContext | null;
  yogas: Yoga[];
  doshas: DoshaContext;
  sadeSati: SadeSatiContext;
  topTransits: TransitHighlight[];
}

// ─── House Signification Data ───────────────────────────────────────────────

const HOUSE_SIGNIFICATIONS: Record<number, string> = {
  1: "self, personality, health, vitality",
  2: "wealth, family, speech, food",
  3: "siblings, courage, communication, short journeys",
  4: "home, mother, comfort, vehicles, property",
  5: "children, creativity, education, romance, luck",
  6: "enemies, debts, disease, service, daily work",
  7: "marriage, partnerships, business, public dealing",
  8: "longevity, inheritance, hidden matters, transformation",
  9: "fortune, father, higher learning, dharma, long journeys",
  10: "career, authority, status, government",
  11: "gains, income, elder siblings, desires, social network",
  12: "expenses, losses, foreign land, moksha, spirituality",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Proper English ordinal suffix (1st, 2nd, 3rd, 4th, 11th, 12th, 21st...) */
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"] as const;
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? "th");
}

// ─── Own Sign lookup for house lordship calculation ─────────────────────────

const OWN_SIGNS: Record<string, number[]> = {
  Sun: [5],
  Moon: [4],
  Mars: [1, 8],
  Mercury: [3, 6],
  Jupiter: [9, 12],
  Venus: [2, 7],
  Saturn: [10, 11],
  Rahu: [],
  Ketu: [],
};

// ─── Main Builder Function ──────────────────────────────────────────────────

/**
 * Build an enriched astrological context from raw chart data.
 *
 * This function runs all calculation modules and assembles the results
 * into a structured object suitable for AI prompt injection.
 */
export function buildEnrichedChartContext(input: ChartContextInput): EnrichedChartContext {
  const { ascendant, planets, birthDate, birthTime, birthTimeKnown = true } = input;

  // 1. Ascendant info
  const ascSignNum = getRashiFromLongitude(ascendant);
  const ascSign = getSignName(ascSignNum);
  const ascLord = RASHI_LORDS[ascSignNum] ?? "Sun";

  // 2. Planet dignities & house lordships
  const planetContexts = buildPlanetContexts(planets, ascendant, ascSignNum);

  // 3. Dasha (requires Moon longitude + birth date)
  const dasha = buildDashaContext(planets, birthDate, birthTime);

  // 4. Yogas
  const yogas = buildYogaContext(planets, ascendant);

  // 5. Doshas
  const doshas = buildDoshaContext(planets, ascendant);

  // 6. Sade Sati
  const sadeSati = buildSadeSatiContext(planets);

  // 7. Current Transits (top 5)
  const topTransits = buildTransitContext(planets);

  return {
    ascendantSign: ascSign,
    ascendantSignNumber: ascSignNum,
    ascendantLord: ascLord,
    birthTimeKnown,
    planetContexts,
    dasha,
    yogas,
    doshas,
    sadeSati,
    topTransits,
  };
}

// ─── Sub-Builders ───────────────────────────────────────────────────────────

function buildPlanetContexts(
  planets: ChartPlanet[],
  ascendant: number,
  ascSignNum: number,
): PlanetContext[] {
  return planets.map((planet) => {
    const signNum = getRashiFromLongitude(planet.fullDegree);
    const sign = getSignName(signNum);
    const house = getHouseFromLongitude(planet.fullDegree, ascendant);
    const hostPlanet = RASHI_LORDS[signNum] ?? "Sun";
    const dignity = calculateDignity(planet.name, signNum, planet.fullDegree % 30, hostPlanet);
    const functionalNature = calculateFunctionalNature(planet.name, ascSignNum);
    const isRetro = planet.isRetro === true || planet.isRetro === "true";
    const strengthScore = calculateStrengthScore(dignity, isRetro);

    // Compute which houses this planet rules relative to this ascendant
    const ownSigns = OWN_SIGNS[planet.name] ?? [];
    const housesRuled = ownSigns.map((s) => {
      let h = s - ascSignNum + 1;
      if (h <= 0) h += 12;
      return h;
    });

    // Build human-readable signification
    const houseSignifications = housesRuled
      .map((h) => `${ordinal(h)} house (${HOUSE_SIGNIFICATIONS[h] ?? "general"})`)
      .join(" and ");
    const signification = housesRuled.length > 0
      ? `${planet.name} rules your ${houseSignifications}`
      : `${planet.name} (shadow planet)`;

    return {
      planet: planet.name,
      sign,
      signNumber: signNum,
      house,
      functionalNature,
      dignity,
      strengthScore,
      isRetro,
      housesRuled,
      signification,
    };
  });
}

function buildDashaContext(
  planets: ChartPlanet[],
  birthDate?: string,
  birthTime?: string,
): DashaContext | null {
  const moon = planets.find((p) => p.name === "Moon");
  if (!moon || !birthDate) return null;

  try {
    const dateStr = birthTime ? `${birthDate}T${birthTime}:00` : `${birthDate}T12:00:00`;
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return null;

    const dashaResult = calculateVimsottariDasha(moon.fullDegree, birth);

    const currentMaha = dashaResult.mahadashas.find((m: Mahadasha) => m.is_current);
    const currentAntar = currentMaha?.antardashas.find((a) => a.is_current);

    if (!currentMaha) return null;

    const mahaEnd = new Date(currentMaha.end_date);
    const now = new Date();
    const remainingYears = Math.max(0, (mahaEnd.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return {
      mahadasha: currentMaha.planet,
      antardasha: currentAntar?.planet ?? "Unknown",
      mahadashaStart: currentMaha.start_date,
      mahadashaEnd: currentMaha.end_date,
      antardashaEnd: currentAntar?.end_date ?? "",
      remainingYears: Math.round(remainingYears * 10) / 10,
      birthNakshatra: dashaResult.birthNakshatra,
    };
  } catch {
    return null;
  }
}

function buildYogaContext(planets: ChartPlanet[], ascendant: number): Yoga[] {
  try {
    const planetMap = buildPlanetDataFromChart(
      planets.map((p) => ({
        name: p.name,
        fullDegree: p.fullDegree,
        house: p.house,
      })),
      ascendant,
    );
    const ascRashi = getRashiFromLongitude(ascendant);
    const result = detectYogas(planetMap, ascRashi);
    return result.yogas;
  } catch {
    return [];
  }
}

function buildDoshaContext(planets: ChartPlanet[], ascendant: number): DoshaContext {
  try {
    const longitudes: Record<string, number> = { Ascendant: ascendant };
    for (const p of planets) {
      longitudes[p.name] = p.fullDegree;
    }
    const report = generateDoshaAnalysisReport(longitudes);
    return {
      kaalSarpPresent: report.kaalSarp.hasKaalSarp,
      kaalSarpType: report.kaalSarp.type,
      kaalSarpSeverity: report.kaalSarp.severity,
      manglikPresent: report.manglik.hasDosha,
      manglikSeverity: report.manglik.severity,
      manglikCancelled: report.manglik.isCancelled,
      overallDosha: report.overallDosha,
    };
  } catch {
    return {
      kaalSarpPresent: false,
      kaalSarpType: "None",
      kaalSarpSeverity: "None",
      manglikPresent: false,
      manglikSeverity: "None",
      manglikCancelled: false,
      overallDosha: "None",
    };
  }
}

function buildSadeSatiContext(planets: ChartPlanet[]): SadeSatiContext {
  try {
    const moon = planets.find((p) => p.name === "Moon");
    if (!moon) {
      return { isActive: false, phase: "None", intensity: "None", moonSign: "Unknown", saturnSign: "Unknown" };
    }
    const moonSignNum = getRashiFromLongitude(moon.fullDegree);
    const report = generateSadeSatiReport(moonSignNum);
    return {
      isActive: report.isInSadeSati || report.isDhaiya,
      phase: report.sadeSatiPhase !== "None" ? `Sade Sati ${report.sadeSatiPhase}` : report.dhaiyaPhase,
      intensity: report.intensity,
      moonSign: report.natalMoonSign,
      saturnSign: report.currentSaturnSign,
    };
  } catch {
    return { isActive: false, phase: "None", intensity: "None", moonSign: "Unknown", saturnSign: "Unknown" };
  }
}

function buildTransitContext(planets: ChartPlanet[]): TransitHighlight[] {
  try {
    const planetMap = buildPlanetDataFromChart(
      planets.map((p) => ({
        name: p.name,
        fullDegree: p.fullDegree,
        house: p.house,
      })),
      0, // ascendant not needed for transit calculation
    );
    const result = calculateTransits(planetMap);
    return result.activeTransits
      .filter((t: TransitAspect) => t.significance === "critical" || t.significance === "major")
      .slice(0, 5)
      .map((t: TransitAspect) => ({
        transitPlanet: t.transitPlanet,
        natalPlanet: t.natalPlanet,
        aspect: t.aspect,
        nature: t.nature,
        significance: t.significance,
        effect: t.effect,
      }));
  } catch {
    return [];
  }
}

// ─── Prompt Serializer ──────────────────────────────────────────────────────

/**
 * Serialize the enriched context into a markdown string suitable
 * for injection into an LLM prompt.
 */
export function serializeContextForPrompt(ctx: EnrichedChartContext): string {
  const lines: string[] = [];

  // Birth time caveat (when user doesn't know their exact birth time)
  if (!ctx.birthTimeKnown) {
    lines.push(`> ⚠️ **BIRTH TIME UNKNOWN** (noon default / Surya Kundli mode).`);
    lines.push(`> House placements and Ascendant are APPROXIMATE. Focus your analysis on`);
    lines.push(`> planet signs, Nakshatras, Yogas, Dasha periods, and Doshas rather than`);
    lines.push(`> house-specific predictions (e.g., do not emphasize "7th house lord" for marriage).`);
    lines.push("");
  }

  // Ascendant
  lines.push(`## Ascendant (Lagna)${!ctx.birthTimeKnown ? " ⚠️ approximate" : ""}`);
  lines.push(`- Sign: ${ctx.ascendantSign} (${ordinal(ctx.ascendantSignNumber)} sign)`);
  lines.push(`- Lord: ${ctx.ascendantLord}`);
  lines.push("");

  // Planetary Positions with House Lordships
  lines.push(`## Planetary Positions & House Lordships`);
  for (const p of ctx.planetContexts) {
    const retro = p.isRetro ? " (Retrograde)" : "";
    lines.push(`### ${p.planet} — ${p.sign}, House ${p.house}${retro}`);
    lines.push(`- Functional Nature: ${p.functionalNature}`);
    lines.push(`- Dignity: ${p.dignity} (Strength: ${p.strengthScore}%)`);
    lines.push(`- ${p.signification}`);
    lines.push("");
  }

  // Dasha
  if (ctx.dasha) {
    lines.push(`## Current Dasha Period`);
    lines.push(`- **Mahadasha**: ${ctx.dasha.mahadasha} (${ctx.dasha.mahadashaStart} to ${ctx.dasha.mahadashaEnd})`);
    lines.push(`- **Antardasha**: ${ctx.dasha.antardasha} (ending ${ctx.dasha.antardashaEnd})`);
    lines.push(`- **Remaining in Mahadasha**: ~${ctx.dasha.remainingYears} years`);
    lines.push(`- **Birth Nakshatra**: ${ctx.dasha.birthNakshatra}`);
    lines.push("");
  }

  // Yogas
  if (ctx.yogas.length > 0) {
    lines.push(`## Detected Yogas (${ctx.yogas.length})`);
    for (const y of ctx.yogas) {
      lines.push(`- **${y.name}** (${y.type}, ${y.strength}): ${y.description}`);
    }
    lines.push("");
  }

  // Doshas
  lines.push(`## Dosha Status`);
  lines.push(`- Overall: ${ctx.doshas.overallDosha}`);
  if (ctx.doshas.kaalSarpPresent) {
    lines.push(`- Kaal Sarp: ${ctx.doshas.kaalSarpType} type, Severity: ${ctx.doshas.kaalSarpSeverity}`);
  }
  if (ctx.doshas.manglikPresent) {
    lines.push(`- Manglik: ${ctx.doshas.manglikSeverity} severity${ctx.doshas.manglikCancelled ? " (CANCELLED)" : ""}`);
  }
  lines.push("");

  // Sade Sati
  lines.push(`## Sade Sati / Saturn Transit`);
  if (ctx.sadeSati.isActive) {
    lines.push(`- **ACTIVE**: ${ctx.sadeSati.phase} (Intensity: ${ctx.sadeSati.intensity})`);
  } else {
    lines.push(`- Not active. Moon sign: ${ctx.sadeSati.moonSign}, Saturn in: ${ctx.sadeSati.saturnSign}`);
  }
  lines.push("");

  // Transits
  if (ctx.topTransits.length > 0) {
    lines.push(`## Top Active Transits`);
    for (const t of ctx.topTransits) {
      lines.push(`- ${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet} (${t.nature}): ${t.effect}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
