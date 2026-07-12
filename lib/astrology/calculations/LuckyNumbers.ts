/**
 * Lucky Numbers Calculator
 *
 * Classical Pythagorean numerology adapted for Vedic astrology.
 * Primary inputs: Date of Birth
 *
 * Number → Ruling Planet mapping (Cheiro system):
 *   1 = Sun   2 = Moon   3 = Jupiter  4 = Rahu
 *   5 = Mercury  6 = Venus  7 = Ketu  8 = Saturn  9 = Mars
 */

// ─── Lookup Tables ────────────────────────────────────────────────────────────

export interface NumberProfile {
  number: number;
  planet: string;
  planetEmoji: string;
  luckyColors: string[];
  luckyDays: string[];
  luckyGemstone: string;
  luckyMetal: string;
  luckyDirection: string;
  nature: string;
  strengths: string[];
  challenges: string[];
  compatibleNumbers: number[];
  incompatibleNumbers: number[];
  mantra: string;
  deity: string;
  financialTendency: string;
}

const NUMBER_PROFILES: Record<number, NumberProfile> = {
  1: {
    number: 1,
    planet: "Sun",
    planetEmoji: "☀️",
    luckyColors: ["Gold", "Orange", "Yellow"],
    luckyDays: ["Sunday"],
    luckyGemstone: "Ruby (Manik)",
    luckyMetal: "Gold",
    luckyDirection: "East",
    nature: "Leadership, Ambition, Independence",
    strengths: ["Natural leader", "High confidence", "Creative thinker", "Decisive", "Independent"],
    challenges: ["Ego clashes", "Stubbornness", "Domineering tendency"],
    compatibleNumbers: [1, 2, 4, 7],
    incompatibleNumbers: [6, 8, 9],
    mantra: "Om Suryaya Namaha",
    deity: "Lord Sun (Surya)",
    financialTendency: "High earning potential through authority roles. Best: Government, Management, Politics.",
  },
  2: {
    number: 2,
    planet: "Moon",
    planetEmoji: "🌙",
    luckyColors: ["White", "Silver", "Cream"],
    luckyDays: ["Monday"],
    luckyGemstone: "Pearl (Moti)",
    luckyMetal: "Silver",
    luckyDirection: "North-West",
    nature: "Sensitivity, Intuition, Cooperation",
    strengths: ["Diplomatic", "Empathetic", "Intuitive", "Cooperative", "Good mediator"],
    challenges: ["Over-sensitive", "Indecisive", "Mood swings"],
    compatibleNumbers: [1, 2, 4, 7],
    incompatibleNumbers: [5, 8, 9],
    mantra: "Om Chandraya Namaha",
    deity: "Lord Moon (Chandra)",
    financialTendency: "Steady income through partnerships. Best: Healthcare, Import/Export, Public Relations.",
  },
  3: {
    number: 3,
    planet: "Jupiter",
    planetEmoji: "🎓",
    luckyColors: ["Yellow", "Gold", "Purple"],
    luckyDays: ["Thursday"],
    luckyGemstone: "Yellow Sapphire (Pukhraj)",
    luckyMetal: "Gold",
    luckyDirection: "North-East",
    nature: "Wisdom, Expansion, Optimism",
    strengths: ["Optimistic", "Knowledgeable", "Generous", "Inspiring", "Great communicator"],
    challenges: ["Over-optimism", "Extravagance", "Lack of focus"],
    compatibleNumbers: [3, 6, 9],
    incompatibleNumbers: [4, 8],
    mantra: "Om Brihaspataye Namaha",
    deity: "Lord Brihaspati (Jupiter)",
    financialTendency: "Wealth through knowledge and expansion. Best: Education, Law, Finance, Religion.",
  },
  4: {
    number: 4,
    planet: "Rahu",
    planetEmoji: "🌐",
    luckyColors: ["Blue", "Electric Blue", "Grey"],
    luckyDays: ["Saturday", "Sunday"],
    luckyGemstone: "Hessonite (Gomed)",
    luckyMetal: "Mixed metals (Panchdhatu)",
    luckyDirection: "South-West",
    nature: "Practicality, Hard Work, Unconventionality",
    strengths: ["Hardworking", "Methodical", "Innovative", "Reliable", "Determined"],
    challenges: ["Resistance to change", "Stubbornness", "Prone to delays"],
    compatibleNumbers: [1, 4, 8],
    incompatibleNumbers: [3, 5, 6, 9],
    mantra: "Om Rahave Namaha",
    deity: "Rahu (North Node)",
    financialTendency: "Success through sustained effort. Best: Technology, Foreign Trade, Research, Real Estate.",
  },
  5: {
    number: 5,
    planet: "Mercury",
    planetEmoji: "💬",
    luckyColors: ["Green", "Light Grey", "White"],
    luckyDays: ["Wednesday"],
    luckyGemstone: "Emerald (Panna)",
    luckyMetal: "Silver",
    luckyDirection: "North",
    nature: "Versatility, Communication, Adventure",
    strengths: ["Quick thinker", "Versatile", "Excellent communicator", "Adaptable", "Business savvy"],
    challenges: ["Restlessness", "Inconsistency", "Risk-taking tendency"],
    compatibleNumbers: [1, 5, 6],
    incompatibleNumbers: [2, 4, 7],
    mantra: "Om Budhaya Namaha",
    deity: "Lord Mercury (Budha)",
    financialTendency: "Multiple income streams. Best: Trading, Media, IT, Sales, Advertising.",
  },
  6: {
    number: 6,
    planet: "Venus",
    planetEmoji: "💝",
    luckyColors: ["Pink", "White", "Light Blue"],
    luckyDays: ["Friday"],
    luckyGemstone: "Diamond or White Zircon",
    luckyMetal: "Silver or Platinum",
    luckyDirection: "South-East",
    nature: "Love, Harmony, Beauty, Luxury",
    strengths: ["Charming", "Creative", "Responsible", "Harmonious", "Artistic"],
    challenges: ["Over-indulgence", "People-pleasing", "Financial extravagance"],
    compatibleNumbers: [3, 5, 6, 9],
    incompatibleNumbers: [1, 4, 8],
    mantra: "Om Shukraya Namaha",
    deity: "Lord Venus (Shukra)",
    financialTendency: "Wealth through creativity and beauty. Best: Fashion, Hospitality, Entertainment, Interior Design.",
  },
  7: {
    number: 7,
    planet: "Ketu",
    planetEmoji: "🔮",
    luckyColors: ["Violet", "Purple", "Grey"],
    luckyDays: ["Monday", "Sunday"],
    luckyGemstone: "Cat's Eye (Lehsunia)",
    luckyMetal: "Silver",
    luckyDirection: "South",
    nature: "Spirituality, Wisdom, Mystery, Introspection",
    strengths: ["Analytical mind", "Spiritual depth", "Intuitive", "Original thinker", "Research oriented"],
    challenges: ["Isolation tendency", "Cynicism", "Overthinking"],
    compatibleNumbers: [2, 7],
    incompatibleNumbers: [5, 6, 8],
    mantra: "Om Ketave Namaha",
    deity: "Ketu (South Node)",
    financialTendency: "Gains from research and occult. Best: Research, Spirituality, IT, Psychology, Writing.",
  },
  8: {
    number: 8,
    planet: "Saturn",
    planetEmoji: "⏱️",
    luckyColors: ["Black", "Dark Blue", "Dark Grey"],
    luckyDays: ["Saturday"],
    luckyGemstone: "Blue Sapphire (Neelam)",
    luckyMetal: "Iron or Steel",
    luckyDirection: "West",
    nature: "Power, Karma, Discipline, Material Success",
    strengths: ["Disciplined", "Persistent", "Powerful", "Strategic", "Business-minded"],
    challenges: ["Karmic obstacles", "Delayed success", "Coldness"],
    compatibleNumbers: [4, 8],
    incompatibleNumbers: [1, 2, 3, 6, 9],
    mantra: "Om Sham Shanicharaya Namaha",
    deity: "Lord Saturn (Shani)",
    financialTendency: "Late but lasting wealth. Best: Real Estate, Mining, Law, Politics, Large organisations.",
  },
  9: {
    number: 9,
    planet: "Mars",
    planetEmoji: "🔥",
    luckyColors: ["Red", "Crimson", "Pink"],
    luckyDays: ["Tuesday"],
    luckyGemstone: "Red Coral (Moonga)",
    luckyMetal: "Copper or Gold",
    luckyDirection: "South",
    nature: "Courage, Energy, Completion, Humanitarianism",
    strengths: ["Courageous", "Energetic", "Passionate", "Humanitarian", "Leader in crisis"],
    challenges: ["Aggression", "Impulsiveness", "Conflict-prone"],
    compatibleNumbers: [3, 6, 9],
    incompatibleNumbers: [1, 4, 8],
    mantra: "Om Angarakaya Namaha",
    deity: "Lord Mars (Mangal)",
    financialTendency: "Earnings through action and drive. Best: Military, Engineering, Sports, Surgery, Entrepreneurship.",
  },
};

