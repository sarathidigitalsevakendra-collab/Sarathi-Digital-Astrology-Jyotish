/**
 * Name Numerology Calculator
 *
 * Classical Pythagorean system:
 * - Destiny Number   = ALL letters in full name
 * - Soul Urge Number = VOWELS only (inner desire)
 * - Personality No.  = CONSONANTS only (outer image)
 * - Life Path Number = DOB digit sum (from LuckyNumbers.ts)
 *
 * Compatibility: compares Destiny vs Life Path
 */

// ─── Letter value table ───────────────────────────────────────────────────────

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
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}



// ─── Number meaning table ─────────────────────────────────────────────────────

export interface NumberMeaning {
  number: number;
  keyword: string;
  planet: string;
  planetEmoji: string;
  description: string;
  positiveTraits: string[];
  negativeTraits: string[];
}

const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    number: 1, keyword: "Leadership", planet: "Sun", planetEmoji: "☀️",
    description: "You are a natural pioneer. Independence and originality define your path.",
    positiveTraits: ["Leadership", "Confidence", "Ambition", "Originality", "Courage"],
    negativeTraits: ["Ego", "Stubbornness", "Domineering"],
  },
  2: {
    number: 2, keyword: "Harmony", planet: "Moon", planetEmoji: "🌙",
    description: "You are the peacemaker. Intuition and diplomacy are your greatest gifts.",
    positiveTraits: ["Diplomacy", "Empathy", "Cooperation", "Intuition", "Adaptability"],
    negativeTraits: ["Over-sensitivity", "Indecisiveness", "Dependency"],
  },
  3: {
    number: 3, keyword: "Creativity", planet: "Jupiter", planetEmoji: "🎓",
    description: "You radiate joy and optimism. Expression and social charm open all doors.",
    positiveTraits: ["Creativity", "Sociability", "Optimism", "Communication", "Generosity"],
    negativeTraits: ["Scattered energy", "Superficiality", "Extravagance"],
  },
  4: {
    number: 4, keyword: "Stability", planet: "Rahu", planetEmoji: "🌐",
    description: "You are the builder. Discipline and hard work are the foundation of your success.",
    positiveTraits: ["Discipline", "Reliability", "Practicality", "Diligence", "Loyalty"],
    negativeTraits: ["Rigidity", "Stubbornness", "Resistance to change"],
  },
  5: {
    number: 5, keyword: "Freedom", planet: "Mercury", planetEmoji: "💬",
    description: "You are the adventurer. Versatility and communication keep you thriving.",
    positiveTraits: ["Adaptability", "Wit", "Communication", "Curiosity", "Multitasking"],
    negativeTraits: ["Restlessness", "Impulsiveness", "Inconsistency"],
  },
  6: {
    number: 6, keyword: "Love", planet: "Venus", planetEmoji: "💝",
    description: "You are the nurturer. Responsibility and harmony define your relationships.",
    positiveTraits: ["Compassion", "Responsibility", "Charm", "Creativity", "Stability"],
    negativeTraits: ["Over-protectiveness", "Self-sacrifice", "Perfectionism"],
  },
  7: {
    number: 7, keyword: "Wisdom", planet: "Ketu", planetEmoji: "🔮",
    description: "You are the seeker. Analytical thinking and spiritual depth set you apart.",
    positiveTraits: ["Intellect", "Intuition", "Introspection", "Research", "Wisdom"],
    negativeTraits: ["Isolation", "Scepticism", "Secretiveness"],
  },
  8: {
    number: 8, keyword: "Power", planet: "Saturn", planetEmoji: "⏱️",
    description: "You are the achiever. Material mastery and executive ability are your calling.",
    positiveTraits: ["Ambition", "Discipline", "Vision", "Authority", "Business acumen"],
    negativeTraits: ["Materialism", "Ruthlessness", "Workaholism"],
  },
  9: {
    number: 9, keyword: "Completion", planet: "Mars", planetEmoji: "🔥",
    description: "You are the humanitarian. Idealism and compassion guide your higher purpose.",
    positiveTraits: ["Compassion", "Generosity", "Leadership", "Creativity", "Courage"],
    negativeTraits: ["Impulsiveness", "Resentment", "Scattered priorities"],
  },
};

// ─── Compatibility scoring ────────────────────────────────────────────────────

