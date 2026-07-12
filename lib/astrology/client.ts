/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { logger } from "@/lib/monitoring/logger";
import { captureException } from "@/lib/monitoring/sentry";
import { retryFetch } from "@/lib/api/retry";
import { measureAsync } from "@/lib/monitoring/performance";
import type {
  AstrologyRequest,
  BirthChartResponse,
  SVGChartResponse,
  PanchangResponse,
  CompatibilityResponse,
  DasaResponse,
  PlanetaryStrengthResponse,
  WesternNatalResponse,
  DivisionalChartType,
  RateLimitInfo,
  APIErrorResponse,
} from "./types";

/**
 * FreeAstrologyAPI Client
 *
 * Integrates with FreeAstrologyAPI.com with:
 * - Aggressive caching (24 hour TTL) to respect 50 req/day limit
 * - Rate limit tracking
 * - Automatic retry on failures
 * - Performance monitoring
 *
 * IMPORTANT: Free tier has 50 requests/day limit
 */

const BASE_URL = "https://json.freeastrologyapi.com";

/**
 * Get API key from environment
 */
function getAPIKey(): string {
  const apiKey = process.env.FREE_ASTROLOGY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FREE_ASTROLOGY_API_KEY environment variable is not set. " +
        "Please add it to your .env.local file.",
    );
  }

  return apiKey;
}

/**
 * Rate limit storage (in-memory for now, should use Redis in production)
 */
class RateLimitTracker {
  private requestsToday = 0;
  private resetDate: string = new Date().toISOString().split("T")[0] ?? "";

  private checkReset() {
    const today = new Date().toISOString().split("T")[0] ?? "";
    if (today !== this.resetDate) {
      this.requestsToday = 0;
      this.resetDate = today;
      logger.info("Rate limit reset for new day", { date: today });
    }
  }

  increment() {
    this.checkReset();
    this.requestsToday++;

    logger.info("API request made", {
      used: this.requestsToday,
      limit: 50,
      remaining: 50 - this.requestsToday,
    });

    if (this.requestsToday >= 50) {
      logger.error("Daily API rate limit exceeded!", {
        used: this.requestsToday,
        limit: 50,
      });

      captureException(new Error("FreeAstrologyAPI daily rate limit exceeded"), {
        tags: { component: "astrology-api" },
        extra: { requests_today: this.requestsToday },
      });
    }
  }

  getInfo(): RateLimitInfo {
    this.checkReset();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      daily_limit: 50,
      used_today: this.requestsToday,
      remaining_today: Math.max(0, 50 - this.requestsToday),
      reset_at: tomorrow.toISOString(),
      last_request_at: new Date().toISOString(),
    };
  }

  canMakeRequest(): boolean {
    this.checkReset();
    return this.requestsToday < 50;
  }
}

export const rateLimitTracker = new RateLimitTracker();

/**
 * Make API request with rate limiting and monitoring
 */
async function makeRequest<T>(
  endpoint: string,
  payload: Partial<AstrologyRequest> | Record<string, unknown>,
  operationName: string,
): Promise<T> {
  // Check rate limit
  if (!rateLimitTracker.canMakeRequest()) {
    const limitInfo = rateLimitTracker.getInfo();
    throw new Error(
      `Daily API rate limit exceeded (${limitInfo.used_today}/${limitInfo.daily_limit}). ` +
        `Resets at ${limitInfo.reset_at}`,
    );
  }

  const url = `${BASE_URL}${endpoint}`;

  return measureAsync(
    `astrology_api_${operationName}`,
    async () => {
      try {
        rateLimitTracker.increment();

        const response = await retryFetch(
          url,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": getAPIKey(),
            },
            body: JSON.stringify(payload),
          },
          {
            maxRetries: 2, // Limit retries to save quota
            initialDelay: 2000,
          },
        );

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as APIErrorResponse;
          throw new Error(
            `API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`,
          );
        }

        const data = await response.json();

        logger.debug("API request successful", {
          endpoint,
          operation: operationName,
          ...rateLimitTracker.getInfo(),
        });

        return data as T;
      } catch (error: unknown) {
        logger.error("API request failed", error, {
          endpoint,
          operation: operationName,
        });

        captureException(error, {
          tags: { component: "astrology-api", endpoint },
          extra: { operation: operationName },
        });

        throw error;
      }
    },
    { endpoint, operation: operationName },
  );
}

/**
 * Astrology API Client
 */
export class AstrologyAPIClient {
  /**
   * Get birth chart (D1 Rasi chart)
   */
  async getBirthChart(request: AstrologyRequest): Promise<BirthChartResponse> {
    return makeRequest<BirthChartResponse>("/planets", request, "birth_chart");
  }