// ─── Core Calculation Functions ───────────────────────────────────────────────

/** Reduce any number to a single digit (1–9) — exported for use by other calculators */
export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

/** Pythagorean life path number from date of birth */
export function calculateLifePathNumber(dob: Date): number {
  const day = dob.getDate();
  const month = dob.getMonth() + 1;
  const year = dob.getFullYear();
  return reduceToSingleDigit(day + month + reduceToSingleDigit(year));
}

/** Birth number = day of birth reduced to single digit */
export function calculateBirthNumber(dob: Date): number {
  return reduceToSingleDigit(dob.getDate());
}

/** Name number = sum of Pythagorean letter values of full name */
export function calculateNameNumber(fullName: string): number {
  const PYTHAGOREAN: Record<string, number> = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
  };
  const total = fullName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .reduce((sum, ch) => sum + (PYTHAGOREAN[ch] ?? 0), 0);
  return reduceToSingleDigit(total);
}

// ─── Report Output ────────────────────────────────────────────────────────────

export interface LuckyNumberReport {
  name: string;
  dob: string;
  birthNumber: number;
  birthNumberProfile: NumberProfile;
  lifePathNumber: number;
  lifePathProfile: NumberProfile;
  nameNumber: number | null;
  nameNumberProfile: NumberProfile | null;
  // Merged lucky attributes (primary = life path, secondary = birth)
  primaryLuckyColors: string[];
  primaryLuckyDays: string[];
  primaryLuckyGemstone: string;
  primaryLuckyMetal: string;
  primaryLuckyDirection: string;
  luckyNumbers: number[];
  additionalLuckyNumbers: number[];
  compatibleNumbers: number[];
  mantra: string;
  financialTip: string;
}

