/**
 * Muhurat (Auspicious Time) Engine
 *
 * Classical Jyotish muhurat selection based on Panchang elements:
 * - Tithi   (lunar day 1–30)
 * - Vara    (week day)
 * - Nakshatra (Moon's position, 1–27)
 * - Yoga    (Sun+Moon combination, 1–27)
 * - Karana  (half-tithi)
 *
 * Supports: Marriage, Griha Pravesh, Business Opening, Naming Ceremony, Travel
 *
 * Algorithm:
 * 1. For each date in the query range, compute approximate panchang elements
 * 2. Score each day against the event-specific Muhurata Shastras rules
 * 3. Return top slots with quality rating, auspicious windows & cautions
 *
 * Note: Calculations use simplified mean-longitude approach (no Swiss Ephemeris)
 * and produce results accurate to ±1 day for muhurat purposes.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type MuhuratType =
  | "Marriage"
  | "GrihaPravesh"
  | "BusinessOpening"
  | "NamingCeremony"
  | "Travel";

export type MuhuratQuality = "Excellent" | "Good" | "Average" | "Avoid";

export interface PanchangElements {
  tithi: number;       // 1-30
  tithiName: string;
  vara: number;        // 0=Sun … 6=Sat
  varaName: string;
  nakshatra: number;   // 1-27
  nakshatraName: string;
  yoga: number;        // 1-27
  yogaName: string;
}

export interface MuhuratSlot {
  date: string;          // ISO date string
  quality: MuhuratQuality;
  score: number;         // 0-100
  panchang: PanchangElements;
  auspiciousWindow: string;   // e.g. "07:00 – 10:30"
  avoidWindow?: string;       // e.g. "Rahu Kalam 09:00 – 10:30"
  positives: string[];
  cautions: string[];
  overallVerdict: string;
}

export interface MuhuratReport {
  muhuratType: MuhuratType;
  muhuratLabel: string;
  queryRange: { from: string; to: string };
  totalDaysScanned: number;
  slots: MuhuratSlot[];          // ALL days, sorted best first
  topSlots: MuhuratSlot[];       // top 5 excellent/good days
  summary: string;
}

// ─── Panchang tables ──────────────────────────────────────────────────────────

const TITHI_NAMES = [
  "", "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

const VARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const NAKSHATRA_NAMES = [
  "", "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const YOGA_NAMES = [
  "", "Vishkambha", "Preeti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti",
];

// Inauspicious yogas
const INAUSPICIOUS_YOGAS = new Set([1, 6, 9, 10, 15, 17, 19, 27]); // Vishkambha, Atiganda, Shula, Ganda, Vajra, Vyatipata, Parigha, Vaidhriti

// ─── Event-specific rule sets ─────────────────────────────────────────────────

interface MuhuratRules {
  label: string;
  description: string;
  auspiciousVaras: number[];        // day indices (0=Sun)
  avoidVaras: number[];
  auspiciousTithis: number[];
  avoidTithis: number[];
  auspiciousNakshatras: number[];
  avoidNakshatras: number[];
}

const MUHURAT_RULES: Record<MuhuratType, MuhuratRules> = {
  Marriage: {
    label: "Marriage Muhurat",
    description: "Vivah Muhurat — auspicious time for wedding ceremonies",
    auspiciousVaras: [1, 3, 4, 5],          // Mon, Wed, Thu, Fri
    avoidVaras: [0, 2, 6],                   // Sun, Tue, Sat
    auspiciousTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    avoidTithis: [4, 6, 8, 9, 14, 15, 30], // Chaturthi, Shashthi, Ashtami, Navami, Chaturdashi, Purnima (some traditions), Amavasya
    auspiciousNakshatras: [4, 7, 11, 12, 13, 15, 17, 22, 23, 24, 27], // Rohini, Punarvasu, Purva Phalguni, Uttara Phalguni, Hasta, Swati, Anuradha, Shravana, Dhanishtha, Shatabhisha, Revati
    avoidNakshatras: [2, 3, 6, 9, 14, 18, 19, 20, 25, 26], // Bharani, Krittika, Ardra, Ashlesha, Chitra, Jyeshtha, Mula, Purva Ashadha, Purva Bhadrapada, Uttara Bhadrapada
  },
  GrihaPravesh: {
    label: "Griha Pravesh Muhurat",
    description: "House entry ceremony — auspicious time to move into a new home",
    auspiciousVaras: [1, 3, 4, 5],          // Mon, Wed, Thu, Fri
    avoidVaras: [0, 2, 6],                   // Sun, Tue, Sat
    auspiciousTithis: [2, 3, 5, 7, 10, 12, 13],
    avoidTithis: [4, 6, 8, 9, 14, 30],
    auspiciousNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 17, 22, 27],  // Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Hasta, Chitra, Anuradha, Shravana, Revati
    avoidNakshatras: [2, 6, 9, 18, 19, 20, 24],
  },
  BusinessOpening: {
    label: "Business Opening Muhurat",
    description: "Vyapara Muhurat — auspicious time to open a new business or shop",
    auspiciousVaras: [1, 3, 4, 5],          // Mon, Wed, Thu, Fri
    avoidVaras: [0, 2, 6],
    auspiciousTithis: [1, 2, 3, 5, 7, 10, 11, 12, 13],
    avoidTithis: [4, 6, 8, 9, 14, 30],
    auspiciousNakshatras: [1, 4, 7, 8, 12, 13, 14, 15, 17, 21, 22, 27],
    avoidNakshatras: [2, 6, 9, 18, 19, 20],
  },
  NamingCeremony: {
    label: "Namakarana Muhurat",
    description: "Baby naming ceremony — auspicious time for Namakarana Samskara",
    auspiciousVaras: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    auspiciousTithis: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
    avoidTithis: [4, 8, 9, 14, 30],
    auspiciousNakshatras: [1, 5, 7, 8, 12, 13, 14, 16, 17, 21, 22, 27],
    avoidNakshatras: [2, 6, 9, 14, 18, 19, 20],
  },
  Travel: {
    label: "Travel Muhurat",
    description: "Yatra Muhurat — auspicious time to begin a journey",
    auspiciousVaras: [1, 3, 4, 5],
    avoidVaras: [6],                         // Only avoid Saturday for travel
    auspiciousTithis: [2, 3, 5, 7, 10, 11, 12, 13],
    avoidTithis: [4, 8, 9, 14, 30],
    auspiciousNakshatras: [1, 5, 7, 8, 13, 14, 15, 17, 21, 22, 27],
    avoidNakshatras: [6, 9, 14, 18, 19, 20, 24],
  },
};

// ─── Rahu Kalam (inauspicious hourly window by Vara) ─────────────────────────

// Rahu Kalam duration: 1.5 hours. Offset from sunrise (≈ 06:00) in hours.
const RAHU_KALAM_OFFSET: Record<number, number> = {
  0: 10.5, // Sun: 16:30–18:00
  1:  7.5, // Mon: 07:30–09:00
  2: 15.0, // Tue: 15:00–16:30
  3: 12.0, // Wed: 12:00–13:30
  4:  1.5, // Thu: 07:30–09:00 (second slot)
  5: 10.5, // Fri: 10:30–12:00
  6:  9.0, // Sat: 09:00–10:30
};

function rahuKalamWindow(vara: number): string {
  const startH = 6 + RAHU_KALAM_OFFSET[vara]!;
  const endH = startH + 1.5;
  const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 === 0.5 ? "30" : "00"}`;
  return `Rahu Kalam ${fmt(startH)} – ${fmt(endH)}`;
}

// ─── Approximate Panchang Calculation ────────────────────────────────────────

function julianDay(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  const a = Math.floor((14 - M) / 12);
  const y = Y + 4800 - a;
  const m = M + 12 * a - 3;
  return D + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * Mean Sun longitude (sidereal, approximate)
 */
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = (280.46646 + 36000.76983 * T) % 360;
  const M = (357.52911 + 35999.05029 * T) % 360;
  const Mr = M * (Math.PI / 180);
  const C = 1.914602 * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr);
  const sun = (L + C + 360) % 360;
  // Ayanamsha (Lahiri ≈ 23.85° as of J2000, drift ~50.3"/yr)
  const ayanamsha = 23.85 + (T * 50.3 / 3600);
  return (sun - ayanamsha + 360) % 360;
}

