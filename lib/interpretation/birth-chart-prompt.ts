
import { BirthChartInterpretationInput } from "./birth-chart-types";

export function buildBirthChartPrompt(input: BirthChartInterpretationInput): string {
  const { birthChart, focus = "general", tone = "uplifting" } = input;
  const { ascendant, planets } = birthChart.data;

  // Format planetary positions
  const planetList = planets?.map(p => 
    `- ${p.name} in ${p.sign} (${p.house ? `House ${p.house}` : 'Unknown House'}) at ${p.normDegree?.toFixed(2)}° ${p.isRetro ? '(Retrograde)' : ''}`
  ).join("\n") || "No planetary data available.";

  const prompt = `
Role: Senior Vedic Astrologer
Task: Interpret the following birth chart for a user seeking insights on "${focus}".
Tone: ${tone}
Language: ${input.locale === 'hi' ? 'Hindi (Transliterated or Devanagari)' : 'English'}

Birth Chart Data:
- Ascendant: ${ascendant ? (Math.floor(ascendant / 30) + 1) : 'Unknown'} degrees
- Planetary Positions:
${planetList}

Instructions:
1. Provide a detailed analysis focusing on ${focus}.
2. Highlight 3 key strengths based on planetary dignities (Exalted, Own Sign, etc.).
3. Identify 2 potential challenges or karmic lessons (Saturn, Rahu/Ketu influence).
4. Suggest 3 practical Vedic remedies (Gemstones, Mantras, or Charity) suitable for modern life.
5. Keep the narrative engaging and empathetic.
6. Structure with clear markdown headings: ## Narrative, ## Key Strengths, ## Challenges, ## Recommended Remedies.
`;

  return prompt;
}
