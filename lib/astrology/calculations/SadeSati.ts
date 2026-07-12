/**
 * Sade Sati & Shani Transit Report
 *
 * Sade Sati is the 7.5-year period when Saturn (Shani) transits
 * through the 3 zodiac signs surrounding the natal Moon:
 *   - Rising Phase  : Saturn in 12th sign from natal Moon
 *   - Peak Phase    : Saturn in natal Moon's sign
 *   - Setting Phase : Saturn in 2nd sign from natal Moon
 *
 * Additional: Dhaiya (Shani's 2.5-year minor period) when Saturn
 * transits the 4th or 8th sign from natal Moon.
 *
 * Saturn takes ~29.46 years to complete one orbit (2.46 years/sign).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SadeSatiPhase = "Rising" | "Peak" | "Setting" | "None";
export type DhaiyaPhase   = "4th Dhaiya" | "8th Dhaiya" | "None";
export type IntensityLevel = "High" | "Medium" | "Low" | "None";

export interface SadeSatiPeriod {
  phase: SadeSatiPhase;
  startYear: number;
  endYear: number;
  signTransited: string;
  signNumber: number;
  description: string;
}

export interface SadeSatiReport {
  natalMoonSign: string;
  natalMoonSignNumber: number;       // 1-12
  currentSaturnSign: string;
  currentSaturnSignNumber: number;

  // Current status
  isInSadeSati: boolean;
  sadeSatiPhase: SadeSatiPhase;
  isDhaiya: boolean;
  dhaiyaPhase: DhaiyaPhase;
  intensity: IntensityLevel;

  // Timeline
  currentPeriod?: SadeSatiPeriod;
  previousSadeSati?: { startYear: number; endYear: number };
  nextSadeSati?: { startYear: number; endYear: number };

  // Effects & Remedies
  lifeAreasAffected: string[];
  positiveAspects: string[];
  challenges: string[];
  remedies: string[];
  mantra: string;
  fastingDay: string;
  donationItems: string[];

  overallVerdict: string;
}

// ─── Zodiac / Sign data ───────────────────────────────────────────────────────

const SIGN_NAMES = [
  "", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Approximate Saturn sign entry years (Capricorn=2020, Aquarius=2023, …)
// Saturn ~2.46 years per sign. Reference: Saturn entered Capricorn Jan 2020.
const SATURN_REFERENCE_SIGN = 10; // Capricorn (1-indexed)
const SATURN_REFERENCE_YEAR = 2020.04; // ~Jan 2020

function currentSaturnSign(year: number): number {
  const yearsFromRef = year - SATURN_REFERENCE_YEAR;
  const signsFromRef = Math.floor(yearsFromRef / 2.46);
  const sign = ((SATURN_REFERENCE_SIGN - 1 + signsFromRef) % 12) + 1;
  return sign < 1 ? sign + 12 : sign;
}

function saturnSignEntryYear(signNum: number): number {
  const signsFromRef = ((signNum - SATURN_REFERENCE_SIGN + 12) % 12);
  return SATURN_REFERENCE_YEAR + signsFromRef * 2.46;
}

// ─── Sign-specific effects ────────────────────────────────────────────────────

interface SignSadeSatiEffect {
  lifeAreas: string[];
  positives: string[];
  challenges: string[];
  phaseEffects: Record<SadeSatiPhase, string>;
}

const EFFECTS_BY_MOON_SIGN: Record<number, SignSadeSatiEffect> = {
  1: { // Aries
    lifeAreas: ["Career", "Health", "Relationships"],
    positives: ["Discipline develops", "Long-term planning improves", "Karmic lessons learned"],
    challenges: ["Health fluctuations", "Career slowdowns", "Relationship strain"],
    phaseEffects: {
      Rising: "Saturn in Pisces causes subconscious worries and foreign travel issues.",
      Peak: "Saturn directly on natal Moon — emotional discipline, home and career challenges.",
      Setting: "Relief phase, new beginnings in work, lessons of patience rewarded.",
      None: "",
    },
  },
  2: { // Taurus
    lifeAreas: ["Finance", "Family", "Speech"],
    positives: ["Financial restructuring", "Family bonds deepen", "Hard work yields results"],
    challenges: ["Financial pressure", "Family disputes", "Throat/speech issues"],
    phaseEffects: {
      Rising: "Expenses increase, savings under pressure.",
      Peak: "Most intense — financial and emotional strain, possible change in residence.",
      Setting: "Financial stability returns, family harmony improves.",
      None: "",
    },
  },
  3: { // Gemini
    lifeAreas: ["Communication", "Siblings", "Short travels"],
    positives: ["Discipline in communication", "Sibling bonds tested and strengthened"],
    challenges: ["Miscommunications", "Travel delays", "Mental fatigue"],
    phaseEffects: {
      Rising: "Restlessness, frequent changes.",
      Peak: "Mental stress, difficulty expressing self clearly.",
      Setting: "Clarity returns, communication improves.",
      None: "",
    },
  },
  4: { // Cancer
    lifeAreas: ["Home", "Mother", "Emotions"],
    positives: ["Emotional maturity", "Deep introspection"],
    challenges: ["Domestic unrest", "Mother's health", "Emotional turbulence"],
    phaseEffects: {
      Rising: "Distant family issues, home repairs needed.",
      Peak: "Most emotionally challenging — mother's wellbeing, residential changes.",
      Setting: "Emotional healing, domestic peace returns.",
      None: "",
    },
  },
  5: { // Leo
    lifeAreas: ["Children", "Creativity", "Romance"],
    positives: ["Leadership through adversity", "Creative discipline"],
    challenges: ["Children's welfare", "Romance delays", "Ego conflicts"],
    phaseEffects: {
      Rising: "Speculative losses, creative blocks.",
      Peak: "Children's issues prominent, romantic delays.",
      Setting: "Recognition for past efforts, creative resurgence.",
      None: "",
    },
  },
  6: { // Virgo
    lifeAreas: ["Health", "Work", "Service"],
    positives: ["Work ethic sharpens", "Health consciousness increases"],
    challenges: ["Digestive issues", "Work stress", "Conflicts with colleagues"],
    phaseEffects: {
      Rising: "Work environment becomes demanding.",
      Peak: "Health requires attention, enemies/competitors active.",
      Setting: "Health improving, professional recognition arrives.",
      None: "",
    },
  },
  7: { // Libra
    lifeAreas: ["Marriage", "Business partnerships", "Public image"],
    positives: ["Relationship depth", "Business realism"],
    challenges: ["Marital tensions", "Business slowdowns", "Legal issues"],
    phaseEffects: {
      Rising: "Foreign connections problematic, spiritual inclination.",
      Peak: "Marriage/partnership stress is highest.",
      Setting: "Relationship wisdom gained, public standing recovers.",
      None: "",
    },
  },
  8: { // Scorpio
    lifeAreas: ["Inheritance", "Hidden matters", "Transformation"],
    positives: ["Deep transformation", "Research ability heightens"],
    challenges: ["Sudden events", "Inherited wealth disputes", "Health—chronic issues"],
    phaseEffects: {
      Rising: "Unexpected expenses, debts surface.",
      Peak: "Life transformations — career, health, relationships all shift.",
      Setting: "Transformation complete, karmic rewards begin.",
      None: "",
    },
  },
  9: { // Sagittarius
    lifeAreas: ["Fortune", "Father", "Higher learning"],
    positives: ["Philosophical maturity", "Spiritual discipline"],
    challenges: ["Father's health", "Fortune delays", "Educational obstacles"],
    phaseEffects: {
      Rising: "Long-distance travel and foreign connections strained.",
      Peak: "Luck feels blocked, spiritual seeking increases.",
      Setting: "Fortune slowly returns, wisdom of the period bears fruit.",
      None: "",
    },
  },
  10: { // Capricorn
    lifeAreas: ["Career", "Authority", "Status"],
    positives: ["Career restructuring", "Discipline mastered", "Status rebuilt"],
    challenges: ["Career setbacks", "Government/authority friction", "Joint pain"],
    phaseEffects: {
      Rising: "Expenditure rises, sleep disturbances.",
      Peak: "Career at a crossroads, responsibility heavy.",
      Setting: "Career rewards materialise, authority restored.",
      None: "",
    },
  },
  11: { // Aquarius
    lifeAreas: ["Gains", "Elder siblings", "Social network"],
    positives: ["Gains through discipline", "Social circle quality improves"],
    challenges: ["Income fluctuations", "Elder sibling issues", "Social isolation"],
    phaseEffects: {
      Rising: "Expenditure heavy, savings difficult.",
      Peak: "Income stream disrupted, friend circle shrinks.",
      Setting: "Financial gains begin, social expansion resumes.",
      None: "",
    },
  },
  12: { // Pisces
    lifeAreas: ["Liberation", "Spirituality", "Expenses"],
    positives: ["Spiritual awakening", "Moksha-oriented discipline"],
    challenges: ["Isolation", "Hidden enemies active", "Hospitalisation risk"],
    phaseEffects: {
      Rising: "Loss of sleep, vague anxieties.",
      Peak: "Expenses uncontrolled, spiritual path forces itself.",
      Setting: "Clarity dawns, spiritual gains significant.",
      None: "",
    },
  },
};

// ─── Universal remedies for Sade Sati ────────────────────────────────────────

const BASE_REMEDIES = [
  "Chant Shani Mantra / Hanuman Chalisa every Saturday",
  "Light sesame oil lamp for Shani on Saturdays",
  "Donate black sesame (til), oil, or black cloth on Saturdays",
  "Wear dark blue or black on Saturdays",
  "Feed crows (Shani's vahana) especially on Saturdays",
  "Visit Shani or Hanuman temple on Saturdays",
  "Observe Shani Pradosh vrat when possible",
  "Avoid major new decisions during Peak phase",
];

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Generate Sade Sati report.
 * @param natalMoonSignNum - Rashi (sign) number of natal Moon (1=Aries…12=Pisces)
 * @param currentYear      - Current year (e.g. 2026)
 */