/**
 * Mean Moon longitude (sidereal, approximate)
 */
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = (218.3165 + 481267.8813 * T) % 360;
  const moon = (L + 360) % 360;
  const ayanamsha = 23.85 + (T * 50.3 / 3600);
  return (moon - ayanamsha + 360) % 360;
}

function computePanchang(date: Date): PanchangElements {
  const jd = julianDay(date);
  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);

  // Tithi = (moonLon - sunLon) / 12, cycle 1-30
  let tithiRaw = ((moonLon - sunLon + 360) % 360) / 12;
  const tithi = (Math.floor(tithiRaw) % 30) + 1;

  // Nakshatra = moonLon / (360/27), cycle 1-27
  const nakshatra = (Math.floor(moonLon / (360 / 27)) % 27) + 1;

  // Yoga = (sunLon + moonLon) / (360/27), cycle 1-27
  const yoga = (Math.floor(((sunLon + moonLon) % 360) / (360 / 27)) % 27) + 1;

  // Vara = weekday 0=Sun
  const vara = date.getUTCDay();

  return {
    tithi,
    tithiName: TITHI_NAMES[tithi]!,
    vara,
    varaName: VARA_NAMES[vara]!,
    nakshatra,
    nakshatraName: NAKSHATRA_NAMES[nakshatra]!,
    yoga,
    yogaName: YOGA_NAMES[yoga]!,
  };
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────