export function generateLuckyNumberReport(
  name: string,
  dob: Date,
  fullNameForNumerology?: string,
): LuckyNumberReport {
  const birthNumber = calculateBirthNumber(dob);
  const lifePathNumber = calculateLifePathNumber(dob);
  const nameNumber = fullNameForNumerology
    ? calculateNameNumber(fullNameForNumerology)
    : null;

  const lifePathProfile = NUMBER_PROFILES[lifePathNumber]!;
  const birthNumberProfile = NUMBER_PROFILES[birthNumber]!;
  const nameNumberProfile = nameNumber ? (NUMBER_PROFILES[nameNumber] ?? null) : null;

  // Derive lucky numbers: life path, birth, and two multiples
  const baseNums = Array.from(new Set([lifePathNumber, birthNumber]));
  const luckyNumbers = baseNums;
  const additionalLuckyNumbers = [
    ...(lifePathProfile.compatibleNumbers),
    ...(birthNumberProfile.compatibleNumbers),
  ].filter((n, i, arr) => arr.indexOf(n) === i && !baseNums.includes(n)).slice(0, 3);

  return {
    name,
    dob: dob.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    birthNumber,
    birthNumberProfile,
    lifePathNumber,
    lifePathProfile,
    nameNumber,
    nameNumberProfile,
    primaryLuckyColors: lifePathProfile.luckyColors,
    primaryLuckyDays: lifePathProfile.luckyDays,
    primaryLuckyGemstone: lifePathProfile.luckyGemstone,
    primaryLuckyMetal: lifePathProfile.luckyMetal,
    primaryLuckyDirection: lifePathProfile.luckyDirection,
    luckyNumbers,
    additionalLuckyNumbers,
    compatibleNumbers: lifePathProfile.compatibleNumbers,
    mantra: lifePathProfile.mantra,
    financialTip: lifePathProfile.financialTendency,
  };
}
