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