function scoreMuhurat(p: PanchangElements, rules: MuhuratRules): number {
  let score = 50; // baseline

  // Vara (±20)
  if (rules.auspiciousVaras.includes(p.vara)) score += 20;
  else if (rules.avoidVaras.includes(p.vara)) score -= 20;

  // Tithi (±20)
  if (rules.auspiciousTithis.includes(p.tithi)) score += 20;
  else if (rules.avoidTithis.includes(p.tithi)) score -= 20;

  // Nakshatra (±20)
  if (rules.auspiciousNakshatras.includes(p.nakshatra)) score += 20;
  else if (rules.avoidNakshatras.includes(p.nakshatra)) score -= 20;

  // Yoga (±10)
  if (INAUSPICIOUS_YOGAS.has(p.yoga)) score -= 10;
  else score += 5;

  return Math.max(0, Math.min(100, score));
}

function classifyQuality(score: number): MuhuratQuality {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Avoid";
}

function buildPositivesAndCautions(p: PanchangElements, rules: MuhuratRules, _score: number): {
  positives: string[];
  cautions: string[];
} {
  const positives: string[] = [];
  const cautions: string[] = [];

  if (rules.auspiciousVaras.includes(p.vara))
    positives.push(`${p.varaName} is an auspicious day for this event`);
  else if (rules.avoidVaras.includes(p.vara))
    cautions.push(`${p.varaName} is generally avoided for this event`);

  if (rules.auspiciousTithis.includes(p.tithi))
    positives.push(`${p.tithiName} Tithi is favourable`);
  else if (rules.avoidTithis.includes(p.tithi))
    cautions.push(`${p.tithiName} Tithi is considered inauspicious`);

  if (rules.auspiciousNakshatras.includes(p.nakshatra))
    positives.push(`Moon in ${p.nakshatraName} — an excellent nakshatra for this ceremony`);
  else if (rules.avoidNakshatras.includes(p.nakshatra))
    cautions.push(`Moon in ${p.nakshatraName} — this nakshatra is avoided`);

  if (INAUSPICIOUS_YOGAS.has(p.yoga))
    cautions.push(`${p.yogaName} Yoga is inauspicious — avoid important tasks during its duration`);
  else
    positives.push(`${p.yogaName} Yoga supports the ceremony`);

  if (p.tithi === 30)
    cautions.push("Amavasya (New Moon) — generally avoid auspicious ceremonies");

  return { positives, cautions };
}

