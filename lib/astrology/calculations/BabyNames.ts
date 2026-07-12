/**
 * Baby Name Suggestion Engine
 *
 * Classical Jyotish: Baby's Moon nakshatra at birth determines the
 * auspicious starting syllable (akshara) for naming.
 *
 * Nakshatra → Pada → Starting syllables mapping (classical Vedic tradition).
 * Optional: filter by numerology compatibility with parents' life path.
 */

import { reduceToSingleDigit, calculateLifePathNumber } from "./LuckyNumbers";

// ─── Nakshatra Syllable Map ───────────────────────────────────────────────────

interface NakshatraSyllables {
  name: string;
  number: number;
  deity: string;
  syllables: string[]; // all 4 padas
}

const NAKSHATRA_SYLLABLES: NakshatraSyllables[] = [
  { number: 1,  name: "Ashwini",          deity: "Ashwini Kumaras", syllables: ["Chu", "Che", "Cho", "La"] },
  { number: 2,  name: "Bharani",           deity: "Yama",            syllables: ["Li", "Lu", "Le", "Lo"] },
  { number: 3,  name: "Krittika",          deity: "Agni",            syllables: ["Aa", "Ii", "Uu", "Ee"] },
  { number: 4,  name: "Rohini",            deity: "Brahma",          syllables: ["Oo", "Va", "Vi", "Vu"] },
  { number: 5,  name: "Mrigashira",        deity: "Soma/Moon",       syllables: ["Ve", "Vo", "Ka", "Ki"] },
  { number: 6,  name: "Ardra",             deity: "Rudra",           syllables: ["Ku", "Gha", "Nga", "Ja"] },
  { number: 7,  name: "Punarvasu",         deity: "Aditi",           syllables: ["Ke", "Ko", "Ha", "Hi"] },
  { number: 8,  name: "Pushya",            deity: "Brihaspati",      syllables: ["Hu", "He", "Ho", "Da"] },
  { number: 9,  name: "Ashlesha",          deity: "Nagas",           syllables: ["Di", "Du", "De", "Do"] },
  { number: 10, name: "Magha",             deity: "Pitris",          syllables: ["Ma", "Mi", "Mu", "Me"] },
  { number: 11, name: "Purva Phalguni",    deity: "Bhaga",           syllables: ["Mo", "Ta", "Ti", "Tu"] },
  { number: 12, name: "Uttara Phalguni",   deity: "Aryaman",         syllables: ["Te", "To", "Pa", "Pi"] },
  { number: 13, name: "Hasta",             deity: "Savitar",         syllables: ["Pu", "Sha", "Na", "Tha"] },
  { number: 14, name: "Chitra",            deity: "Vishvakarma",     syllables: ["Pe", "Po", "Ra", "Ri"] },
  { number: 15, name: "Swati",             deity: "Vayu",            syllables: ["Ru", "Re", "Ro", "Ta2"] },
  { number: 16, name: "Vishakha",          deity: "Indra-Agni",      syllables: ["Ti2", "Tu2", "Te2", "To2"] },
  { number: 17, name: "Anuradha",          deity: "Mitra",           syllables: ["Na2", "Ni", "Nu", "Ne"] },
  { number: 18, name: "Jyeshtha",          deity: "Indra",           syllables: ["No", "Ya", "Yi", "Yu"] },
  { number: 19, name: "Mula",              deity: "Nirriti",         syllables: ["Ye", "Yo", "Bha", "Bhi"] },
  { number: 20, name: "Purva Ashadha",     deity: "Apas",            syllables: ["Bhu", "Dha", "Pha", "Dha2"] },
  { number: 21, name: "Uttara Ashadha",    deity: "Vishvedeva",      syllables: ["Bhe", "Bho", "Ja2", "Ji"] },
  { number: 22, name: "Shravana",          deity: "Vishnu",          syllables: ["Khi", "Khu", "Khe", "Kho"] },
  { number: 23, name: "Dhanishtha",        deity: "Ashta Vasus",     syllables: ["Ga", "Gi", "Gu", "Ge"] },
  { number: 24, name: "Shatabhisha",       deity: "Varuna",          syllables: ["Go", "Sa", "Si", "Su"] },
  { number: 25, name: "Purva Bhadrapada",  deity: "Aja Ekapad",      syllables: ["Se", "So", "Da2", "Di2"] },
  { number: 26, name: "Uttara Bhadrapada", deity: "Ahir Budhnya",    syllables: ["Du2", "Tha2", "Jha", "Daa"] },
  { number: 27, name: "Revati",            deity: "Pushan",          syllables: ["De2", "Do2", "Cha", "Chi"] },
];

