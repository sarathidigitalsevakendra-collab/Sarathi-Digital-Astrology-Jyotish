import type { InterpretationInput } from "./types";

type PlanetRecord = {
  name?: string;
  planet?: string;
  sign?: string;
  rashi?: string;
  house?: string | number;
  longitude?: number | string;
  degree?: number | string;
};

type PanchangRecord = {
  tithi?: string;
  tithi_name?: string;
  nakshatra?: string;
  nakshatra_name?: string;
  yoga?: string;
  yoga_name?: string;
  karana?: string;
  karana_name?: string;
};

export function buildDailyHoroscopePrompt(input: InterpretationInput): string {
  const { horoscope, tone = "uplifting", focus = "career", locale } = input;
  const { summary, metadata } = horoscope;
  const snapshot = (summary.snapshot ?? {});
  const raw = metadata.raw ?? {};

  const planetLines = extractPlanetLines(snapshot, raw);
  const panchangLines = extractPanchangLines(snapshot, raw);

  const luckyColor = summary.luckyColor ?? "Unknown";
  const luckyNumber = summary.luckyNumber ?? "Unknown";

  const lines = [
    `Locale: ${locale}`,
    `Tone: ${tone}`,
    `Focus area: ${focus}`,
    `Sun sign: ${summary.sunSign}`,
    `Date: ${summary.date}`,
    `Lucky color: ${luckyColor}`,
    `Lucky number: ${luckyNumber}`,
    `Deterministic guidance seed: ${summary.guidance}`,
    "",
    "Planetary positions:",
    planetLines.length > 0 ? planetLines.join("\n") : "- No planet data provided.",
  ];

  if (panchangLines.length > 0) {
    lines.push("", "Panchang highlights:", panchangLines.join("\n"));
  }

  lines.push(
    "",
    "Instructions:",
    "- Craft 2 concise paragraphs (max 120 words total).",
    "- Paragraph 1: interpret the planetary configuration for the specified focus area and day.",
    "- Paragraph 2: suggest a practical ritual or mindset aligned with Vedic tradition.",
    "- Do not invent planets or aspects beyond the data above.",
    "- Respond in the requested locale. Use honorific but approachable Sanskrit terms when appropriate.",
  );

  return lines.join("\n");
}

function extractPlanetLines(snapshot: Record<string, unknown>, raw: unknown): string[] {
  const candidates: unknown[] = [];

  if (Array.isArray(snapshot.planets)) {
    candidates.push(...snapshot.planets);
  }
  if (Array.isArray((snapshot).planetPositions)) {
    candidates.push(...((snapshot).planetPositions as unknown[]));
  }

  const rawObj = raw as Record<string, unknown>;
  if (Array.isArray(rawObj?.planets)) {
    candidates.push(...(rawObj.planets as unknown[]));
  }
  if (Array.isArray(rawObj?.planet_positions)) {
    candidates.push(...(rawObj.planet_positions as unknown[]));
  }
  if (Array.isArray(rawObj?.data)) {
    candidates.push(...(rawObj.data as unknown[]));
  }

  const formatted: string[] = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const record = candidate as PlanetRecord;
    const name = record.name ?? record.planet;
    const sign = record.sign ?? record.rashi;
    const house = record.house !== undefined ? `House ${record.house}` : null;
    const longitude = record.longitude ?? record.degree;

    if (!name && !sign) continue;

    const parts = [`- ${(name ?? "Planet").toString()}`];
    if (sign) parts.push(`in ${sign}`);
    if (house) parts.push(`(${house})`);
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      parts.push(`@ ${longitude}°`);
    }

    formatted.push(parts.join(" "));
  }

  return unique(formatted);
}

function extractPanchangLines(snapshot: Record<string, unknown>, raw: unknown): string[] {
  const sources: unknown[] = [];
  sources.push(snapshot);
  if (raw && typeof raw === "object") {
    sources.push(raw);
    const data = (raw as Record<string, unknown>).data;
    if (Array.isArray(data)) {
      sources.push(...data);
    } else if (data && typeof data === "object") {
      sources.push(data);
    }
  }

  const lines = new Set<string>();
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const record = source as PanchangRecord;
    const tithi = record.tithi ?? record.tithi_name;
    const nakshatra = record.nakshatra ?? record.nakshatra_name;
    const yoga = record.yoga ?? record.yoga_name;
    const karana = record.karana ?? record.karana_name;

    if (tithi) lines.add(`- Tithi: ${tithi}`);
    if (nakshatra) lines.add(`- Nakshatra: ${nakshatra}`);
    if (yoga) lines.add(`- Yoga: ${yoga}`);
    if (karana) lines.add(`- Karana: ${karana}`);
  }

  return Array.from(lines);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
