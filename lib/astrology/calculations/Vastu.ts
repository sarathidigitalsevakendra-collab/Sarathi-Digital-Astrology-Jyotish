/**
 * Vastu Shastra Advisory Engine
 *
 * Classical Vastu Shastra: the science of directions, elements, and cosmic energy
 * in built spaces. Based on the 8-direction (Ashtadasa) system:
 *
 * N  = Water element  — Career, wisdom, flow
 * NE = Space element  — Spirituality, clarity
 * E  = Wood element   — Health, family, growth
 * SE = Fire element   — Finance, metabolism, fame
 * S  = Earth element  — Stability, recognition
 * SW = Earth element  — Relationships, strength, ancestors
 * W  = Metal element  — Creativity, children, joy
 * NW = Metal/Air      — Travel, helpful people, networking
 *
 * The engine provides:
 * 1. Zone-by-zone analysis for a given house facing direction
 * 2. Room placement recommendations
 * 3. Colour, element, and deity associations per zone
 * 4. Vastu remedies (plants, crystals, yantras, mirrors)
 * 5. Personalized recommendations based on birth star/sun sign
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type FacingDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type RoomType =
  | "MasterBedroom" | "KidsBedroom" | "GuestBedroom"
  | "LivingRoom" | "DiningRoom" | "Kitchen"
  | "Bathroom" | "Toilet" | "Pooja" | "Study"
  | "Office" | "StoreRoom" | "Garage";

export type ZoneQuality = "Excellent" | "Good" | "Average" | "Inauspicious";

// ─── Zone Metadata ────────────────────────────────────────────────────────────

export interface VastuZone {
  direction: FacingDirection;
  element: string;
  elementEmoji: string;
  deity: string;
  governs: string[];
  auspiciousRooms: RoomType[];
  inauspiciousRooms: RoomType[];
  idealColours: string[];
  avoidColours: string[];
  remedy: string[];
  strengthenWith: string[];
  significance: string;
}

const VASTU_ZONES: Record<FacingDirection, VastuZone> = {
  N: {
    direction: "N",
    element: "Water", elementEmoji: "💧",
    deity: "Kubera (Lord of Wealth)",
    governs: ["Career", "Business opportunities", "Wisdom", "Cash flow"],
    auspiciousRooms: ["Study", "Office", "LivingRoom"],
    inauspiciousRooms: ["Kitchen", "Toilet", "StoreRoom"],
    idealColours: ["Blue", "Black", "Green"],
    avoidColours: ["Red", "Orange", "Pink"],
    remedy: ["Keep this area decluttered", "Water fountain or aquarium", "Blue/black décor accents"],
    strengthenWith: ["Quartz crystal", "Flowing water feature", "Lucky bamboo"],
    significance: "The North is governed by Kubera, the lord of wealth. Keeping it open and clean attracts prosperity and career opportunities.",
  },
  NE: {
    direction: "NE",
    element: "Space", elementEmoji: "🌌",
    deity: "Ishaan (Lord Shiva)",
    governs: ["Spirituality", "Mental clarity", "Education", "Wisdom"],
    auspiciousRooms: ["Pooja", "Study", "MasterBedroom"],
    inauspiciousRooms: ["Kitchen", "Toilet", "Garage", "StoreRoom"],
    idealColours: ["White", "Light Yellow", "Golden"],
    avoidColours: ["Red", "Dark Brown"],
    remedy: ["Keep very clean and sacred", "Place Ishaan Yantra", "Morning light must enter here"],
    strengthenWith: ["Crystal ball", "White flowers", "Prayer space"],
    significance: "The NE corner (Ishaan Kona) is the most sacred zone. It connects to divine energy — never place heavy, dark, or waste-generating functions here.",
  },
  E: {
    direction: "E",
    element: "Wood", elementEmoji: "🌳",
    deity: "Indra (King of Gods)",
    governs: ["Health", "Family harmony", "Growth", "Social relations"],
    auspiciousRooms: ["LivingRoom", "Study", "MasterBedroom"],
    inauspiciousRooms: ["Toilet", "Garage", "StoreRoom"],
    idealColours: ["Green", "Lime", "Light Blue"],
    avoidColours: ["White", "Grey", "Gold"],
    remedy: ["Keep windows open in the morning", "Indoor plants", "Green accent wall"],
    strengthenWith: ["Green plants", "Wooden furniture", "Family photos"],
    significance: "East is the direction of the rising Sun and Indra. Morning sunlight from the East boosts health, vitality, and positive relationships.",
  },
  SE: {
    direction: "SE",
    element: "Fire", elementEmoji: "🔥",
    deity: "Agni (God of Fire)",
    governs: ["Finance", "Fame", "Metabolism", "Cooking energy"],
    auspiciousRooms: ["Kitchen", "Office"],
    inauspiciousRooms: ["MasterBedroom", "Pooja", "Toilet"],
    idealColours: ["Red", "Orange", "Pink", "Silver"],
    avoidColours: ["Blue", "Black"],
    remedy: ["Place kitchen in SE", "Red or orange accents", "Fire element art"],
    strengthenWith: ["Candles", "Red flowers", "Triangular objects"],
    significance: "The SE zone belongs to Agni — the fire element. The kitchen is ideal here as fire energizes financial metabolism and fame.",
  },
  S: {
    direction: "S",
    element: "Earth", elementEmoji: "🪨",
    deity: "Yama (Lord of Dharma)",
    governs: ["Fame", "Recognition", "Career success", "Stability"],
    auspiciousRooms: ["MasterBedroom", "StoreRoom", "Garage"],
    inauspiciousRooms: ["Pooja", "Kitchen", "Study"],
    idealColours: ["Red", "Yellow", "Orange"],
    avoidColours: ["Blue", "White", "Black"],
    remedy: ["Keep heavy furniture in South", "No main door in South", "Hang tall plants on South wall"],
    strengthenWith: ["Heavy bookshelf", "Earth-toned art", "Square objects"],
    significance: "South is governed by Yama and represents stability and recognition. Avoid placing the main entrance here in most house types.",
  },
  SW: {
    direction: "SW",
    element: "Earth", elementEmoji: "🌍",
    deity: "Niritti (Southwest Guardian)",
    governs: ["Relationships", "Health of owner", "Strength", "Ancestors"],
    auspiciousRooms: ["MasterBedroom", "StoreRoom"],
    inauspiciousRooms: ["Kitchen", "Toilet", "Pooja", "LivingRoom"],
    idealColours: ["Beige", "Brown", "Yellow"],
    avoidColours: ["Blue", "White"],
    remedy: ["Master bedroom here", "Heavy furniture in SW corner", "No cut or open in SW"],
    strengthenWith: ["Heavy storage", "Earth décor", "Couple photos for relationship"],
    significance: "SW is the most stable zone, ideal for the master bedroom. Heaviness and permanence belong here — avoid cuts or open spaces in this corner.",
  },
  W: {
    direction: "W",
    element: "Metal", elementEmoji: "⚙️",
    deity: "Varuna (God of Water & Lakes)",
    governs: ["Creativity", "Joy", "Children", "Networking"],
    auspiciousRooms: ["KidsBedroom", "DiningRoom", "LivingRoom"],
    inauspiciousRooms: ["Kitchen", "Toilet"],
    idealColours: ["White", "Grey", "Silver", "Cream"],
    avoidColours: ["Green", "Blue"],
    remedy: ["Children's room in West", "Silver or metallic accents", "Round or oval shapes"],
    strengthenWith: ["Metal wind chime", "White flowers", "Children's artwork display"],
    significance: "West is governed by Varuna and linked to creativity and children. The children's bedroom and creative spaces thrive here.",
  },
  NW: {
    direction: "NW",
    element: "Air", elementEmoji: "🌬️",
    deity: "Vayu (God of Wind)",
    governs: ["Travel", "Helpful people", "Networking", "Communication"],
    auspiciousRooms: ["GuestBedroom", "Garage", "DiningRoom"],
    inauspiciousRooms: ["MasterBedroom", "Pooja", "StoreRoom"],
    idealColours: ["White", "Silver", "Light Grey"],
    avoidColours: ["Red", "Brown"],
    remedy: ["Guest room in NW", "Keep airy and ventilated", "Wind chime at NW entrance"],
    strengthenWith: ["Metal wind chime", "Light curtains", "Travel-themed art"],
    significance: "NW is ruled by Vayu (wind) — perfect for guest rooms, cars in the garage, and spaces for transient energy. Supports travel and networking.",
  },
};

// ─── Room labels ──────────────────────────────────────────────────────────────

const ROOM_LABELS: Record<RoomType, string> = {
  MasterBedroom: "Master Bedroom",
  KidsBedroom: "Kids' Bedroom",
  GuestBedroom: "Guest Bedroom",
  LivingRoom: "Living Room",
  DiningRoom: "Dining Room",
  Kitchen: "Kitchen",
  Bathroom: "Bathroom",
  Toilet: "Toilet",
  Pooja: "Pooja Room",
  Study: "Study / Library",
  Office: "Home Office",
  StoreRoom: "Store Room",
  Garage: "Garage",
};

// ─── Facing direction → ideal main entrance quality ───────────────────────────

const ENTRANCE_QUALITY: Record<FacingDirection, { quality: ZoneQuality; note: string }> = {
  N:  { quality: "Excellent",    note: "North-facing entrance is auspicious — wealth and opportunity flow in." },
  NE: { quality: "Excellent",    note: "NE-facing entrance brings spiritual energy and clarity." },
  E:  { quality: "Excellent",    note: "East-facing entrance welcomes morning sunlight and health." },
  NW: { quality: "Good",         note: "NW-facing is good but requires Vayu-balancing remedies." },
  SE: { quality: "Average",      note: "SE-facing can cause financial instability — mitigate with remedies." },
  W:  { quality: "Good",         note: "West-facing entrance is decent; ensure North & East are kept open." },
  S:  { quality: "Inauspicious", note: "South-facing entrance is inauspicious in most traditions. Use remedies." },
  SW: { quality: "Inauspicious", note: "SW entrance can create obstacles and health issues. Must be remedied." },
};

// ─── Facing-specific house layout advice ──────────────────────────────────────

const FACING_ADVICE: Record<FacingDirection, string[]> = {
  N:  ["Keep the North open and unobstructed.", "Place main entrance in N1–N3 pada (left-center).", "Build staircase in South or SW.", "Slope the plot toward North or East."],
  NE: ["The NE corner is extremely sacred — keep it light and clean.", "Ideal for meditation/pooja room at entrance.", "Avoid toilets or heavy storage in NE."],
  E:  ["East-facing is one of the best orientations.", "Morning sunlight in living areas boosts health.", "No South or SW extensions please.", "Master bedroom in SW."],
  SE: ["Place kitchen at SE entrance for direct alignment.", "Add Vastu yantra at main door.", "Red door or red/orange colors near entrance help.", "Avoid water feature near main door."],
  S:  ["Place a Vastu pyramid at the main door.", "Ensure NE is kept completely open and clean.", "Add green plants along South boundary.", "Consider Vastu remedies — consult specialist."],
  SW: ["Most challenging facing — strong remedies needed.", "Keep the SW zone heavy with earth elements.", "Add Vastu energy correctors at entrance.", "Never place main staircase in NE."],
  W:  ["West-facing is good for creative professionals.", "Ensure morning sun enters through East windows.", "Children's rooms do well in the West zone.", "Keep North open and uncluttered."],
  NW: ["NW-facing suits travel/networking professionals.", "Guest rooms naturally belong here.", "Ensure kitchen is in SE zone.", "Add a Vastu mirror on North or East wall."],
};

// ─── Personal recommendations by element birth sign (simplified) ──────────────

const ZODIAC_ELEMENTS: Record<string, { element: string; bestZone: FacingDirection; colour: string }> = {
  Aries:       { element: "Fire",  bestZone: "SE", colour: "Red" },
  Taurus:      { element: "Earth", bestZone: "SW", colour: "Green" },
  Gemini:      { element: "Air",   bestZone: "NW", colour: "Yellow" },
  Cancer:      { element: "Water", bestZone: "N",  colour: "Silver" },
  Leo:         { element: "Fire",  bestZone: "SE", colour: "Gold" },
  Virgo:       { element: "Earth", bestZone: "SW", colour: "Beige" },
  Libra:       { element: "Air",   bestZone: "NW", colour: "Pink" },
  Scorpio:     { element: "Water", bestZone: "N",  colour: "Maroon" },
  Sagittarius: { element: "Fire",  bestZone: "E",  colour: "Purple" },
  Capricorn:   { element: "Earth", bestZone: "S",  colour: "Brown" },
  Aquarius:    { element: "Air",   bestZone: "W",  colour: "Blue" },
  Pisces:      { element: "Water", bestZone: "NE", colour: "Seafoam" },
};

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ZoneAnalysis {
  direction: FacingDirection;
  zone: VastuZone;
  userRooms: RoomType[];           // what the user has placed here
  quality: ZoneQuality;
  issues: string[];
  recommendations: string[];
}

export interface RoomRecommendation {
  room: RoomType;
  roomLabel: string;
  idealDirections: FacingDirection[];
  currentDirection?: FacingDirection;
  currentQuality?: ZoneQuality;
  tip: string;
}

export interface VastuReport {
  facingDirection: FacingDirection;
  entranceQuality: { quality: ZoneQuality; note: string };
  facingAdvice: string[];
  zoneAnalyses: ZoneAnalysis[];      // all 8 zones
  roomRecommendations: RoomRecommendation[];
  personalElement?: string;
  personalBestZone?: FacingDirection;
  personalColour?: string;
  overallScore: number;              // 0-100
  overallVerdict: string;
  topPriorityRemedies: string[];
}

// ─── Zone quality based on room placement ─────────────────────────────────────

function scoreZone(zone: VastuZone, rooms: RoomType[]): { quality: ZoneQuality; issues: string[]; recs: string[] } {
  if (rooms.length === 0) {
    return { quality: "Good", issues: [], recs: [`Zone is empty — consider using for: ${zone.auspiciousRooms.slice(0, 2).map(r => ROOM_LABELS[r]).join(", ")}`] };
  }

  let goodCount = 0;
  let badCount = 0;
  const issues: string[] = [];
  const recs: string[] = [];

  for (const room of rooms) {
    if (zone.auspiciousRooms.includes(room)) {
      goodCount++;
      recs.push(`${ROOM_LABELS[room]} is well-placed in the ${zone.direction} zone ✓`);
    } else if (zone.inauspiciousRooms.includes(room)) {
      badCount++;
      const ideal = findIdealDirections(room);
      issues.push(`${ROOM_LABELS[room]} should NOT be in this zone. Ideal: ${ideal.slice(0, 2).join(", ")}`);
    }
  }

  const quality: ZoneQuality =
    badCount === 0 && goodCount > 0 ? "Excellent"
    : badCount === 0 ? "Good"
    : badCount === 1 && goodCount >= 1 ? "Average"
    : "Inauspicious";

  if (badCount > 0) recs.push(`Remedy: ${zone.remedy[0]}`);

  return { quality, issues, recs };
}

function findIdealDirections(room: RoomType): FacingDirection[] {
  const dirs: FacingDirection[] = [];
  for (const [dir, zone] of Object.entries(VASTU_ZONES)) {
    if (zone.auspiciousRooms.includes(room)) dirs.push(dir as FacingDirection);
  }
  return dirs;
}

// ─── Main API ─────────────────────────────────────────────────────────────────

/**
 * Generate a full Vastu report.
 * @param facingDirection - Which direction the main entrance/house faces
 * @param roomPlacements  - Map of direction → list of rooms placed there
 * @param zodiacSign      - Optional birth zodiac for personalisation
 */
