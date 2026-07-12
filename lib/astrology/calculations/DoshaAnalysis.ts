/**
 * Dosha Analysis — Kaal Sarp Dosha + Enhanced Manglik Dosha
 *
 * Kaal Sarp Dosha:
 *   All 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
 *   must lie within the arc between Rahu and Ketu (exclusive).
 *   Types named after serpents: Anant, Kulik, Vasuki, Shankhpal… (12 types)
 *
 * Manglik Dosha (enhanced from MangalDosha.ts):
 *   Adds severity description, remedies, and partner matching guidance.
 */

import { calculateMangalDosha } from "./MangalDosha";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KaalSarpType =
  | "Anant" | "Kulik" | "Vasuki" | "Shankhpal" | "Padma" | "Mahapadma"
  | "Takshak" | "Karkotak" | "Shankhachud" | "Ghatak" | "Vishdhar" | "Sheshnag"
  | "None";

export type KaalSarpSeverity = "Partial" | "Full" | "None";

export interface KaalSarpReport {
  hasKaalSarp: boolean;
  severity: KaalSarpSeverity;
  type: KaalSarpType;
  rahuSign: number;
  ketuSign: number;
  affectedPlanets: string[];
  outsidePlanets: string[];
  description: string;
  effects: string[];
  remedies: string[];
  cancellations: string[];
}

export interface ManglikDoshaReport {
  hasDosha: boolean;
  severity: "High" | "Partial" | "None";
  isCancelled: boolean;
  marsHouseLagna: number;
  marsHouseMoon: number;
  fromLagna: boolean;
  fromMoon: boolean;
  description: string;
  effects: string[];
  remedies: string[];
  partnerGuidance: string;
}

export interface DoshaAnalysisReport {
  kaalSarp: KaalSarpReport;
  manglik: ManglikDoshaReport;
  overallDosha: "Severe" | "Moderate" | "Mild" | "None";
  priorityAction: string;
}

// ─── Kaal Sarp type names (numbered by Rahu sign position) ───────────────────

const KAALSARP_TYPES: KaalSarpType[] = [
  "Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma",
  "Takshak", "Karkotak", "Shankhachud", "Ghatak", "Vishdhar", "Sheshnag",
];

const KAALSARP_EFFECTS: Record<KaalSarpType, string[]> = {
  Anant:       ["Career obstacles and sudden reversals", "Health issues — stomach/intestine"],
  Kulik:       ["Wealth accumulation difficult", "Family disputes, property issues"],
  Vasuki:      ["Sibling conflicts", "Communication misunderstandings", "Nervous system strain"],
  Shankhpal:   ["Home instability, maternal issues", "Emotional mood swings"],
  Padma:       ["Children's welfare concerns", "Speculation losses", "Romance delays"],
  Mahapadma:   ["Health issues — digestive", "Disputes with employees", "Legal matters"],
  Takshak:     ["Marital stress", "Business partnership problems", "Legal disputes"],
  Karkotak:    ["Inheritance issues", "Sudden financial losses", "Chronic health conditions"],
  Shankhachud: ["Fortune fluctuations", "Father's health", "Long journeys troublesome"],
  Ghatak:      ["Career authority conflicts", "Government-related troubles", "Joint pain"],
  Vishdhar:    ["Income irregularities", "Elder siblings", "Social isolation phases"],
  Sheshnag:    ["Expenses exceed income", "Foreign land issues", "Spiritual disturbances"],
  None:        [],
};

const KAALSARP_REMEDIES = [
  "Perform Kaal Sarp Dosha Nivaran Puja at Trimbakeshwar (Nashik) or Ujjain",
  "Recite Mahamrityunjaya Mantra 108 times daily",
  "Worship Nag Devta — offer milk to snake idols on Nag Panchami",
  "Wear a silver Nag pendant (not gold) on the right arm",
  "Recite Rahu and Ketu mantras on Saturdays",
  "Donate black sesame and coconut on Saturdays",
  "Plant a Neem tree and water it regularly",
];

// ─── Kaal Sarp calculator ─────────────────────────────────────────────────────

function getSign(longitude: number): number {
  return Math.floor(longitude / 30) % 12; // 0-11
}

function isInArc(planetLon: number, rahuLon: number, ketuLon: number): boolean {
  // Arc from Rahu to Ketu (clockwise, i.e. decreasing longitude direction)
  // A planet is inside if rahuLon > planetLon > ketuLon OR wraps around 0
  const rahuDeg = rahuLon % 360;
  const ketuDeg = ketuLon % 360;
  const p = planetLon % 360;

  if (rahuDeg > ketuDeg) {
    return p < rahuDeg && p > ketuDeg;
  } else {
    return p < rahuDeg || p > ketuDeg;
  }
}