// ─── Display-friendly syllable labels (strip trailing numbers used to deduplicate) ──
function displaySyllable(s: string): string {
  return s.replace(/\d+$/, "");
}

// ─── Name example bank (keyed by canonical syllable) ─────────────────────────

type NameBank = Record<string, { male: string[]; female: string[]; neutral: string[] }>;

const NAME_EXAMPLES: NameBank = {
  Chu:  { male: ["Chudamani", "Chutesh"],            female: ["Chulbuli"],                  neutral: [] },
  Che:  { male: ["Chelvan"],                          female: ["Chelna"],                    neutral: [] },
  Cho:  { male: ["Chotu"],                            female: ["Chola"],                     neutral: [] },
  La:   { male: ["Lakshman", "Lalit"],                female: ["Lata", "Lakshmi", "Lalita"], neutral: ["Lav"] },
  Li:   { male: ["Linesh"],                           female: ["Lina", "Lila", "Lipika"],    neutral: [] },
  Lu:   { male: ["Luk"],                              female: ["Luna"],                      neutral: [] },
  Le:   { male: ["Lekh"],                             female: ["Lekha"],                     neutral: [] },
  Lo:   { male: ["Lokesh", "Loknath"],                female: ["Lopa", "Lopamudra"],         neutral: [] },
  Aa:   { male: ["Aarav", "Aakash", "Aadesh"],        female: ["Aanya", "Aastha"],           neutral: [] },
  Ii:   { male: ["Ishan"],                            female: ["Ira", "Isha"],               neutral: [] },
  Uu:   { male: ["Umesh"],                            female: ["Uma", "Usha"],               neutral: [] },
  Ee:   { male: ["Eklavya"],                          female: ["Ekta"],                      neutral: [] },
  Oo:   { male: ["Omkar", "Om"],                      female: [],                            neutral: ["Om"] },
  Va:   { male: ["Varun", "Vijay", "Vaibhav"],        female: ["Vandana", "Vaishnavi"],      neutral: ["Vanya"] },
  Vi:   { male: ["Vishal", "Vikram"],                 female: ["Vineeta", "Vidya", "Vibha"], neutral: [] },
  Vu:   { male: [],                                   female: [],                            neutral: [] },
  Ve:   { male: ["Veer", "Vedant", "Venkatesh"],      female: ["Veena", "Vedika"],           neutral: [] },
  Vo:   { male: [],                                   female: [],                            neutral: [] },
  Ka:   { male: ["Kamal", "Karan", "Kartik"],         female: ["Kavita", "Kanchan"],         neutral: ["Kavi"] },
  Ki:   { male: ["Kiran", "Kishan", "Kishore"],       female: ["Kinjal", "Kishori"],         neutral: ["Kiran"] },
  Ku:   { male: ["Kumar", "Kunal"],                   female: ["Kumari", "Kunti"],           neutral: [] },
  Gha:  { male: [],                                   female: [],                            neutral: [] },
  Nga:  { male: [],                                   female: [],                            neutral: [] },
  Ja:   { male: ["Jayesh", "Jatin", "Jaideep"],       female: ["Jaya", "Janki"],             neutral: [] },
  Ke:   { male: ["Keshav", "Kedar"],                  female: ["Ketaki"],                    neutral: [] },
  Ko:   { male: ["Komal"],                            female: ["Komal", "Koshi"],            neutral: [] },
  Ha:   { male: ["Harish", "Harsh", "Hari", "Hardik"],female: ["Harini", "Harsha"],         neutral: [] },
  Hi:   { male: ["Himanshu", "Hitesh"],               female: ["Hina", "Hiral", "Hema"],    neutral: [] },
  Hu:   { male: [],                                   female: [],                            neutral: [] },
  He:   { male: ["Hemant"],                           female: ["Hema", "Hemali"],            neutral: [] },
  Ho:   { male: [],                                   female: [],                            neutral: [] },
  Da:   { male: ["Daksh", "Darshan"],                 female: ["Daksha", "Damini"],          neutral: [] },
  Di:   { male: ["Dinesh", "Dilip"],                  female: ["Dimple", "Dipti", "Divya"],  neutral: [] },
  Du:   { male: ["Durgesh"],                          female: ["Durga", "Durba"],            neutral: [] },
  De:   { male: ["Dev", "Devesh", "Devansh"],         female: ["Devyani", "Deepa"],          neutral: [] },
  Do:   { male: [],                                   female: [],                            neutral: [] },
  Ma:   { male: ["Manish", "Manoj", "Mahesh"],        female: ["Madhuri", "Mansi"],          neutral: [] },
  Mi:   { male: ["Milan", "Mihir"],                   female: ["Mira", "Mitali", "Minakshi"],neutral: [] },
  Mu:   { male: ["Mukesh", "Mukund"],                 female: ["Mukta"],                     neutral: [] },
  Me:   { male: ["Mehul"],                            female: ["Meena", "Meghna", "Meera"],  neutral: [] },
  Mo:   { male: ["Mohan", "Mohit"],                   female: ["Mohini", "Mona"],            neutral: [] },
  Ta:   { male: ["Tarun", "Tanmay"],                  female: ["Tara", "Tanisha", "Tanya"],  neutral: [] },
  Ti:   { male: ["Tilak"],                            female: ["Tina", "Tisha"],             neutral: [] },
  Tu:   { male: [],                                   female: [],                            neutral: [] },
  Te:   { male: ["Tejasvi"],                          female: ["Tejaswi", "Tejal"],          neutral: [] },
  To:   { male: [],                                   female: [],                            neutral: [] },
  Pa:   { male: ["Param", "Parag", "Parth", "Pankaj"],female: ["Pallavi", "Payal"],         neutral: [] },
  Pi:   { male: ["Pinak"],                            female: ["Pinky"],                     neutral: [] },
  Pu:   { male: ["Purav"],                            female: ["Puja", "Purnima"],           neutral: [] },
  Sha:  { male: ["Shashank", "Sharad"],               female: ["Sharda", "Shaila"],          neutral: [] },
  Na:   { male: ["Naveen", "Naresh", "Nakul"],        female: ["Nandini", "Namrata"],        neutral: [] },
  Tha:  { male: [],                                   female: [],                            neutral: [] },
  Pe:   { male: [],                                   female: ["Preeti"],                    neutral: [] },
  Po:   { male: [],                                   female: ["Pooja", "Poorva"],           neutral: [] },
  Ra:   { male: ["Rahul", "Rajesh", "Ram"],           female: ["Radha", "Ragini"],           neutral: [] },
  Ri:   { male: ["Rishabh", "Rishi"],                 female: ["Ritu", "Riddhi", "Rita"],    neutral: [] },
  Ru:   { male: ["Rupesh", "Ruchir"],                 female: ["Ruchi", "Rupa"],             neutral: [] },
  Re:   { male: [],                                   female: ["Rekha", "Reshma"],           neutral: [] },
  Ro:   { male: ["Rohit", "Rohan"],                   female: ["Rohini", "Roma"],            neutral: [] },
  Ta2:  { male: ["Tarang"],                           female: ["Tarini"],                    neutral: [] },
  Ti2:  { male: [],                                   female: [],                            neutral: [] },
  Tu2:  { male: [],                                   female: [],                            neutral: [] },
  Te2:  { male: [],                                   female: [],                            neutral: [] },
  To2:  { male: [],                                   female: [],                            neutral: [] },
  Na2:  { male: [],                                   female: [],                            neutral: [] },
  Ni:   { male: ["Nikhil", "Nilesh", "Nitin"],        female: ["Nisha", "Nidhi"],            neutral: [] },
  Nu:   { male: [],                                   female: [],                            neutral: [] },
  Ne:   { male: [],                                   female: [],                            neutral: [] },
  No:   { male: [],                                   female: [],                            neutral: [] },
  Ya:   { male: ["Yash", "Yatharth"],                 female: ["Yashoda", "Yamuna"],         neutral: [] },
  Yi:   { male: [],                                   female: [],                            neutral: [] },
  Yu:   { male: ["Yuvraj", "Yug"],                    female: ["Yukta"],                     neutral: [] },
  Ye:   { male: [],                                   female: [],                            neutral: [] },
  Yo:   { male: [],                                   female: [],                            neutral: [] },
  Bha:  { male: ["Bhaskar", "Bharat"],                female: ["Bhavna", "Bharati"],         neutral: [] },
  Bhi:  { male: ["Bhishma"],                          female: [],                            neutral: [] },
  Bhu:  { male: ["Bhuvan"],                           female: ["Bhumi", "Bhuvana"],          neutral: [] },
  Dha:  { male: ["Dharmesh", "Dhruv"],                female: ["Dharini"],                   neutral: [] },
  Pha:  { male: [],                                   female: [],                            neutral: [] },
  Dha2: { male: [],                                   female: [],                            neutral: [] },
  Bhe:  { male: [],                                   female: [],                            neutral: [] },
  Bho:  { male: ["Bhola"],                            female: [],                            neutral: [] },
  Ja2:  { male: ["Jatin"],                            female: ["Jinisha"],                   neutral: [] },
  Ji:   { male: ["Jignesh", "Jitendra"],              female: [],                            neutral: [] },
  Khi:  { male: [],                                   female: [],                            neutral: [] },
  Khu:  { male: [],                                   female: [],                            neutral: [] },
  Khe:  { male: [],                                   female: [],                            neutral: [] },
  Kho:  { male: [],                                   female: [],                            neutral: [] },
  Ga:   { male: ["Gaurav", "Ganesh", "Gautam"],       female: ["Garima", "Gayatri", "Gauri"],neutral: [] },
  Gi:   { male: ["Girish"],                           female: ["Gita", "Girija"],            neutral: [] },
  Gu:   { male: ["Gulab"],                            female: ["Gunjita"],                   neutral: [] },
  Ge:   { male: [],                                   female: [],                            neutral: [] },
  Go:   { male: ["Govind", "Gopal"],                  female: [],                            neutral: [] },
  Sa:   { male: ["Sarthak", "Sanjay", "Samir"],       female: ["Sara", "Savita"],            neutral: [] },
  Si:   { male: ["Siddhant", "Siddharth"],            female: ["Sindhu", "Simran"],          neutral: [] },
  Su:   { male: ["Suresh", "Sunil"],                  female: ["Sushma", "Sunita"],          neutral: [] },
  Se:   { male: [],                                   female: [],                            neutral: [] },
  So:   { male: ["Sohan", "Somnath"],                 female: ["Sonal", "Soma"],             neutral: [] },
  Da2:  { male: ["Darsh"],                            female: [],                            neutral: [] },
  Di2:  { male: ["Digvijay"],                         female: ["Dipali"],                    neutral: [] },
  Du2:  { male: [],                                   female: [],                            neutral: [] },
  Tha2: { male: [],                                   female: [],                            neutral: [] },
  Jha:  { male: [],                                   female: [],                            neutral: [] },
  Daa:  { male: ["Daanish"],                          female: ["Daani"],                     neutral: [] },
  De2:  { male: [],                                   female: [],                            neutral: [] },
  Do2:  { male: [],                                   female: [],                            neutral: [] },
  Cha:  { male: ["Chandan", "Chaturvedi"],            female: ["Chandrika", "Chanda"],       neutral: [] },
  Chi:  { male: ["Chintan", "Chiranjiv"],             female: ["Chitra", "Chika"],           neutral: [] },
};

