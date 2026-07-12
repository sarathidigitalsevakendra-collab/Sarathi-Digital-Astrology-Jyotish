export type LocaleCode = "en" | "hi" | "ta";

export type SunSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface DailyHoroscopeRequest {
  sunSign: SunSign;
  date?: string;
  timezone?: string;
  locale: LocaleCode;
  system?: "vedic" | "western";
}

export interface DailyHoroscopeSummary {
  date: string;
  sunSign: SunSign;
  guidance: string;
  mood?: string;
  luckyNumber?: string;
  luckyColor?: string;
  snapshot?: Record<string, unknown>;
}

export interface ProviderMetadata {
  provider: string;
  generatedAt: string;
  timezone?: string;
  raw?: unknown;
}

export interface DailyHoroscopeResult {
  source: string;
  metadata: ProviderMetadata;
  summary: DailyHoroscopeSummary;
}

export interface PanchangRequest {
  date?: string;
  locale: LocaleCode;
  timezone?: string;
}

export interface PanchangResult {
  source: string;
  metadata: ProviderMetadata;
  details: {
    date: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
  };
}

export interface AstrologyProvider {
  getDailyHoroscope(input: DailyHoroscopeRequest): Promise<DailyHoroscopeResult>;
  getPanchang(input: PanchangRequest): Promise<PanchangResult>;
}

// ============================================
// FreeAstrologyAPI Types (used by client.ts)
// ============================================

export interface AstrologyRequest {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds?: number;
  latitude: number;
  longitude: number;
  timezone: number;
  observation_point?: "topocentric" | "geocentric";
  ayanamsha?: "lahiri" | "raman" | "krishnamurti" | "thirukanitham";
}

export interface PlanetPosition {
  name: string;
  fullDegree: number;
  normDegree: number;
  sign: string;
  signLord: string;
  nakshatra: string;
  nakshatraLord: string;
  house: number;
  isRetro: boolean;
  isCombust: boolean;
}

export interface BirthChartResponse {
  statusCode: number;
  output: PlanetPosition[];
  planets?: PlanetPosition[]; // Alias for output
}

export interface SVGChartResponse {
  svg_code: string;
  chart_name: string;
}

export interface PanchangResponse {
  statusCode: number;
  output: {
    tithi: { name: string; endTime: string };
    nakshatra: { name: string; endTime: string };
    yoga: { name: string; endTime: string };
    karana: { name: string; endTime: string };
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
  };
}

export interface CompatibilityResponse {
  statusCode: number;
  output: {
    total_points: number;
    max_points: number;
    match_percentage: number;
    details: {
      varna: { points: number; max: number };
      vashya: { points: number; max: number };
      tara: { points: number; max: number };
      yoni: { points: number; max: number };
      graha_maitri: { points: number; max: number };
      gana: { points: number; max: number };
      bhakoot: { points: number; max: number };
      nadi: { points: number; max: number };
    };
  };
}

export interface DasaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  subPeriods?: DasaPeriod[];
}

export interface DasaResponse {
  statusCode: number;
  output: DasaPeriod[];
}

export interface PlanetaryStrengthResponse {
  statusCode: number;
  output: {
    planet: string;
    shadBala: number;
    bhavaBala: number;
  }[];
}

export interface WesternNatalResponse {
  statusCode: number;
  output: {
    planets: {
      name: string;
      sign: string;
      degree: number;
      house: number;
    }[];
    houses: {
      number: number;
      sign: string;
      degree: number;
    }[];
    aspects: {
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
    }[];
  };
}

export type DivisionalChartType =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D7"
  | "D9"
  | "D10"
  | "D12"
  | "D16"
  | "D20"
  | "D24"
  | "D27"
  | "D30"
  | "D40"
  | "D45"
  | "D60";

export interface RateLimitInfo {
  daily_limit: number;
  used_today: number;
  remaining_today: number;
  reset_at: string;
  last_request_at: string;
}

export interface APIErrorResponse {
  statusCode?: number;
  error?: {
    code: string;
    message: string;
  };
}

export type ServiceBackend = "python" | "api" | "mock" | "freeastrology" | "unavailable";

export interface CachedResponse<T> {
  data: T;
  cachedAt: string;
  cached_at?: string; // Snake_case alias for compatibility
  expiresAt: string;
  expires_at?: string; // Snake_case alias for compatibility
  source: ServiceBackend;
  from_cache?: boolean;
}

export interface TransitRequest {
  dateTime: string; // Birth date
  latitude: number;
  longitude: number;
  timezone: number;
  transitDate?: string; // Optional target date (defaults to now)
}

export interface TransitsResponse {
  transitTime: string;
  currentPositions: Record<string, number>;
  activeTransits: {
    transitPlanet: string;
    transitLongitude: number;
    natalPlanet: string;
    natalLongitude: number;
    aspect: string;
    nature: "intense" | "challenging" | "harmonious";
    exactness: number;
    orb: number;
    effect: string;
    significance: "critical" | "major" | "notable" | "minor";
    significations: string[];
  }[];
  summary: {
    totalAspects: number;
    majorTransits: number;
    challengingCount: number;
    harmoniousCount: number;
    overallTone: "challenging" | "favorable" | "mixed";
    interpretation: string;
  };
}
