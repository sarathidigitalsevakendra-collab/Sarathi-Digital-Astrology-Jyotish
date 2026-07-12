/**
 * Type definitions for Horoscope feature
 */

export interface HoroscopeData {
  date: string; // ISO (today)
  sunSign: string; // e.g. "Scorpio"
  text?: string; // optional, can be undefined for now
}

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