const COMPATIBILITY_MATRIX: Record<string, "Excellent" | "Good" | "Average" | "Neutral" | "Challenging"> = {
  "1-1": "Good", "1-2": "Excellent", "1-4": "Good", "1-7": "Excellent",
  "1-5": "Average", "1-6": "Neutral", "1-8": "Challenging", "1-9": "Challenging",
  "2-2": "Good", "2-4": "Excellent", "2-7": "Excellent", "2-6": "Excellent",
  "2-5": "Neutral", "2-8": "Challenging", "2-9": "Challenging",
  "3-3": "Good", "3-6": "Excellent", "3-9": "Excellent", "3-5": "Good",
  "3-4": "Challenging", "3-8": "Challenging",
  "4-4": "Good", "4-8": "Excellent", "4-1": "Good",
  "4-6": "Neutral", "4-9": "Challenging",
  "5-5": "Good", "5-1": "Average", "5-6": "Excellent", "5-3": "Good",
  "5-7": "Neutral", "5-8": "Challenging",
  "6-6": "Excellent", "6-3": "Excellent", "6-9": "Excellent", "6-5": "Excellent",
  "6-1": "Neutral", "6-8": "Neutral",
  "7-7": "Good", "7-2": "Excellent", "7-1": "Excellent",
  "7-5": "Neutral", "7-6": "Neutral",
  "8-8": "Challenging", "8-4": "Excellent", "8-3": "Challenging", "8-6": "Neutral",
  "9-9": "Good", "9-3": "Excellent", "9-6": "Excellent",
  "9-1": "Challenging", "9-4": "Challenging", "9-8": "Neutral",
};

function getCompatibility(a: number, b: number): "Excellent" | "Good" | "Average" | "Neutral" | "Challenging" {
  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  return COMPATIBILITY_MATRIX[key1] ?? COMPATIBILITY_MATRIX[key2] ?? "Neutral";
}

// ─── Output type ──────────────────────────────────────────────────────────────

export interface NameNumerologyReport {
  fullName: string;
  cleanedName: string;  // uppercase letters only
  destinyNumber: number;
  destinyProfile: NumberMeaning;
  soulUrgeNumber: number;
  soulUrgeProfile: NumberMeaning;
  personalityNumber: number;
  personalityProfile: NumberMeaning;
  // Optional DOB-based
  lifePathNumber?: number;
  lifePathProfile?: NumberMeaning;
  destinyLifePathCompatibility?: ReturnType<typeof getCompatibility>;
  // Name change recommendation
  currentTotal: number;
  suggestedTotal?: number;
  suggestedName?: string;
  // Breakdown per letter
  letterBreakdown: { letter: string; value: number; isVowel: boolean }[];
}

// ─── Main function ────────────────────────────────────────────────────────────

export function analyzeNameNumerology(
  fullName: string,
  dob?: Date,
): NameNumerologyReport {
  const cleaned = fullName.toUpperCase().replace(/[^A-Z]/g, "");
  const letters = cleaned.split("");

  const allValues = letters.map(ch => PYTHAGOREAN[ch] ?? 0);
  const vowelValues = letters.filter(ch => VOWELS.has(ch)).map(ch => PYTHAGOREAN[ch] ?? 0);
  const consonantValues = letters.filter(ch => !VOWELS.has(ch)).map(ch => PYTHAGOREAN[ch] ?? 0);

  const destinyNumber = reduceToSingleDigit(allValues.reduce((s, v) => s + v, 0));
  const soulUrgeNumber = vowelValues.length
    ? reduceToSingleDigit(vowelValues.reduce((s, v) => s + v, 0))
    : 1;
  const personalityNumber = consonantValues.length
    ? reduceToSingleDigit(consonantValues.reduce((s, v) => s + v, 0))
    : 1;

  const letterBreakdown = letters.map(ch => ({
    letter: ch,
    value: PYTHAGOREAN[ch] ?? 0,
    isVowel: VOWELS.has(ch),
  }));

  let lifePathNumber: number | undefined;
  let lifePathProfile: NumberMeaning | undefined;
  let destinyLifePathCompatibility: ReturnType<typeof getCompatibility> | undefined;

  if (dob) {
    const d = dob.getDate();
    const m = dob.getMonth() + 1;
    const y = dob.getFullYear();
    lifePathNumber = reduceToSingleDigit(d + m + reduceToSingleDigit(y));
    lifePathProfile = NUMBER_MEANINGS[lifePathNumber];
    destinyLifePathCompatibility = getCompatibility(destinyNumber, lifePathNumber);
  }

  return {
    fullName,
    cleanedName: cleaned,
    destinyNumber,
    destinyProfile: NUMBER_MEANINGS[destinyNumber]!,
    soulUrgeNumber,
    soulUrgeProfile: NUMBER_MEANINGS[soulUrgeNumber]!,
    personalityNumber,
    personalityProfile: NUMBER_MEANINGS[personalityNumber]!,
    lifePathNumber,
    lifePathProfile,
    destinyLifePathCompatibility,
    currentTotal: allValues.reduce((s, v) => s + v, 0),
    letterBreakdown,
  };
}