// ─── Output types ─────────────────────────────────────────────────────────────

export interface BabyNameSuggestion {
  syllable: string;          // display (e.g. "Ta")
  numerologyValue: number;
  numerologyMeaning: string;
  maleSuggestions: string[];
  femaleSuggestions: string[];
  neutralSuggestions: string[];
  compatibilityWithParent?: "Excellent" | "Good" | "Average" | "Neutral" | "Challenging";
}

export interface BabyNameReport {
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraDeity: string;
  gender: "Male" | "Female" | "Any";
  auspiciousSyllables: string[];
  suggestions: BabyNameSuggestion[];
  parentLifePathNumber?: number;
  generalGuidance: string;
}

// ─── Compatibility check ──────────────────────────────────────────────────────

const COMPAT_PAIRS: Record<string, "Excellent" | "Good" | "Average" | "Neutral" | "Challenging"> = {
  "1-2": "Excellent", "1-4": "Good", "1-7": "Excellent",
  "2-4": "Excellent", "2-7": "Excellent", "2-6": "Excellent",
  "3-6": "Excellent", "3-9": "Excellent", "3-5": "Good",
  "4-8": "Excellent", "5-6": "Excellent", "5-3": "Good",
  "6-9": "Excellent", "6-3": "Excellent",
  "7-2": "Excellent", "7-1": "Excellent",
};