export function calculateKaalSarpDosha(
  planetLongitudes: Record<string, number>, // { Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu }
): KaalSarpReport {
  const rahu = planetLongitudes["Rahu"] ?? 0;
  const ketu = planetLongitudes["Ketu"] ?? 180;

  const mainPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const insidePlanets: string[] = [];
  const outsidePlanets: string[] = [];

  for (const planet of mainPlanets) {
    const lon = planetLongitudes[planet];
    if (lon === undefined) continue;
    if (isInArc(lon, rahu, ketu)) {
      insidePlanets.push(planet);
    } else {
      outsidePlanets.push(planet);
    }
  }

  const hasKaalSarp = outsidePlanets.length === 0;
  const isPartial = !hasKaalSarp && outsidePlanets.length <= 2;
  const severity: KaalSarpSeverity = hasKaalSarp ? "Full" : isPartial ? "Partial" : "None";

  // Determine type from Rahu sign
  const rahuSign = getSign(rahu); // 0-11
  const type: KaalSarpType = hasKaalSarp || isPartial ? KAALSARP_TYPES[rahuSign] ?? "None" : "None";

  const effects = KAALSARP_EFFECTS[type] ?? [];

  // Cancellation conditions
  const cancellations: string[] = [];
  if (outsidePlanets.length > 0) {
    cancellations.push(`${outsidePlanets.join(", ")} outside the Rahu–Ketu axis — partial relief`);
  }
  if (planetLongitudes["Jupiter"] !== undefined && getSign(planetLongitudes["Jupiter"]) === getSign(rahu)) {
    cancellations.push("Jupiter conjunct Rahu partially mitigates the dosha");
  }

  const description = hasKaalSarp
    ? `Full Kaal Sarp Dosha (${type} Type) — all 7 planets between Rahu and Ketu.`
    : isPartial
    ? `Partial Kaal Sarp Dosha (${type} Type) — ${insidePlanets.length} of 7 planets inside axis.`
    : "No Kaal Sarp Dosha present.";

  return {
    hasKaalSarp: hasKaalSarp || isPartial,
    severity,
    type,
    rahuSign: rahuSign + 1,
    ketuSign: (rahuSign + 6) % 12 + 1,
    affectedPlanets: insidePlanets,
    outsidePlanets,
    description,
    effects,
    remedies: hasKaalSarp || isPartial ? KAALSARP_REMEDIES : [],
    cancellations,
  };
}

// ─── Enhanced Manglik wrapper ─────────────────────────────────────────────────

const MANGLIK_EFFECTS = [
  "Delays or difficulties in marriage",
  "Friction and arguments in marital life",
  "Partner's health may be impacted",
  "Aggressive temperament in relationships",
];

const MANGLIK_REMEDIES = [
  "Perform Kumbh Vivah (marriage to banana tree / Vishnu idol) before the actual wedding",
  "Manglik should marry another Manglik — doubles cancel",
  "Wear Red Coral (Moonga) after consulting a Jyotishi",
  "Recite Navgraha mantra on Tuesdays",
  "Chant 'Om Angarakaya Namaha' 108 times on Tuesdays",
  "Donate red lentils (masoor dal) to temple on Tuesdays",
  "Light ghee lamp for Hanuman on Tuesdays",
];

export function calculateEnhancedMangalDosha(
  marsLon: number,
  ascLon: number,
  moonLon: number,
): ManglikDoshaReport {
  const base = calculateMangalDosha(marsLon, ascLon, moonLon);

  const severity =
    base.score === 100 ? "High"
    : base.score === 50 ? "Partial"
    : "None";

  const effects = base.hasDosha ? MANGLIK_EFFECTS : [];
  const remedies = base.hasDosha && !base.isCancelled ? MANGLIK_REMEDIES : [];

  const partnerGuidance = base.hasDosha && !base.isCancelled
    ? "Strongly advised to match with another Manglik person OR perform Kumbh Vivah before marriage. Dosha presence from both Lagna and Moon requires additional remedies."
    : base.isCancelled
    ? "Manglik Dosha is cancelled due to Mars placement. No special precautions needed, but inform your Jyotishi for final confirmation."
    : "No Manglik Dosha. Marriage can proceed without this specific concern.";

  return {
    hasDosha: base.hasDosha,
    severity,
    isCancelled: base.isCancelled,
    marsHouseLagna: base.factors.marsHouseLagna,
    marsHouseMoon: base.factors.marsHouseMoon,
    fromLagna: base.factors.fromLagna,
    fromMoon: base.factors.fromMoon,
    description: base.description,
    effects,
    remedies,
    partnerGuidance,
  };
}

// ─── Combined report ──────────────────────────────────────────────────────────

export function generateDoshaAnalysisReport(
  planetLongitudes: Record<string, number>,
): DoshaAnalysisReport {
  const kaalSarp = calculateKaalSarpDosha(planetLongitudes);
  const manglik = calculateEnhancedMangalDosha(
    planetLongitudes["Mars"] ?? 0,
    planetLongitudes["Ascendant"] ?? 0,
    planetLongitudes["Moon"] ?? 0,
  );

  const overallDosha =
    (kaalSarp.severity === "Full" && manglik.hasDosha && !manglik.isCancelled) ? "Severe"
    : (kaalSarp.hasKaalSarp || (manglik.hasDosha && !manglik.isCancelled)) ? "Moderate"
    : (kaalSarp.severity === "Partial" || manglik.isCancelled) ? "Mild"
    : "None";

  const priorityAction =
    overallDosha === "Severe"
      ? "Perform Kaal Sarp Puja at Trimbakeshwar and Kumbh Vivah before marriage. Consult a Jyotishi immediately."
      : overallDosha === "Moderate"
      ? "Address the active dosha with prescribed remedies. For marriage, Kundali matching is essential."
      : overallDosha === "Mild"
      ? "Minor dosha presence — remedies are precautionary. Regular worship and Saturn/Mars mantras are sufficient."
      : "No significant doshas detected. Focus on strengthening benefic planets.";

  return { kaalSarp, manglik, overallDosha, priorityAction };
}