  /**
   * Get divisional chart (D2-D60)
   */
  async getDivisionalChart(
    request: AstrologyRequest,
    chartType: DivisionalChartType,
  ): Promise<BirthChartResponse> {
    return makeRequest<BirthChartResponse>(
      `/planets-${chartType.toLowerCase()}`,
      request,
      `divisional_chart_${chartType}`,
    );
  }

  /**
   * Get chart as SVG code
   */
  async getChartSVG(request: AstrologyRequest): Promise<SVGChartResponse> {
    const response = await makeRequest<Record<string, unknown>>(
      "/horoscope-chart-svg-code",
      request,
      "chart_svg",
    );

    // 🔧 FIX: Transform API response to match our interface
    // API returns: { statusCode: 200, output: "<svg>..." }
    // We need: { svg_code: "<svg>...", chart_name: "Rasi Chart" }
    return {
      svg_code: (response.output as string) || (response.svg_code as string) || "",
      chart_name: "Rasi Chart", // D1 is always Rasi chart
    };
  }

  /**
   * Get divisional chart as SVG
   */
  async getDivisionalChartSVG(
    request: AstrologyRequest,
    chartType: DivisionalChartType,
  ): Promise<SVGChartResponse> {
    const response = await makeRequest<Record<string, unknown>>(
      `/horoscope-chart-${chartType.toLowerCase()}-svg-code`,
      request,
      `chart_svg_${chartType}`,
    );

    // 🔧 FIX: Transform API response to match our interface
    // API returns: { statusCode: 200, output: "<svg>..." }
    // We need: { svg_code: "<svg>...", chart_name: "D9 Chart" }
    const chartNames: Record<string, string> = {
      D1: "Rasi Chart",
      D2: "Hora Chart",
      D3: "Drekkana Chart",
      D4: "Chaturthamsa Chart",
      D7: "Saptamsa Chart",
      D9: "Navamsa Chart",
      D10: "Dasamsa Chart",
      D12: "Dwadasamsa Chart",
      D16: "Shodasamsa Chart",
      D20: "Vimsamsa Chart",
      D24: "Chaturvimsamsa Chart",
      D27: "Bhamsa Chart",
      D30: "Trimsamsa Chart",
      D40: "Khavedamsa Chart",
      D45: "Akshavedamsa Chart",
      D60: "Shashtiamsa Chart",
    };

    return {
      svg_code: (response.output as string) || (response.svg_code as string) || "",
      chart_name: chartNames[chartType] || `${chartType} Chart`,
    };
  }

  /**
   * Get Panchang for a date
   */
  async getPanchang(request: AstrologyRequest): Promise<PanchangResponse> {
    return makeRequest<PanchangResponse>("/panchang", request, "panchang");
  }

  /**
   * Get compatibility between two people (Ashtakoot matching)
   */
  async getCompatibility(
    person1: AstrologyRequest,
    person2: AstrologyRequest,
  ): Promise<CompatibilityResponse> {
    return makeRequest<CompatibilityResponse>(
      "/match-making",
      {
        male: person1,
        female: person2,
      },
      "compatibility",
    );
  }

  /**
   * Get Vimsottari Dasa periods
   */
  async getDasa(request: AstrologyRequest): Promise<DasaResponse> {
    return makeRequest<DasaResponse>("/vimsottari-maha-dasa", request, "dasa");
  }

  /**
   * Get planetary strength (Shad Bala)
   */
  async getPlanetaryStrength(request: AstrologyRequest): Promise<PlanetaryStrengthResponse> {
    return makeRequest<PlanetaryStrengthResponse>("/shad-bala", request, "planetary_strength");
  }

  /**
   * Get Western astrology natal chart
   */
  async getWesternNatal(request: AstrologyRequest): Promise<WesternNatalResponse> {
    return makeRequest<WesternNatalResponse>("/western-planets", request, "western_natal");
  }

  /**
   * Get current rate limit info
   */
  getRateLimitInfo(): RateLimitInfo {
    return rateLimitTracker.getInfo();
  }
}

/**
 * Singleton instance
 */
export const astrologyAPI = new AstrologyAPIClient();

/**
 * Helper to create request payload with defaults
 */
export function createAstrologyRequest(
  birthDetails: {
    dateTime: Date;
    latitude: number;
    longitude: number;
    timezone: number;
  },
  config: Partial<AstrologyRequest> = {},
): AstrologyRequest {
  const { dateTime, latitude, longitude, timezone } = birthDetails;

  return {
    year: dateTime.getFullYear(),
    month: dateTime.getMonth() + 1, // 0-indexed to 1-indexed
    date: dateTime.getDate(),
    hours: dateTime.getHours(),
    minutes: dateTime.getMinutes(),
    seconds: dateTime.getSeconds(),
    latitude,
    longitude,
    timezone,
    observation_point: config.observation_point || "topocentric",
    ayanamsha: config.ayanamsha || "lahiri",
  };
}
