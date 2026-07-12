/**
 * Remedies Generator
 * 
 * Generates simple, classical remedies based on planetary analysis.
 * Logic:
 * 1. Identify "Weak Functional Benefics" -> Suggest Gemstones (Strengthening).
 * 2. Identify "Strong/Afflicted Functional Malefics" -> Suggest Chants/Donations (Propitiation).
 * 3. General Remedies based on Moon/Ascendant or Dasha (MVP: Static Planet remedies).
 */

import { FunctionalNature, DignityLevel } from "./Dignity";

export interface Remedy {
  planet: string;
  type: "Gemstone" | "Chant" | "Lifestyle" | "Donation";
  description: string;
  reason: string;
}

const GEMSTONES: Record<string, string> = {
  Sun: "Ruby (Manik)",
  Moon: "Pearl (Moti)",
  Mars: "Red Coral (Moonga)",
  Mercury: "Emerald (Panna)",
  Jupiter: "Yellow Sapphire (Pukhraj)",
  Venus: "Diamond or White Zircon",
  Saturn: "Blue Sapphire (Neelam)",
  Rahu: "Hessonite (Gomed)",
  Ketu: "Cat's Eye (Lehsunia)"
};

const CHANTS: Record<string, string> = {
  Sun: "Om Suryaya Namaha",
  Moon: "Om Chandraya Namaha",
  Mars: "Om Angarakaya Namaha",
  Mercury: "Om Budhaya Namaha",
  Jupiter: "Om Brihaspataye Namaha",
  Venus: "Om Shukraya Namaha",
  Saturn: "Om Sham Shanicharaya Namaha",
  Rahu: "Om Rahave Namaha",
  Ketu: "Om Ketave Namaha"
};

const DONATIONS: Record<string, string> = {
  Sun: "Wheat, copper, or red clothes on Sundays.",
  Moon: "Milk, rice, or white clothes on Mondays.",
  Mars: "Red lentils (masoor dal) on Tuesdays.",
  Mercury: "Green gram (moong dal) or books on Wednesdays.",
  Jupiter: "Chana dal, turmeric, or yellow clothes on Thursdays.",
  Venus: "Curd, ghee, or white silk on Fridays.",
  Saturn: "Black sesame, oil, or iron on Saturdays.",
  Rahu: "Black gram (urad) or coconut on Saturdays.",
  Ketu: "Mustard seeds or feeding stray dogs."
};

export function generateRemedies(
  planet: string, 
  nature: FunctionalNature, 
  strength: number, 
  dignity: DignityLevel
): Remedy[] {
  const remedies: Remedy[] = [];

  // 1. Strengthen Weak Benefics (Strength < 50)
  if ((nature === "Functional Benefic" || nature === "Yoga Karaka") && strength < 50) {
    remedies.push({
      planet,
      type: "Gemstone",
      description: `Wear ${GEMSTONES[planet]} in a suitable metal.`,
      reason: `To strengthen ${planet}, which is a beneficial planet for you but is currently weak (${dignity}).`
    });
    remedies.push({
      planet,
      type: "Chant",
      description: `Recite "${CHANTS[planet]}" 108 times daily.`,
      reason: `To invoke the blessings of ${planet}.`
    });
  }

  // 2. Propitiate Malefics (Functional Malefic)
  // Especially if they are strong (causing more harm) or just generally to reduce negativity.
  if (nature === "Functional Malefic") {
    remedies.push({
      planet,
      type: "Donation",
      description: `Donate ${DONATIONS[planet]}`,
      reason: `To pacify ${planet}, which acts as a functional malefic for your chart.`
    });
    remedies.push({
      planet,
      type: "Chant",
      description: `Recite "${CHANTS[planet]}" on its governing day.`,
      reason: `To reduce the negative impact of ${planet}.`
    });
  }

  return remedies;
}