function getCompatibility(a: number, b: number): "Excellent" | "Good" | "Average" | "Neutral" | "Challenging" {
  const k1 = `${a}-${b}`, k2 = `${b}-${a}`;
  return COMPAT_PAIRS[k1] ?? COMPAT_PAIRS[k2] ?? (a === b ? "Good" : "Neutral");
}

// ─── Pythagorean letter value ─────────────────────────────────────────────────

const PYTHAGOREAN: Record<string, number> = {
  A:1,J:1,S:1, B:2,K:2,T:2, C:3,L:3,U:3, D:4,M:4,V:4,
  E:5,N:5,W:5, F:6,O:6,X:6, G:7,P:7,Y:7, H:8,Q:8,Z:8, I:9,R:9,
};

function nameNumber(s: string): number {
  const total = s.toUpperCase().replace(/[^A-Z]/g, "").split("")
    .reduce((sum, ch) => sum + (PYTHAGOREAN[ch] ?? 0), 0);
  return reduceToSingleDigit(total || 1);
}

const NUM_KEYWORDS: Record<number, string> = {
  1:"Leadership", 2:"Harmony", 3:"Creativity", 4:"Stability",
  5:"Freedom", 6:"Love", 7:"Wisdom", 8:"Power", 9:"Completion",
};

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Calculate baby name suggestions from Moon nakshatra longitude.
 * moonLongitude: 0–360 degrees (sidereal)
 */