export { NUMBER_MEANINGS, getCompatibility };

// ─── Business Name Analyser ───────────────────────────────────────────────────

export interface BusinessNameResult {
  name: string;
  destinyNumber: number;
  keyword: string;
  compatibility: "Excellent" | "Good" | "Average" | "Neutral" | "Challenging";
  compatiblityScore: number; // 0-100
  strengths: string[];
  recommendation: string;
  isTopPick: boolean;
}

export interface BusinessNameReport {
  ownerLifePathNumber: number;
  ownerLifePathKeyword: string;
  results: BusinessNameResult[];
  topPickName: string;
  generalAdvice: string;
}

const COMPAT_SCORES: Record<string, number> = {
  Excellent: 95, Good: 78, Average: 55, Neutral: 45, Challenging: 25,
};

const BUSINESS_STRENGTHS: Record<number, string[]> = {
  1: ["Leadership brand", "Commands authority", "Top-of-mind recall"],
  2: ["Partnership-friendly", "Builds trust", "Loyal client base"],
  3: ["Creative recall", "Viral potential", "Optimistic energy"],
  4: ["Solid & trustworthy", "Long-term brand value", "Systematic growth"],
  5: ["Dynamic appeal", "Adapts to trends", "Multi-market reach"],
  6: ["Customer-first aura", "Relationship-driven", "Luxury segment fit"],
  7: ["Research authority", "Premium positioning", "Niche dominance"],
  8: ["Executive presence", "Financial sector strength", "Power brand"],
  9: ["Universal appeal", "Social impact brand", "Global scope"],
};

export function analyzeBusinessName(
  proposedNames: string[],
  ownerDob: Date,
): BusinessNameReport {
  const d = ownerDob.getDate();
  const m = ownerDob.getMonth() + 1;
  const y = ownerDob.getFullYear();
  const ownerLP = reduceToSingleDigit(d + m + reduceToSingleDigit(y));
  const ownerKeyword = NUMBER_MEANINGS[ownerLP]?.keyword ?? "Balance";

  const results: BusinessNameResult[] = proposedNames
    .filter(n => n.trim().length > 0)
    .map(name => {
      const cleaned = name.toUpperCase().replace(/[^A-Z]/g, "");
      const total = cleaned.split("").reduce((s, ch) => s + (PYTHAGOREAN[ch] ?? 0), 0);
      const dn = reduceToSingleDigit(total || 1);
      const compat = getCompatibility(dn, ownerLP);
      const score = COMPAT_SCORES[compat] ?? 45;
      const keyword = NUMBER_MEANINGS[dn]?.keyword ?? "Balance";

      const recommendation =
        compat === "Excellent"
          ? `${name} perfectly aligns with your life path. Highly recommended.`
          : compat === "Good"
          ? `${name} supports your personal energy well. A strong choice.`
          : compat === "Average"
          ? `${name} is a neutral match. Works, but not peak alignment.`
          : compat === "Neutral"
          ? `${name} has little synergy with your life path. Consider alternatives.`
          : `${name} clashes with your natural energy. Avoid if possible.`;

      return {
        name,
        destinyNumber: dn,
        keyword,
        compatibility: compat,
        compatiblityScore: score,
        strengths: BUSINESS_STRENGTHS[dn] ?? [],
        recommendation,
        isTopPick: false,
      };
    });

  // Sort descending by score
  results.sort((a, b) => b.compatiblityScore - a.compatiblityScore);
  if (results.length > 0) results[0]!.isTopPick = true;

  return {
    ownerLifePathNumber: ownerLP,
    ownerLifePathKeyword: ownerKeyword,
    results,
    topPickName: results[0]?.name ?? "",
    generalAdvice: `As a Life Path ${ownerLP} (${ownerKeyword}), choose a business name whose Destiny Number is ` +
      `${(NUMBER_MEANINGS[ownerLP]?.positiveTraits ?? []).slice(0, 2).join(" or ") || "compatible with your energy"}. ` +
      `The top pick above best aligns your personal vibration with your brand identity.`,
  };
}