export function generateSadeSatiReport(
  natalMoonSignNum: number,
  currentYear: number = new Date().getFullYear(),
): SadeSatiReport {
  // Moon sign name
  const moonSign = SIGN_NAMES[natalMoonSignNum] ?? "Unknown";

  // Current Saturn sign
  const saturnSign = currentSaturnSign(currentYear);
  const saturnSignName = SIGN_NAMES[saturnSign] ?? "Unknown";

  // Relative position of Saturn from natal Moon
  const relPos = ((saturnSign - natalMoonSignNum + 12) % 12) + 1; // 1–12

  // Determine phase
  let phase: SadeSatiPhase = "None";
  let dhaiya: DhaiyaPhase = "None";

  if (relPos === 12) phase = "Rising";
  else if (relPos === 1) phase = "Peak";
  else if (relPos === 2) phase = "Setting";
  else if (relPos === 4) dhaiya = "4th Dhaiya";
  else if (relPos === 8) dhaiya = "8th Dhaiya";

  const isInSadeSati = phase !== "None";
  const isDhaiya = dhaiya !== "None";

  // Intensity
  const intensity: IntensityLevel =
    phase === "Peak"  ? "High"
    : phase !== "None" ? "Medium"
    : dhaiya !== "None" ? "Low"
    : "None";

  // Build current period details
  let currentPeriod: SadeSatiPeriod | undefined;
  if (isInSadeSati) {
    const phaseSigns: Record<SadeSatiPhase, number> = {
      Rising: ((natalMoonSignNum - 2 + 12) % 12) + 1,
      Peak: natalMoonSignNum,
      Setting: (natalMoonSignNum % 12) + 1,
      None: 0,
    };
    const transSign = phaseSigns[phase];
    const entryYear = saturnSignEntryYear(transSign);

    currentPeriod = {
      phase,
      startYear: Math.round(entryYear * 10) / 10,
      endYear: Math.round((entryYear + 2.46) * 10) / 10,
      signTransited: SIGN_NAMES[transSign] ?? "Unknown",
      signNumber: transSign,
      description: EFFECTS_BY_MOON_SIGN[natalMoonSignNum]?.phaseEffects[phase] ?? "",
    };
  }

  // Previous Sade Sati (approx: 29.5 years ago)
  const previousSadeSati = {
    startYear: Math.round((currentYear - 29.5 - 7.5) * 10) / 10,
    endYear: Math.round((currentYear - 29.5) * 10) / 10,
  };

  // Next Sade Sati
  const risingSignForNext = ((natalMoonSignNum - 2 + 12) % 12) + 1;
  const nextRisingEntry = saturnSignEntryYear(risingSignForNext);
  const nextSadeSatiStart = nextRisingEntry > currentYear
    ? nextRisingEntry
    : nextRisingEntry + 29.46;
  const nextSadeSati = {
    startYear: Math.round(nextSadeSatiStart * 10) / 10,
    endYear: Math.round((nextSadeSatiStart + 7.5) * 10) / 10,
  };

  // Effects
  const effects = EFFECTS_BY_MOON_SIGN[natalMoonSignNum] ?? {
    lifeAreas: ["General wellbeing"],
    positives: ["Discipline and patience develop"],
    challenges: ["Delays and obstacles"],
    phaseEffects: { Rising: "", Peak: "", Setting: "", None: "" },
  };

  // Verdict
  const verdict =
    phase === "Peak"
      ? `You are in the Peak of Sade Sati (${moonSign} Moon). This is the most intensive 2.5-year window — focus on discipline, humility, and service. Avoid ego-driven decisions.`
      : phase !== "None"
      ? `You are in the ${phase} Phase of Sade Sati. Intensity is moderate — stay patient and apply the prescribed remedies.`
      : dhaiya !== "None"
      ? `You are currently in ${dhaiya} — a 2.5-year minor Saturn pressure period. Mild but real challenges in specific areas.`
      : `You are NOT in Sade Sati or Dhaiya. Saturn's transit is currently favourable for your Moon sign (${moonSign}).`;

  return {
    natalMoonSign: moonSign,
    natalMoonSignNumber: natalMoonSignNum,
    currentSaturnSign: saturnSignName,
    currentSaturnSignNumber: saturnSign,
    isInSadeSati,
    sadeSatiPhase: phase,
    isDhaiya,
    dhaiyaPhase: dhaiya,
    intensity,
    currentPeriod,
    previousSadeSati,
    nextSadeSati,
    lifeAreasAffected: effects.lifeAreas,
    positiveAspects: effects.positives,
    challenges: effects.challenges,
    remedies: BASE_REMEDIES,
    mantra: "Om Sham Shanicharaya Namaha",
    fastingDay: "Saturday",
    donationItems: ["Black sesame seeds", "Mustard oil", "Black cloth", "Iron articles"],
    overallVerdict: verdict,
  };
}