export function generateBabyNameReport(
  moonLongitude: number,
  gender: "Male" | "Female" | "Any",
  parentDob?: Date,
): BabyNameReport {
  // Nakshatra index: each spans 13°20' = 13.333°. Clamped to [0,26] so never undefined.
  const idx = Math.min(Math.floor(moonLongitude / (360 / 27)), 26);
  const nakshatra: NakshatraSyllables = NAKSHATRA_SYLLABLES[idx] as NakshatraSyllables;

  const parentLifePathNumber = parentDob ? calculateLifePathNumber(parentDob) : undefined;

  const suggestions: BabyNameSuggestion[] = nakshatra.syllables.map(rawSyl => {
    const display = displaySyllable(rawSyl);
    const numVal = nameNumber(display);
    const bank = NAME_EXAMPLES[rawSyl] ?? { male: [], female: [], neutral: [] };

    return {
      syllable: display,
      numerologyValue: numVal,
      numerologyMeaning: NUM_KEYWORDS[numVal] ?? "Balance",
      maleSuggestions: gender !== "Female" ? bank.male : [],
      femaleSuggestions: gender !== "Male" ? bank.female : [],
      neutralSuggestions: bank.neutral,
      compatibilityWithParent: parentLifePathNumber
        ? getCompatibility(numVal, parentLifePathNumber)
        : undefined,
    };
  });

  // Sort so best compatibility padas come first
  const order: Record<string, number> = { Excellent: 0, Good: 1, Neutral: 2, Average: 3, Challenging: 4 };
  suggestions.sort((a, b) =>
    (order[a.compatibilityWithParent ?? "Neutral"] ?? 2) -
    (order[b.compatibilityWithParent ?? "Neutral"] ?? 2)
  );

  const sylList = nakshatra.syllables.map(displaySyllable).join(", ");

  return {
    nakshatra: nakshatra.name,
    nakshatraNumber: nakshatra.number,
    nakshatraDeity: nakshatra.deity,
    gender,
    auspiciousSyllables: nakshatra.syllables.map(displaySyllable),
    suggestions,
    parentLifePathNumber,
    generalGuidance:
      `Baby born under ${nakshatra.name} nakshatra (ruled by ${nakshatra.deity}). ` +
      `Auspicious starting syllables: ${sylList}. ` +
      `Select a name beginning with one of these syllables for long-term prosperity and health. ` +
      `Names should be easy to pronounce and carry a positive meaning.`,
  };
}
