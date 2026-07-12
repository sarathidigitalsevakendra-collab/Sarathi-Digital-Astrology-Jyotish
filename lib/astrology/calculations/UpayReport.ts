/**
 * Upay / Remedy Report  
 *
 * Comprehensive personalised remedy system based on:
 * 1. Current Mahadasha / Antardasha planet
 * 2. Natal Moon sign (Rashi)
 * 3. Lagna (Ascendant) sign
 * 4. Any active dosha (Kaal Sarp, Manglik, Sade Sati)
 *
 * Covers: mantras, fastings, gemstones, charities, yantras, colours, foods,
 * temple visits, plants, and lifestyle practices.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type RemedyCategory =
  | "Mantra" | "Fasting" | "Gemstone" | "Donation" | "Yantra"
  | "Colour" | "Plant" | "Lifestyle" | "Temple" | "Food";

export interface UpayItem {
  category: RemedyCategory;
  planet: string;
  title: string;
  detail: string;
  frequency: string;
  priority: "High" | "Medium" | "Low";
}

export interface UpayReport {
  dashaRemedy: UpayItem[];
  moonSignRemedy: UpayItem[];
  lagnaRemedy: UpayItem[];
  doshaRemedy: UpayItem[];
  generalWellbeing: UpayItem[];
  allRemedies: UpayItem[];
  topThree: UpayItem[];
  summary: string;
}

// ─── Planet remedy data ───────────────────────────────────────────────────────

interface PlanetUpay {
  mantra: string;
  mantraCount: string;
  fastingDay: string;
  gemstone: string;
  gemstoneAlternate: string;
  yantra: string;
  donationItems: string;
  donationDay: string;
  colour: string;
  avoidColour: string;
  planet_deity: string;
  temple: string;
  plant: string;
  food: string;
  lifestyle: string;
}

const PLANET_UPAY: Record<string, PlanetUpay> = {
  Sun: {
    mantra: "Om Hraam Hreem Hraum Sah Suryaya Namaha",
    mantraCount: "6,000 times (in sets of 108)",
    fastingDay: "Sunday",
    gemstone: "Ruby (Manik)",
    gemstoneAlternate: "Red Garnet or Red Spinel",
    yantra: "Surya Yantra (gold/copper)",
    donationItems: "Wheat, copper, red cloth, jaggery",
    donationDay: "Sunday morning",
    colour: "Gold, Orange, Red",
    avoidColour: "Black",
    planet_deity: "Surya Dev / Lord Rama",
    temple: "Surya temples (Konark, Modhera)",
    plant: "Bel tree, Sunflower",
    food: "Wheat, saffron, honey",
    lifestyle: "Wake before sunrise, practice Surya Namaskar, avoid ego-driven decisions",
  },
  Moon: {
    mantra: "Om Shraam Shreem Shraum Sah Chandraya Namaha",
    mantraCount: "10,000 times (in sets of 108)",
    fastingDay: "Monday",
    gemstone: "Pearl (Moti)",
    gemstoneAlternate: "Moonstone or White Coral",
    yantra: "Chandra Yantra (silver)",
    donationItems: "Milk, rice, white cloth, silver",
    donationDay: "Monday evening (moon rise)",
    colour: "White, Silver, Cream",
    avoidColour: "Dark Red",
    planet_deity: "Lord Shiva / Goddess Parvati",
    temple: "Shiva temples on Mondays",
    plant: "Jasmine, white lotus",
    food: "Milk, curd, rice kheer",
    lifestyle: "Sleep early, avoid emotional outbursts, meditate near water",
  },
  Mars: {
    mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namaha",
    mantraCount: "7,000 times (in sets of 108)",
    fastingDay: "Tuesday",
    gemstone: "Red Coral (Moonga)",
    gemstoneAlternate: "Carnelian or Red Jasper",
    yantra: "Mangal Yantra (copper)",
    donationItems: "Red lentils (masoor dal), red cloth, copper",
    donationDay: "Tuesday",
    colour: "Red, Scarlet",
    avoidColour: "Green",
    planet_deity: "Lord Hanuman / Kartikeya",
    temple: "Hanuman temple on Tuesdays",
    plant: "Red flowers, Kaner",
    food: "Red lentils, beetroot",
    lifestyle: "Channel energy into sports or exercise, avoid aggression and conflicts",
  },
  Mercury: {
    mantra: "Om Braam Breem Braum Sah Budhaya Namaha",
    mantraCount: "17,000 times (in sets of 108)",
    fastingDay: "Wednesday",
    gemstone: "Emerald (Panna)",
    gemstoneAlternate: "Green Tourmaline or Peridot",
    yantra: "Budha Yantra (gold/silver)",
    donationItems: "Green gram (moong), green cloth, books",
    donationDay: "Wednesday",
    colour: "Green, Parrot Green",
    avoidColour: "Red",
    planet_deity: "Lord Vishnu / Goddess Saraswati",
    temple: "Vishnu temples on Wednesdays",
    plant: "Green gram plant, Tulsi",
    food: "Green vegetables, moong dal",
    lifestyle: "Study regularly, practice clear communication, read and write daily",
  },
  Jupiter: {
    mantra: "Om Graam Greem Graum Sah Gurave Namaha",
    mantraCount: "16,000 times (in sets of 108)",
    fastingDay: "Thursday",
    gemstone: "Yellow Sapphire (Pukhraj)",
    gemstoneAlternate: "Citrine or Yellow Topaz",
    yantra: "Guru Yantra (gold)",
    donationItems: "Chana dal, turmeric, yellow cloth, gold",
    donationDay: "Thursday",
    colour: "Yellow, Golden",
    avoidColour: "Black",
    planet_deity: "Lord Vishnu / Brihaspati Dev",
    temple: "Vishnu or Brihaspati temple on Thursdays",
    plant: "Banana tree, Peepal",
    food: "Chana dal, yellow foods, ghee",
    lifestyle: "Seek knowledge, respect teachers and elders, be generous",
  },
  Venus: {
    mantra: "Om Draam Dreem Draum Sah Shukraya Namaha",
    mantraCount: "20,000 times (in sets of 108)",
    fastingDay: "Friday",
    gemstone: "Diamond",
    gemstoneAlternate: "White Zircon or White Sapphire",
    yantra: "Shukra Yantra (silver)",
    donationItems: "White rice, curd, ghee, white silk",
    donationDay: "Friday",
    colour: "White, Pink, Light Blue",
    avoidColour: "Dark colours",
    planet_deity: "Goddess Lakshmi / Shukracharya",
    temple: "Devi (Lakshmi/Durga) temples on Fridays",
    plant: "White rose, Jasmine, Mogra",
    food: "Curd, sweets, white foods",
    lifestyle: "Cultivate beauty, arts, music; maintain relationships with kindness",
  },
  Saturn: {
    mantra: "Om Praam Preem Praum Sah Shanaicharaya Namaha",
    mantraCount: "19,000 times (in sets of 108)",
    fastingDay: "Saturday",
    gemstone: "Blue Sapphire (Neelam)",
    gemstoneAlternate: "Amethyst or Blue Topaz",
    yantra: "Shani Yantra (iron/silver)",
    donationItems: "Black sesame, mustard oil, iron, black cloth",
    donationDay: "Saturday",
    colour: "Dark Blue, Black, Grey",
    avoidColour: "Red",
    planet_deity: "Lord Shani / Lord Hanuman",
    temple: "Shani temple on Saturdays (Shani Shingnapur)",
    plant: "Shami tree, Neem",
    food: "Black sesame, urad dal",
    lifestyle: "Serve the poor, be disciplined and punctual, avoid shortcuts",
  },
  Rahu: {
    mantra: "Om Bhram Bhreem Bhraum Sah Rahave Namaha",
    mantraCount: "18,000 times (in sets of 108)",
    fastingDay: "Saturday",
    gemstone: "Hessonite Garnet (Gomed)",
    gemstoneAlternate: "Zircon or Agate",
    yantra: "Rahu Yantra (lead/silver)",
    donationItems: "Black gram (urad), coconut, blue flowers",
    donationDay: "Saturday",
    colour: "Dark Blue, Smoky Grey",
    avoidColour: "Red, Orange",
    planet_deity: "Goddess Durga / Lord Bhairav",
    temple: "Rahu temple (Thirunageswaram near Kumbakonam)",
    plant: "Durva grass, Neem",
    food: "Black gram, dark lentils",
    lifestyle: "Avoid dishonesty, foreign travel risks; meditate to reduce confusion",
  },
  Ketu: {
    mantra: "Om Sraam Sreem Sraum Sah Ketave Namaha",
    mantraCount: "7,000 times (in sets of 108)",
    fastingDay: "Tuesday",
    gemstone: "Cat's Eye (Lahsuniya)",
    gemstoneAlternate: "Tiger's Eye or Tourmaline",
    yantra: "Ketu Yantra (silver)",
    donationItems: "Sesame, blankets, stray dog feeding",
    donationDay: "Tuesday or Thursday",
    colour: "Smoky, Multi-colour",
    avoidColour: "Bright red",
    planet_deity: "Lord Ganesha / Chitragupta",
    temple: "Ganesha temple on Tuesdays",
    plant: "Kush grass, Durvankur",
    food: "Sesame, mixed grains",
    lifestyle: "Practice detachment, engage in spiritual study, avoid addictions",
  },
};

// ─── Moon sign / Lagna based general remedies ─────────────────────────────────

const RASHI_REMEDIES: Record<number, { planet: string; extraLifestyle: string }> = {
  1:  { planet: "Mars",    extraLifestyle: "Practice patience daily — Mars urgency needs tempering" },
  2:  { planet: "Venus",   extraLifestyle: "Cultivate gratitude; avoid materialism" },
  3:  { planet: "Mercury", extraLifestyle: "Write a journal daily; engage in learning" },
  4:  { planet: "Moon",    extraLifestyle: "Stay near water, practice emotional regulation" },
  5:  { planet: "Sun",     extraLifestyle: "Lead with humility; respect authority figures" },
  6:  { planet: "Mercury", extraLifestyle: "Maintain strict diet and health routines" },
  7:  { planet: "Venus",   extraLifestyle: "Balance giving and receiving in relationships" },
  8:  { planet: "Mars",    extraLifestyle: "Channel intensity into transformation, not destruction" },
  9:  { planet: "Jupiter", extraLifestyle: "Study scriptures or philosophy; be generous" },
  10: { planet: "Saturn",  extraLifestyle: "Work diligently; avoid cutting corners" },
  11: { planet: "Saturn",  extraLifestyle: "Serve community; expand your social contribution" },
  12: { planet: "Jupiter", extraLifestyle: "Meditate daily; practice detached service" },
};

// ─── Build remedy items from planet data ──────────────────────────────────────

function buildPlanetRemedies(
  planet: string,
  _reason: string,
  priority: UpayItem["priority"],
): UpayItem[] {
  const u = PLANET_UPAY[planet];
  if (!u) return [];

  return [
    { category: "Mantra", planet, title: `${planet} Mantra`, detail: `${u.mantra} — ${u.mantraCount}`, frequency: "Daily", priority },
    { category: "Fasting", planet, title: `${planet} Fasting`, detail: `Fast on ${u.fastingDay}s — consume only fruits, milk, or simple sattvic food`, frequency: `Every ${u.fastingDay}`, priority },
    { category: "Gemstone", planet, title: `${planet} Gemstone`, detail: `Wear ${u.gemstone} (or ${u.gemstoneAlternate}) in ${getMetalForPlanet(planet)} — consult a Jyotishi for weight and finger`, frequency: "Ongoing", priority },
    { category: "Donation", planet, title: `${planet} Charity`, detail: `Donate ${u.donationItems} — ${u.donationDay}`, frequency: `Every ${u.donationDay}`, priority },
    { category: "Yantra", planet, title: `${planet} Yantra`, detail: `Install and energise ${u.yantra} in your home puja space — east-facing`, frequency: "Ongoing", priority },
    { category: "Colour", planet, title: `${planet} Colours`, detail: `Wear/use ${u.colour}. Avoid ${u.avoidColour} (weakens ${planet})`, frequency: "Daily", priority },
    { category: "Plant", planet, title: `${planet} Plant`, detail: `Grow or offer ${u.plant} near your home or temple`, frequency: "Weekly care", priority },
    { category: "Temple", planet, title: `${planet} Temple Visit`, detail: `Visit ${u.temple}. Offer: ${u.donationItems}`, frequency: `Every ${u.fastingDay}`, priority },
    { category: "Food", planet, title: `${planet} Diet`, detail: `Include ${u.food} in diet on ${u.fastingDay}s`, frequency: `Every ${u.fastingDay}`, priority },
    { category: "Lifestyle", planet, title: `${planet} Lifestyle`, detail: `${u.lifestyle}`, frequency: "Daily", priority },
  ];
}

function getMetalForPlanet(planet: string): string {
  const metals: Record<string, string> = {
    Sun: "gold", Moon: "silver", Mars: "copper/gold", Mercury: "gold",
    Jupiter: "gold", Venus: "silver/platinum", Saturn: "iron/silver",
    Rahu: "silver", Ketu: "silver",
  };
  return metals[planet] ?? "silver";
}

// ─── Main function ────────────────────────────────────────────────────────────

export interface UpayInput {
  currentMahadashaPlanet: string;
  currentAntardashaPlanet?: string;
  moonSignNum: number;        // 1–12
  lagnaSignNum: number;       // 1–12
  hasSadeSati?: boolean;
  hasKaalSarp?: boolean;
  hasManglik?: boolean;
}

export function generateUpayReport(input: UpayInput): UpayReport {
  const {
    currentMahadashaPlanet,
    currentAntardashaPlanet,
    moonSignNum,
    lagnaSignNum,
    hasSadeSati,
    hasKaalSarp,
    hasManglik,
  } = input;

  // 1. Dasha-based
  const dashaRemedy = buildPlanetRemedies(currentMahadashaPlanet, "Current Mahadasha", "High");
  if (currentAntardashaPlanet && currentAntardashaPlanet !== currentMahadashaPlanet) {
    dashaRemedy.push(...buildPlanetRemedies(currentAntardashaPlanet, "Current Antardasha", "High").slice(0, 3));
  }

  // 2. Moon sign
  const moonPlanet = RASHI_REMEDIES[moonSignNum]?.planet ?? "Moon";
  const extraLifestyle = RASHI_REMEDIES[moonSignNum]?.extraLifestyle ?? "";
  const moonSignRemedy = buildPlanetRemedies(moonPlanet, "Natal Moon", "Medium");
  if (extraLifestyle) {
    moonSignRemedy.push({
      category: "Lifestyle",
      planet: moonPlanet,
      title: "Moon Sign Lifestyle Practice",
      detail: extraLifestyle,
      frequency: "Daily",
      priority: "Medium",
    });
  }

  // 3. Lagna
  const lagnaPlanet = RASHI_REMEDIES[lagnaSignNum]?.planet ?? "Sun";
  const lagnaRemedy = buildPlanetRemedies(lagnaPlanet, "Ascendant ruler", "Medium").slice(0, 5);

  // 4. Dosha-specific
  const doshaRemedy: UpayItem[] = [];
  if (hasSadeSati) {
    doshaRemedy.push(
      { category: "Mantra", planet: "Saturn", title: "Sade Sati Mantra", detail: "Recite Shani Stotra or Hanuman Chalisa every Saturday", frequency: "Every Saturday", priority: "High" },
      { category: "Fasting", planet: "Saturn", title: "Sade Sati Fast", detail: "Fast on Saturdays — consume only one meal", frequency: "Every Saturday", priority: "High" },
      { category: "Donation", planet: "Saturn", title: "Shani Donation", detail: "Donate black sesame, mustard oil, and iron articles on Saturdays", frequency: "Every Saturday", priority: "High" },
    );
  }
  if (hasKaalSarp) {
    doshaRemedy.push(
      { category: "Temple", planet: "Rahu", title: "Kaal Sarp Puja", detail: "Perform Kaal Sarp Dosha Nivaran Puja at Trimbakeshwar or Ujjain", frequency: "Once (or annually)", priority: "High" },
      { category: "Mantra", planet: "Rahu", title: "Nag Mantra", detail: "Om Namo Bhagavate Vasudevaya — 108 times daily + Nag Panchami puja annually", frequency: "Daily", priority: "High" },
    );
  }
  if (hasManglik) {
    doshaRemedy.push(
      { category: "Mantra", planet: "Mars", title: "Manglik Remedy Mantra", detail: "Om Angarakaya Namaha — 108 times on Tuesdays", frequency: "Every Tuesday", priority: "High" },
      { category: "Lifestyle", planet: "Mars", title: "Kumbh Vivah Guidance", detail: "Consider Kumbh Vivah (symbolic marriage to Vishnu idol / banana tree) before the wedding", frequency: "Once", priority: "High" },
    );
  }

  // 5. General wellbeing (always)
  const generalWellbeing: UpayItem[] = [
    { category: "Lifestyle", planet: "Sun", title: "Surya Namaskar", detail: "Perform 12 rounds of Surya Namaskar at sunrise daily for health and positive energy", frequency: "Daily", priority: "Medium" },
    { category: "Mantra", planet: "Jupiter", title: "Gayatri Mantra", detail: "Om Bhur Bhuvah Svah… — 108 times at sunrise. Universal positive mantra for all charts.", frequency: "Daily", priority: "Medium" },
    { category: "Lifestyle", planet: "Moon", title: "Moon Meditation", detail: "On full moon nights, meditate for 20 minutes facing the moon — boosts emotional peace", frequency: "Monthly (full moon)", priority: "Low" },
    { category: "Plant", planet: "Mercury", title: "Tulsi Plant", detail: "Keep a Tulsi plant at the entrance — purifies the home and strengthens Mercury and Moon", frequency: "Water daily", priority: "Low" },
    { category: "Lifestyle", planet: "Saturn", title: "Service Practice", detail: "Volunteer or serve the underprivileged — Saturday service pacifies Saturn regardless of chart", frequency: "Weekly", priority: "Medium" },
  ];

  // Combine all
  const allRemedies = [...dashaRemedy, ...moonSignRemedy, ...lagnaRemedy, ...doshaRemedy, ...generalWellbeing];

  // Top 3 = High priority only, deduplicated by title
  const seen = new Set<string>();
  const topThree = allRemedies
    .filter(r => r.priority === "High")
    .filter(r => { if (seen.has(r.title)) return false; seen.add(r.title); return true; })
    .slice(0, 3);

  const activeDoshas = [hasSadeSati && "Sade Sati", hasKaalSarp && "Kaal Sarp", hasManglik && "Manglik Dosha"]
    .filter(Boolean).join(", ") || "none";

  const summary = `Personalised remedies for ${currentMahadashaPlanet} Mahadasha` +
    (currentAntardashaPlanet ? ` / ${currentAntardashaPlanet} Antardasha` : "") +
    `. Active doshas: ${activeDoshas}. Follow High-priority remedies consistently for best results.`;

  return { dashaRemedy, moonSignRemedy, lagnaRemedy, doshaRemedy, generalWellbeing, allRemedies, topThree, summary };
}