function auspiciousWindowForVara(vara: number): string {
  // Brahma Muhurta and Abhijit Muhurta windows
  const windows: Record<number, string> = {
    0: "07:30 – 09:00 (before Rahu Kalam)",
    1: "09:30 – 12:00",
    2: "07:30 – 09:00",
    3: "07:30 – 09:00 & 14:00 – 15:00",
    4: "09:30 – 12:00 & 13:30 – 15:00",
    5: "09:00 – 10:00 & 13:30 – 15:00",
    6: "07:30 – 09:00",
  };
  return windows[vara] ?? "07:30 – 09:00";
}

// ─── Main API ─────────────────────────────────────────────────────────────────

export function calculateMuhurat(
  muhuratType: MuhuratType,
  fromDate: Date,
  toDate: Date,
): MuhuratReport {
  const rules = MUHURAT_RULES[muhuratType];
  const slots: MuhuratSlot[] = [];

  const current = new Date(fromDate);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(toDate);
  end.setUTCHours(23, 59, 59, 999);

  // Limit scan to 90 days to keep response size reasonable
  let daysLeft = 90;

  while (current <= end && daysLeft > 0) {
    const p = computePanchang(current);
    const score = scoreMuhurat(p, rules);
    const quality = classifyQuality(score);
    const { positives, cautions } = buildPositivesAndCautions(p, rules, score);

    const verdict =
      quality === "Excellent"
        ? `${current.toDateString()} is an excellent muhurat day. Highly recommended.`
        : quality === "Good"
        ? `${current.toDateString()} is a good muhurat day with minor considerations.`
        : quality === "Average"
        ? `${current.toDateString()} is acceptable but not ideal.`
        : `${current.toDateString()} is inauspicious for this event. Choose another day.`;

    slots.push({
      date: current.toISOString().split("T")[0]!,
      quality,
      score,
      panchang: p,
      auspiciousWindow: auspiciousWindowForVara(p.vara),
      avoidWindow: rahuKalamWindow(p.vara),
      positives,
      cautions,
      overallVerdict: verdict,
    });

    current.setUTCDate(current.getUTCDate() + 1);
    daysLeft--;
  }

  // Sort best first
  slots.sort((a, b) => b.score - a.score);

  const topSlots = slots.filter(s => s.quality === "Excellent" || s.quality === "Good").slice(0, 5);

  const excellentCount = slots.filter(s => s.quality === "Excellent").length;
  const goodCount = slots.filter(s => s.quality === "Good").length;

  const summary =
    excellentCount > 0
      ? `Found ${excellentCount} excellent and ${goodCount} good muhurat dates in your range. Top pick: ${topSlots[0]?.date ?? "N/A"}.`
      : goodCount > 0
      ? `Found ${goodCount} good muhurat dates. Consider ${topSlots[0]?.date ?? "N/A"} as your top option.`
      : "No excellent dates found in this range. Consider extending the date range or consulting a Jyotishi for remedies.";

  return {
    muhuratType,
    muhuratLabel: rules.label,
    queryRange: {
      from: fromDate.toISOString().split("T")[0]!,
      to: toDate.toISOString().split("T")[0]!,
    },
    totalDaysScanned: slots.length,
    slots: slots.slice(0, 30), // Cap to 30 for response size
    topSlots,
    summary,
  };
}

export { MUHURAT_RULES };
