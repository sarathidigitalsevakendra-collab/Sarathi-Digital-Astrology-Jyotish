/**
 * Annual Horoscope Calculator
 *
 * Generates a structured year-ahead forecast based on:
 * 1. Current year's Saturn, Jupiter, Rahu/Ketu transits over natal Moon sign
 * 2. Month-by-month theme forecast (Sun's monthly transits through 12 signs)
 * 3. Quarterly focus areas (Career / Relationships / Health / Finance)
 * 4. Year score based on benefic/malefic transit balance
 */

export type QuarterName = "Q1 (Jan–Mar)" | "Q2 (Apr–Jun)" | "Q3 (Jul–Sep)" | "Q4 (Oct–Dec)";
export type FocusArea = "Career" | "Relationships" | "Health" | "Finance" | "Spirituality" | "Travel";

export interface MonthForecast {
  month: string;
  theme: string;
  sunSign: string;
  favourable: boolean;
  keyMessage: string;
}

export interface QuarterForecast {
  quarter: QuarterName;
  focus: FocusArea;
  tone: "Excellent" | "Good" | "Mixed" | "Challenging";
  summary: string;
  dos: string[];
  donts: string[];
}

export interface SlowTransitEffect {
  planet: string;
  transitSign: string;
  transitSignNum: number;
  relPosFromMoon: number;  // 1-12
  effect: string;
  intensity: "High" | "Medium" | "Low";
  lifeAreas: string[];
}

export interface AnnualHoroscopeReport {
  year: number;
  moonSign: string;
  moonSignNum: number;
  yearScore: number;           // 0-100
  yearVerdict: string;
  overallTheme: string;
  slowTransits: SlowTransitEffect[];
  months: MonthForecast[];
  quarters: QuarterForecast[];
  luckyMonths: string[];
  challengingMonths: string[];
  luckyNumbers: number[];
  luckyColours: string[];
  yearMantra: string;
  keyAdvice: string[];
}

// ─── Sign names ───────────────────────────────────────────────────────────────

