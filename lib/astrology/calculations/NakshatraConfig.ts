/**
 * Nakshatra Configuration - Single Source of Truth
 * 
 * Consolidates nakshatra data previously scattered across:
 * - DashaCalculator.ts (NAKSHATRA_LORDS, NAKSHATRA_NAMES)
 * - NakshatraInfo.ts (NAKSHATRA_DATA)
 * - Matchmaking.ts (NAKSHATRAS, GANAS, NADIS, YONIS)
 * 
 * Reference: Brihat Parashara Hora Shastra
 */

export interface NakshatraConfig {
  id: number;           // 1-27
  name: string;
  lord: string;         // Vimshottari Dasha lord
  deity: string;
  symbol: string;
  gana: 0 | 1 | 2;      // 0=Deva, 1=Manushya, 2=Rakshasa
  nadi: 0 | 1 | 2;      // 0=Adi(Vata), 1=Madhya(Pitta), 2=Antya(Kapha)
  yoni: number;         // Animal symbol index (0-13)
  quality: string;
  element: string;
}

/**
 * Complete Nakshatra data for all 27 lunar mansions
 */
export const NAKSHATRA_CONFIG: NakshatraConfig[] = [
  { id: 1,  name: "Ashwini",          lord: "Ketu",    deity: "Ashwini Kumaras", symbol: "Horse Head",   gana: 0, nadi: 0, yoni: 0,  quality: "Swift",    element: "Fire" },
  { id: 2,  name: "Bharani",          lord: "Venus",   deity: "Yama",            symbol: "Yoni",         gana: 1, nadi: 1, yoni: 1,  quality: "Fierce",   element: "Fire" },
  { id: 3,  name: "Krittika",         lord: "Sun",     deity: "Agni",            symbol: "Razor",        gana: 2, nadi: 2, yoni: 2,  quality: "Mixed",    element: "Fire" },
  { id: 4,  name: "Rohini",           lord: "Moon",    deity: "Brahma",          symbol: "Cart",         gana: 1, nadi: 2, yoni: 3,  quality: "Fixed",    element: "Earth" },
  { id: 5,  name: "Mrigashira",       lord: "Mars",    deity: "Soma",            symbol: "Deer Head",    gana: 0, nadi: 1, yoni: 3,  quality: "Soft",     element: "Earth" },
  { id: 6,  name: "Ardra",            lord: "Rahu",    deity: "Rudra",           symbol: "Teardrop",     gana: 1, nadi: 0, yoni: 4,  quality: "Sharp",    element: "Air" },
  { id: 7,  name: "Punarvasu",        lord: "Jupiter", deity: "Aditi",           symbol: "Bow",          gana: 0, nadi: 0, yoni: 5,  quality: "Movable",  element: "Air" },
  { id: 8,  name: "Pushya",           lord: "Saturn",  deity: "Brihaspati",      symbol: "Flower",       gana: 0, nadi: 1, yoni: 2,  quality: "Light",    element: "Water" },
  { id: 9,  name: "Ashlesha",         lord: "Mercury", deity: "Nagas",           symbol: "Serpent",      gana: 2, nadi: 2, yoni: 5,  quality: "Sharp",    element: "Water" },
  { id: 10, name: "Magha",            lord: "Ketu",    deity: "Pitris",          symbol: "Throne",       gana: 2, nadi: 0, yoni: 6,  quality: "Fierce",   element: "Fire" },
  { id: 11, name: "Purva Phalguni",   lord: "Venus",   deity: "Bhaga",           symbol: "Hammock",      gana: 1, nadi: 1, yoni: 6,  quality: "Fierce",   element: "Fire" },
  { id: 12, name: "Uttara Phalguni",  lord: "Sun",     deity: "Aryaman",         symbol: "Bed",          gana: 1, nadi: 2, yoni: 7,  quality: "Fixed",    element: "Fire" },
  { id: 13, name: "Hasta",            lord: "Moon",    deity: "Savitar",         symbol: "Hand",         gana: 0, nadi: 0, yoni: 8,  quality: "Light",    element: "Earth" },
  { id: 14, name: "Chitra",           lord: "Mars",    deity: "Vishvakarma",     symbol: "Pearl",        gana: 2, nadi: 1, yoni: 9,  quality: "Soft",     element: "Earth" },
  { id: 15, name: "Swati",            lord: "Rahu",    deity: "Vayu",            symbol: "Coral",        gana: 0, nadi: 2, yoni: 8,  quality: "Movable",  element: "Air" },
  { id: 16, name: "Vishakha",         lord: "Jupiter", deity: "Indra-Agni",      symbol: "Arch",         gana: 2, nadi: 2, yoni: 9,  quality: "Mixed",    element: "Air" },
  { id: 17, name: "Anuradha",         lord: "Saturn",  deity: "Mitra",           symbol: "Lotus",        gana: 0, nadi: 1, yoni: 10, quality: "Soft",     element: "Water" },
  { id: 18, name: "Jyeshtha",         lord: "Mercury", deity: "Indra",           symbol: "Earring",      gana: 2, nadi: 0, yoni: 10, quality: "Sharp",    element: "Water" },
  { id: 19, name: "Mula",             lord: "Ketu",    deity: "Nirrti",          symbol: "Root",         gana: 2, nadi: 0, yoni: 4,  quality: "Sharp",    element: "Fire" },
  { id: 20, name: "Purva Ashadha",    lord: "Venus",   deity: "Apas",            symbol: "Fan",          gana: 1, nadi: 1, yoni: 11, quality: "Fierce",   element: "Fire" },
  { id: 21, name: "Uttara Ashadha",   lord: "Sun",     deity: "Vishvadevas",     symbol: "Tusk",         gana: 1, nadi: 2, yoni: 12, quality: "Fixed",    element: "Fire" },
  { id: 22, name: "Shravana",         lord: "Moon",    deity: "Vishnu",          symbol: "Ear",          gana: 0, nadi: 0, yoni: 11, quality: "Movable",  element: "Earth" },
  { id: 23, name: "Dhanishta",        lord: "Mars",    deity: "Vasus",           symbol: "Drum",         gana: 2, nadi: 1, yoni: 13, quality: "Movable",  element: "Earth" },
  { id: 24, name: "Shatabhisha",      lord: "Rahu",    deity: "Varuna",          symbol: "Circle",       gana: 2, nadi: 2, yoni: 0,  quality: "Movable",  element: "Air" },
  { id: 25, name: "Purva Bhadrapada", lord: "Jupiter", deity: "Ajaikapada",      symbol: "Sword",        gana: 1, nadi: 0, yoni: 13, quality: "Fierce",   element: "Air" },
  { id: 26, name: "Uttara Bhadrapada",lord: "Saturn",  deity: "Ahirbudhnya",     symbol: "Twins",        gana: 1, nadi: 1, yoni: 7,  quality: "Fixed",    element: "Water" },
  { id: 27, name: "Revati",           lord: "Mercury", deity: "Pushan",          symbol: "Fish",         gana: 0, nadi: 2, yoni: 1,  quality: "Soft",     element: "Water" },
];