export function generateVastuReport(
  facingDirection: FacingDirection,
  roomPlacements: Partial<Record<FacingDirection, RoomType[]>>,
  zodiacSign?: string,
): VastuReport {
  const entranceQuality = ENTRANCE_QUALITY[facingDirection];
  const facingAdvice = FACING_ADVICE[facingDirection];

  // Zone analyses
  const zoneAnalyses: ZoneAnalysis[] = (Object.keys(VASTU_ZONES) as FacingDirection[]).map(dir => {
    const zone = VASTU_ZONES[dir];
    const userRooms = roomPlacements[dir] ?? [];
    const { quality, issues, recs } = scoreZone(zone, userRooms);
    return {
      direction: dir,
      zone,
      userRooms,
      quality,
      issues,
      recommendations: recs,
    };
  });

  // Room recommendations for all standard rooms
  const standardRooms: RoomType[] = [
    "MasterBedroom", "KidsBedroom", "LivingRoom", "Kitchen", "Pooja", "Study", "Office",
  ];
  const roomRecommendations: RoomRecommendation[] = standardRooms.map(room => {
    const idealDirs = findIdealDirections(room);
    // Find where user placed this room (if anywhere)
    let currentDir: FacingDirection | undefined;
    for (const [dir, rooms] of Object.entries(roomPlacements)) {
      if ((rooms as RoomType[]).includes(room)) {
        currentDir = dir as FacingDirection;
        break;
      }
    }
    const currentQuality = currentDir
      ? scoreZone(VASTU_ZONES[currentDir], [room]).quality
      : undefined;

    const tipZone = VASTU_ZONES[idealDirs[0] ?? "N"];
    return {
      room,
      roomLabel: ROOM_LABELS[room],
      idealDirections: idealDirs,
      currentDirection: currentDir,
      currentQuality,
      tip: `${ROOM_LABELS[room]} placed in ${idealDirs.slice(0, 2).join("/")} activates ${tipZone.governs.slice(0, 2).join(" & ")}.`,
    };
  });

  // Personal element
  type ZodiacInfo = { element: string; bestZone: FacingDirection; colour: string };
  const zodiac: ZodiacInfo | undefined = zodiacSign ? ZODIAC_ELEMENTS[zodiacSign] : undefined;
  const personalElement = zodiac?.element;
  const personalBestZone = zodiac?.bestZone;
  const personalColour = zodiac?.colour;

  // Overall score
  const excellentCount = zoneAnalyses.filter(z => z.quality === "Excellent").length;
  const goodCount = zoneAnalyses.filter(z => z.quality === "Good").length;
  const inauspCount = zoneAnalyses.filter(z => z.quality === "Inauspicious").length;
  const overallScore = Math.round(
    ((excellentCount * 100 + goodCount * 70 + (8 - excellentCount - goodCount - inauspCount) * 40 + inauspCount * 10) / 8)
    + (entranceQuality.quality === "Excellent" ? 10 : entranceQuality.quality === "Good" ? 5 : entranceQuality.quality === "Average" ? 0 : -10)
  );

  const cappedScore = Math.max(0, Math.min(100, overallScore));

  const verdict =
    cappedScore >= 80 ? "Excellent Vastu overall! Your home has strong positive energy flow."
    : cappedScore >= 60 ? "Good Vastu with a few areas for improvement. Address the flagged zones."
    : cappedScore >= 40 ? "Average Vastu. Several important zones need attention and remedies."
    : "Significant Vastu imbalances detected. Prioritise remedies for the inauspicious zones.";

  // Top priority remedies
  const topPriorityRemedies: string[] = [
    ...zoneAnalyses
      .filter(z => z.quality === "Inauspicious")
      .flatMap(z => z.zone.remedy.slice(0, 1).map(r => `[${z.direction}] ${r}`)),
    ...ENTRANCE_QUALITY[facingDirection].quality === "Inauspicious"
      ? ["Place Vastu pyramid and Swastik at main entrance", "Consult a Jyotish-Vastu specialist for personalized remedies"]
      : [],
    ...(zodiac ? [`Personal zone: Energise your ${personalBestZone} corner with ${personalColour} décor (${zodiacSign} — ${personalElement} element)`] : []),
  ].slice(0, 5);

  return {
    facingDirection,
    entranceQuality,
    facingAdvice,
    zoneAnalyses,
    roomRecommendations,
    personalElement,
    personalBestZone,
    personalColour,
    overallScore: cappedScore,
    overallVerdict: verdict,
    topPriorityRemedies,
  };
}

export { VASTU_ZONES, ROOM_LABELS, ZODIAC_ELEMENTS };
