/**
 * Real Horoscope Client
 * 
 * Connects to the deployed Astro Core Python API for real horoscope data.
 * Falls back to mock data if API is unavailable.
 */

import type { HoroscopeClient, HoroscopeResponse, HoroscopeEntry } from "./horoscope";

const ASTRO_CORE_URL = process.env.ASTRO_CORE_URL || "https://jyotishya-astro-api.vercel.app";

interface AstroCoreHoroscope {
  sign: string;
  date: string;
  backend: string;
  transits: Record<string, {
    sign: string;
    degree: number;
    aspect: string;
    is_retro: boolean;
  }>;
  guidance: {
    overall: string;
    career: string;
    relationships: string;
    health: string;
  };
  ratings: {
    overall: number;
    career: number;
    love: number;
    health: number;
  };
}

interface BatchHoroscopeResponse {
  date: string;
  backend: string;
  horoscopes: Record<string, AstroCoreHoroscope>;
}

// Map sign names to lucky colors based on element
const SIGN_COLORS: Record<string, string> = {
  aries: "Red",
  taurus: "Green",
  gemini: "Yellow",
  cancer: "Silver",
  leo: "Gold",
  virgo: "Navy",
  libra: "Pink",
  scorpio: "Maroon",
  sagittarius: "Purple",
  capricorn: "Brown",
  aquarius: "Blue",
  pisces: "Teal",
};

// Map ratings to mood descriptions
function ratingToMood(rating: number): string {
  if (rating >= 4) return "Excellent";
  if (rating >= 3) return "Harmonious";
  if (rating >= 2) return "Challenging";
  return "Introspective";
}

// Convert rating to lucky number (simple algorithm)
function ratingToLuckyNumber(ratings: AstroCoreHoroscope["ratings"]): string {
  const sum = ratings.overall + ratings.career + ratings.love + ratings.health;
  return String((sum % 9) + 1);
}

// Transform API response to our HoroscopeEntry format
function transformToHoroscopeEntry(sign: string, data: AstroCoreHoroscope): HoroscopeEntry {
  return {
    summary: data.guidance.overall,
    mood: ratingToMood(data.ratings.overall),
    luckyNumber: ratingToLuckyNumber(data.ratings),
    luckyColor: SIGN_COLORS[sign.toLowerCase()] || "Gold",
  };
}

export class RealHoroscopeClient implements HoroscopeClient {
  private timeout: number;
  
  constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  async getDaily(_system: "vedic" | "western"): Promise<HoroscopeResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${ASTRO_CORE_URL}/horoscope/daily/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: "Asia/Kolkata",
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data: BatchHoroscopeResponse = await response.json();
      
      // Transform to our expected format
      const result: HoroscopeResponse = {};
      
      for (const [sign, horoscope] of Object.entries(data.horoscopes)) {
        // Capitalize first letter for consistency
        const signKey = sign.charAt(0).toUpperCase() + sign.slice(1);
        result[signKey] = transformToHoroscopeEntry(sign, horoscope);
      }
      
      return result;
    } catch (error) {
      console.error("[RealHoroscopeClient] Failed to fetch daily horoscopes:", error);
      throw error;
    }
  }

  async getWeekly(_system: "vedic" | "western"): Promise<HoroscopeResponse> {
    // For now, weekly uses the same daily data
    // Future: implement weekly aggregation endpoint
    return this.getDaily(_system);
  }

  async getMonthly(_system: "vedic" | "western"): Promise<HoroscopeResponse> {
    // For now, monthly uses the same daily data
    // Future: implement monthly aggregation endpoint
    return this.getDaily(_system);
  }
}

/**
 * Get a single sign's horoscope
 */
export async function getSingleHoroscope(sign: string): Promise<AstroCoreHoroscope | null> {
  try {
    const response = await fetch(`${ASTRO_CORE_URL}/horoscope/daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sign: sign.toLowerCase(),
        timezone: "Asia/Kolkata",
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[getSingleHoroscope] Failed for ${sign}:`, error);
    return null;
  }
}

/**
 * Create horoscope client based on environment
 */
export function createHoroscopeClient(): HoroscopeClient {
  // Use real client if ASTRO_CORE_URL is configured and not localhost
  if (ASTRO_CORE_URL && !ASTRO_CORE_URL.includes("localhost")) {
    return new RealHoroscopeClient();
  }
  
  // Fall back to mock
  const { MockHoroscopeClient } = require("./horoscope");
  return new MockHoroscopeClient();
}