// ============================================================================
// DERIVED EXPORTS (for backward compatibility)
// ============================================================================

/** Array of nakshatra names (0-indexed) */
export const NAKSHATRA_NAMES = NAKSHATRA_CONFIG.map(n => n.name);

/** Array of nakshatra lords for Vimshottari Dasha (0-indexed) */
export const NAKSHATRA_LORDS = NAKSHATRA_CONFIG.map(n => n.lord);

/** Array of Gana values (0-indexed) */
export const NAKSHATRA_GANAS = NAKSHATRA_CONFIG.map(n => n.gana);

/** Array of Nadi values (0-indexed) */
export const NAKSHATRA_NADIS = NAKSHATRA_CONFIG.map(n => n.nadi);

/** Array of Yoni values (0-indexed) */
export const NAKSHATRA_YONIS = NAKSHATRA_CONFIG.map(n => n.yoni);

/** Object lookup by name (for NakshatraInfo.ts compatibility) */
export const NAKSHATRA_DATA_MAP: Record<string, NakshatraConfig & { ruler: string }> = 
  Object.fromEntries(
    NAKSHATRA_CONFIG.map(n => [n.name, { ...n, ruler: n.lord }])
  );

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Span of each nakshatra in degrees (13°20' = 13.333...°) */
export const NAKSHATRA_SPAN = 360 / 27;

/** 
 * Get nakshatra index (0-26) from sidereal longitude 
 */
export function getNakshatraIndex(longitude: number): number {
  return Math.floor(longitude / NAKSHATRA_SPAN) % 27;
}

/** 
 * Get nakshatra name from sidereal longitude 
 */
export function getNakshatraName(longitude: number): string {
  return NAKSHATRA_NAMES[getNakshatraIndex(longitude)] ?? "Unknown";
}

/** 
 * Get nakshatra lord (Vimshottari) from sidereal longitude 
 */
export function getNakshatraLord(longitude: number): string {
  return NAKSHATRA_LORDS[getNakshatraIndex(longitude)] ?? "Ketu";
}

/**
 * Get full nakshatra details from sidereal longitude
 */
export function getNakshatraDetails(longitude: number): NakshatraConfig {
  const index = getNakshatraIndex(longitude);
  // Safe access with fallback to first nakshatra
  return NAKSHATRA_CONFIG[index] ?? NAKSHATRA_CONFIG[0]!;
}