const SIGN_NAMES = [
  "", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Sun's approximate sign by month (tropical, close enough for horoscope themes)
const SUN_SIGN_BY_MONTH = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Jan=Capricorn(10)… Dec=Sagittarius(9)

// ─── Slow-planet transit effect data ─────────────────────────────────────────

interface SlowTransitData {
  effect: string;
  intensity: "High" | "Medium" | "Low";
  lifeAreas: string[];
}

// Jupiter effects from Moon (1-12)
const JUPITER_FROM_MOON: Record<number, SlowTransitData> = {
  1:  { effect: "Jupiter directly on Moon — excellent year for wisdom, expansion, and spiritual growth", intensity: "High", lifeAreas: ["Mind", "Personal growth", "Fortune"] },
  2:  { effect: "Jupiter in 2nd from Moon — wealth accumulation, family prosperity, good income", intensity: "High", lifeAreas: ["Finance", "Family", "Speech"] },
  3:  { effect: "Jupiter in 3rd — moderate; effort and initiative bring results", intensity: "Medium", lifeAreas: ["Communication", "Siblings", "Short travel"] },
  4:  { effect: "Jupiter in 4th — home improvements, mother's wellbeing, property gains", intensity: "High", lifeAreas: ["Home", "Mother", "Property"] },
  5:  { effect: "Jupiter in 5th — creativity flourishes, children, romance, speculative gains", intensity: "High", lifeAreas: ["Children", "Creativity", "Speculation"] },
  6:  { effect: "Jupiter in 6th — health improves, victory over enemies, good for service sectors", intensity: "Medium", lifeAreas: ["Health", "Litigation", "Debts"] },
  7:  { effect: "Jupiter in 7th — marriage/partnerships improve, business partnerships benefit", intensity: "Medium", lifeAreas: ["Marriage", "Business partners"] },
  8:  { effect: "Jupiter in 8th — mixed; inheritance possible, spiritual depth, health needs care", intensity: "Low", lifeAreas: ["Hidden matters", "Inheritance", "Research"] },
  9:  { effect: "Jupiter in 9th — fortune, father, religion, higher learning all very favoured", intensity: "High", lifeAreas: ["Fortune", "Father", "Dharma"] },
  10: { effect: "Jupiter in 10th — excellent career year; recognition, promotion, public success", intensity: "High", lifeAreas: ["Career", "Authority", "Fame"] },
  11: { effect: "Jupiter in 11th — major gains, elder siblings flourish, wishes fulfilled", intensity: "High", lifeAreas: ["Income", "Gains", "Social network"] },
  12: { effect: "Jupiter in 12th — expenses rise, spiritual retreat, foreign opportunities", intensity: "Low", lifeAreas: ["Expenses", "Spirituality", "Foreign lands"] },
};

// Saturn effects from Moon (approximate)
const SATURN_FROM_MOON: Record<number, SlowTransitData> = {
  1:  { effect: "Sade Sati peak — significant life restructuring; apply discipline and patience", intensity: "High", lifeAreas: ["Mind", "Career", "Health"] },
  2:  { effect: "Sade Sati setting — financial discipline needed; positive changes emerging", intensity: "Medium", lifeAreas: ["Finance", "Family"] },
  3:  { effect: "Saturn in 3rd — rewards for effort; discipline in communication", intensity: "Low", lifeAreas: ["Siblings", "Short travel"] },
  4:  { effect: "Saturn in 4th — home responsibility heavy; real estate decisions need care", intensity: "Medium", lifeAreas: ["Home", "Vehicle", "Mother"] },
  5:  { effect: "Saturn in 5th — delays in children's matters; creative discipline develops", intensity: "Medium", lifeAreas: ["Children", "Creativity"] },
  6:  { effect: "Saturn in 6th — excellent for defeating opposition; work discipline rewarded", intensity: "Low", lifeAreas: ["Work", "Health", "Enemies"] },
  7:  { effect: "Saturn in 7th — marriage/partnership stress; requires patience", intensity: "Medium", lifeAreas: ["Marriage", "Business"] },
  8:  { effect: "Saturn in 8th — chronic health watch; transformative karmic events", intensity: "High", lifeAreas: ["Longevity", "Hidden matters"] },
  9:  { effect: "Saturn in 9th — fortune delays; father's health; religious discipline", intensity: "Medium", lifeAreas: ["Fortune", "Father"] },
  10: { effect: "Saturn in 10th — career pressure; authority figures demanding; persevere", intensity: "High", lifeAreas: ["Career", "Authority"] },
  11: { effect: "Saturn in 11th — slow but steady gains; income through service", intensity: "Low", lifeAreas: ["Income", "Elder siblings"] },
  12: { effect: "Sade Sati rising — expenses begin; spiritual awakening; isolation phases", intensity: "Medium", lifeAreas: ["Expenses", "Foreign", "Spirituality"] },
};

// Month themes based on Sun's transit sign relative to natal Moon sign
const MONTH_THEMES_FROM_MOON: Record<number, { theme: string; favourable: boolean; message: string }> = {
  1:  { theme: "Identity & New Beginnings", favourable: true,  message: "Sun energises your Moon sign — vitality and confidence high" },
  2:  { theme: "Wealth & Family",           favourable: true,  message: "Focus on finances and home life; family connections strengthen" },
  3:  { theme: "Effort & Communication",    favourable: false, message: "Moderate period; avoid arguments, focus on clear communication" },
  4:  { theme: "Home & Inner Peace",        favourable: true,  message: "Rest, introspect, domestic harmony — good for real estate" },
  5:  { theme: "Creativity & Romance",      favourable: true,  message: "Express yourself freely; children, love, and investments favoured" },
  6:  { theme: "Health & Service",          favourable: false, message: "Watch health, manage debts; career through service shines" },
  7:  { theme: "Partnerships",              favourable: true,  message: "Relationships and collaborations come into focus" },
  8:  { theme: "Transformation",            favourable: false, message: "Subtle; depth, research, and inner transformation are active" },
  9:  { theme: "Fortune & Long Travel",     favourable: true,  message: "Luck supports; travel, higher learning, and dharma benefit" },
  10: { theme: "Career & Recognition",      favourable: true,  message: "Professional highs; authority and public image improve" },
  11: { theme: "Gains & Networking",        favourable: true,  message: "Income rises; social connections expand; elder siblings help" },
  12: { theme: "Rest & Spiritual Retreat",  favourable: false, message: "Spend less, meditate, prepare inwardly for the year ahead" },
};

// Lucky colours, numbers, mantras by Moon sign
const MOON_SIGN_META: Record<number, { colours: string[]; numbers: number[]; mantra: string; advice: string[] }> = {
  1:  { colours: ["Red", "Gold", "Orange"],         numbers: [1, 9],    mantra: "Om Mangalaya Namaha", advice: ["Channel aggression into action", "Lead with courage, not ego"] },
  2:  { colours: ["White", "Pink", "Light Green"],  numbers: [2, 6],    mantra: "Om Shukraya Namaha", advice: ["Stay grounded despite changes", "Invest in comfort, not luxury"] },
  3:  { colours: ["Green", "Yellow"],               numbers: [5, 14],   mantra: "Om Budhaya Namaha", advice: ["Read widely, communicate precisely", "Avoid indecision"] },
  4:  { colours: ["Silver", "White", "Sea Blue"],   numbers: [2, 7],    mantra: "Om Chandraya Namaha", advice: ["Protect your emotional boundaries", "Home is your power centre"] },
  5:  { colours: ["Gold", "Orange"],                numbers: [1, 5],    mantra: "Om Suryaya Namaha", advice: ["Lead generously", "Creative expression unlocks fortune"] },
  6:  { colours: ["Parrot Green", "Navy Blue"],     numbers: [5, 14],   mantra: "Om Budhaya Namaha", advice: ["Health is wealth — invest in it", "Serve others to earn Saturn's grace"] },
  7:  { colours: ["White", "Pink", "Pastel Blue"],  numbers: [6, 15],   mantra: "Om Shukraya Namaha", advice: ["Balance giving and receiving", "Legal clarity prevents misunderstandings"] },
  8:  { colours: ["Dark Red", "Maroon", "Black"],   numbers: [8, 17],   mantra: "Om Mangalaya Namaha", advice: ["Investigate before investing", "Transformation is your gift — embrace it"] },
  9:  { colours: ["Purple", "Yellow", "Orange"],    numbers: [3, 12],   mantra: "Om Brihaspataye Namaha", advice: ["Seek wisdom before action", "Long-distance opportunities reward patience"] },
  10: { colours: ["Black", "Navy Blue", "Brown"],   numbers: [8, 26],   mantra: "Om Sham Shanicharaya Namaha", advice: ["Discipline is your superpower", "Avoid shortcuts — Saturn watches"] },
  11: { colours: ["Electric Blue", "Violet"],       numbers: [4, 11],   mantra: "Om Sham Shanicharaya Namaha", advice: ["Serve community, gains multiply", "Innovate rather than follow"] },
  12: { colours: ["Sea Green", "Lavender", "White"],numbers: [3, 7],    mantra: "Om Brihaspataye Namaha", advice: ["Let go of what no longer serves", "Spiritual investment yields karmic returns"] },
};

// Quarter themes (cycling by year + moon sign)
function getQuarterForecast(moonSignNum: number, year: number, qIdx: number): QuarterForecast {
  const quarters: QuarterName[] = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"];
  const focuses: FocusArea[] = ["Career", "Relationships", "Health", "Finance", "Spirituality", "Travel"];
  const tones: QuarterForecast["tone"][] = ["Excellent", "Good", "Mixed", "Challenging"];

  // Rotate based on moon sign and quarter
  const focus = focuses[(moonSignNum + qIdx) % focuses.length] as FocusArea;
  const tone = tones[(year + moonSignNum + qIdx) % tones.length] as QuarterForecast["tone"];

  const quarter = quarters[qIdx] as QuarterName;

  const summaries: Record<FocusArea, Record<QuarterForecast["tone"], string>> = {
    Career: {
      Excellent: "Outstanding career opportunities — take decisive action on professional goals.",
      Good: "Steady professional progress; networking creates new openings.",
      Mixed: "Career advances with obstacles; balance ambition with patience.",
      Challenging: "Career pressure demands resilience; avoid major job changes.",
    },
    Relationships: {
      Excellent: "Relationships thrive — excellent for marriage, partnerships, and reconciliation.",
      Good: "Harmonious connections; communication improves naturally.",
      Mixed: "Relationships need conscious attention; avoid ego clashes.",
      Challenging: "Relationship tensions require mature handling; give space.",
    },
    Health: {
      Excellent: "Vitality is high — excellent time to start health routines.",
      Good: "Health stable; maintain existing routines and stay active.",
      Mixed: "Health fluctuates — monitor digestion and stress levels.",
      Challenging: "Health requires attention; avoid overexertion and late nights.",
    },
    Finance: {
      Excellent: "Financial gains likely — invest wisely and expand income streams.",
      Good: "Steady income; savings grow with discipline.",
      Mixed: "Income and expenses balance uneasily; budget carefully.",
      Challenging: "Avoid major financial risks; clear existing debts first.",
    },
    Spirituality: {
      Excellent: "Deep spiritual insights and progress — meditate, study, and serve.",
      Good: "Inner peace accessible; prayer and ritual bring clarity.",
      Mixed: "Seeking but not finding easily; keep the practice consistent.",
      Challenging: "Spiritual aridity — stick to your practices, breakthroughs come after.",
    },
    Travel: {
      Excellent: "Excellent for long-distance travel, relocation, and exploring new places.",
      Good: "Travel plans succeed with moderate planning.",
      Mixed: "Travel possible but with delays; plan buffer time.",
      Challenging: "Avoid long trips if possible; local activities are better.",
    },
  };

  const dos: Record<QuarterForecast["tone"], string[]> = {
    Excellent: ["Act boldly on opportunities", "Network widely", "Start new projects"],
    Good: ["Maintain momentum", "Build on existing strengths", "Plan for next quarter"],
    Mixed: ["Proceed with caution", "Consolidate before expanding", "Seek advice before major moves"],
    Challenging: ["Practice patience", "Reduce commitments", "Focus on inner resilience"],
  };
  const donts: Record<QuarterForecast["tone"], string[]> = {
    Excellent: ["Don't overextend", "Don't ignore relationships for work"],
    Good: ["Don't become complacent", "Don't skip routine maintenance"],
    Mixed: ["Don't make impulsive decisions", "Don't ignore warning signs"],
    Challenging: ["Don't force outcomes", "Don't take on new debts"],
  };

  return {
    quarter,
    focus,
    tone,
    summary: summaries[focus][tone],
    dos: dos[tone],
    donts: donts[tone],
  };
}

// ─── Main function ────────────────────────────────────────────────────────────

export function generateAnnualHoroscope(
  moonSignNum: number,
  year: number,
): AnnualHoroscopeReport {
  const moonSign = SIGN_NAMES[moonSignNum] ?? "Unknown";

  // Approximate Saturn and Jupiter positions for the given year
  // Saturn: ~2.46 years/sign from reference (Jan 2020 = Capricorn = 10)
  const SAT_REF_SIGN = 10; const SAT_REF_YEAR = 2020.04;
  const JUP_REF_SIGN = 10; const JUP_REF_YEAR = 2021.5; // Jupiter entered Aquarius ~2021

  const satSign = (((SAT_REF_SIGN - 1 + Math.floor((year - SAT_REF_YEAR) / 2.46)) % 12) + 12) % 12 + 1;
  const jupSign = (((JUP_REF_SIGN - 1 + Math.floor((year - JUP_REF_YEAR) / 1.0)) % 12) + 12) % 12 + 1;
  // Rahu moves ~18months/sign, retrograde (clockwise)
  const rahuSign = (((9 - 1 - Math.floor((year - 2020) / 1.5)) % 12) + 12) % 12 + 1;

  const jupFromMoon = ((jupSign - moonSignNum + 12) % 12) + 1;
  const satFromMoon = ((satSign - moonSignNum + 12) % 12) + 1;

  // Build slow transit effects
  const slowTransits: SlowTransitEffect[] = [
    {
      planet: "Jupiter",
      transitSign: SIGN_NAMES[jupSign] ?? "Unknown",
      transitSignNum: jupSign,
      relPosFromMoon: jupFromMoon,
      ...(JUPITER_FROM_MOON[jupFromMoon] ?? { effect: "Jupiter transit active", intensity: "Medium", lifeAreas: ["General"] }),
    },
    {
      planet: "Saturn",
      transitSign: SIGN_NAMES[satSign] ?? "Unknown",
      transitSignNum: satSign,
      relPosFromMoon: satFromMoon,
      ...(SATURN_FROM_MOON[satFromMoon] ?? { effect: "Saturn transit active", intensity: "Medium", lifeAreas: ["General"] }),
    },
    {
      planet: "Rahu",
      transitSign: SIGN_NAMES[rahuSign] ?? "Unknown",
      transitSignNum: rahuSign,
      relPosFromMoon: ((rahuSign - moonSignNum + 12) % 12) + 1,
      effect: "Rahu brings unconventional ambitions and unfamiliar opportunities in the transit sign area",
      intensity: "Medium",
      lifeAreas: ["Ambition", "Foreign influences", "Technology"],
    },
  ];

  // Year score (Jupiter position is the biggest factor)
  const jupScore = [1, 2, 4, 5, 6, 7, 9, 10, 11].includes(jupFromMoon) ? 70 : 35;
  const satPenalty = [1, 12, 4, 7, 8].includes(satFromMoon) ? -20 : 0;
  const yearScore = Math.max(20, Math.min(95, jupScore + satPenalty + 15));

  const yearVerdict =
    yearScore >= 75 ? "Highly Auspicious Year — Jupiter's blessings dominate. Major growth expected."
    : yearScore >= 55 ? "Good Year with some Saturn-induced challenges. Overall positive with effort."
    : yearScore >= 40 ? "Mixed Year — Balance opportunities carefully with Saturn's demands."
    : "Challenging Year — Saturn's influence is strong. Focus on discipline and inner resilience.";

  // Month forecasts
  const months: MonthForecast[] = MONTH_NAMES.map((monthName, i) => {
    const sunSign = SUN_SIGN_BY_MONTH[i] ?? 1;
    const sunFromMoon = ((sunSign - moonSignNum + 12) % 12) + 1;
    const themeData = MONTH_THEMES_FROM_MOON[sunFromMoon] ?? { theme: "Active", favourable: true, message: "General activity" };
    return {
      month: monthName,
      theme: themeData.theme,
      sunSign: SIGN_NAMES[sunSign] ?? "Unknown",
      favourable: themeData.favourable,
      keyMessage: themeData.message,
    };
  });

  // Lucky and challenging months
  const luckyMonths = months.filter(m => m.favourable).slice(0, 4).map(m => m.month);
  const challengingMonths = months.filter(m => !m.favourable).slice(0, 3).map(m => m.month);

  // Quarters
  const quarters: QuarterForecast[] = [0, 1, 2, 3].map(i => getQuarterForecast(moonSignNum, year, i));

  // Theme
  const overallTheme =
    yearScore >= 75 ? "Expansion and Abundance — embrace growth with gratitude"
    : yearScore >= 55 ? "Steady Progress — discipline meets opportunity"
    : yearScore >= 40 ? "Patience and Restructuring — Saturn teaches, Jupiter rewards later"
    : "Inner Strength — karmic lessons shape a stronger self";

  const meta = MOON_SIGN_META[moonSignNum] ?? { colours: ["Gold"], numbers: [1, 5], mantra: "Om Namah Shivaya", advice: ["Stay disciplined"] };

  return {
    year,
    moonSign,
    moonSignNum,
    yearScore,
    yearVerdict,
    overallTheme,
    slowTransits,
    months,
    quarters,
    luckyMonths,
    challengingMonths,
    luckyNumbers: meta.numbers,
    luckyColours: meta.colours,
    yearMantra: meta.mantra,
    keyAdvice: meta.advice,
  };
}
