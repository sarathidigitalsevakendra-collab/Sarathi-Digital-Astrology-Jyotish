/* eslint-disable @typescript-eslint/no-unused-vars */
import { cached } from "@/lib/api/cache";
import { logger } from "@/lib/monitoring/logger";
import { astrologyOrchestrator } from "./service-orchestrator";
import { astrologyAPI, createAstrologyRequest } from "./client";
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
  CachedResponse,
  ServiceBackend,
} from "./types";

/**
 * Cached Astrology API Client
 *
 * Uses the service orchestrator to automatically route requests between:
 * - Python FastAPI service (Railway) - PRIMARY, unlimited requests
 * - FreeAstrologyAPI - FALLBACK, 50 req/day limit
 *
 * Wraps all API calls with aggressive 24-hour caching for optimal performance.
 *
 * Cache Strategy:
 * - Birth charts: 24 hours (birth data doesn't change)
 * - Panchang: 6 hours (daily data, but changes slowly)
 * - Compatibility: 24 hours (static calculation)
 * - SVG charts: 24 hours (visual representation doesn't change)
 *
 * Cache keys are based on:
 * - Birth date/time
 * - Location (lat/long)
 * - Timezone
 * - Chart configuration (ayanamsha, observation point)
 */

// 24 hours in milliseconds
const CACHE_24H = 24 * 60 * 60 * 1000;

// 6 hours in milliseconds
const CACHE_6H = 6 * 60 * 60 * 1000;

/**
 * Generate cache key for birth-based data
 */
function generateCacheKey(request: AstrologyRequest, suffix: string): string {
  const {
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    latitude,
    longitude,
    timezone,
    observation_point,
    ayanamsha,
  } = request;

  // Round coordinates to 4 decimal places (~11 meters precision)
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);

  return `astro:${suffix}:${year}-${month}-${date}T${hours}:${minutes}:${seconds}:${lat}:${lon}:${timezone}:${observation_point}:${ayanamsha}`;
}

/**
 * Generate cache key for compatibility (two people)
 */
function generateCompatibilityKey(person1: AstrologyRequest, person2: AstrologyRequest): string {
  // Sort to ensure same result regardless of order
  const key1 = generateCacheKey(person1, "p1");
  const key2 = generateCacheKey(person2, "p2");

  return `astro:compatibility:${key1}:${key2}`;
}

/**
 * Wrap response with cache metadata
 */
function wrapCachedResponse<T>(data: T, ttl: number, source?: ServiceBackend): CachedResponse<T> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl);

  return {
    data,
    cachedAt: now.toISOString(),
    cached_at: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    from_cache: false, // Will be true if served from cache
    source: source || "freeastrology",
  };
}

/**
 * Cached API methods
 */

const getBirthChartCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching birth chart from orchestrator", { request });
    const { data, source } = await astrologyOrchestrator.getBirthChart(request);
    return wrapCachedResponse(data, CACHE_24H, source);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) => generateCacheKey(args[0] as AstrologyRequest, "birth-chart"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<BirthChartResponse>>;

const getDivisionalChartCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    const chartType = args[1] as DivisionalChartType;
    logger.info("Fetching divisional chart from API", { request, chartType });
    const data = await astrologyAPI.getDivisionalChart(request, chartType);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) =>
      generateCacheKey(args[0] as AstrologyRequest, `div-chart-${args[1]}`),
    staleWhileRevalidate: true,
  },
) as (
  request: AstrologyRequest,
  chartType: DivisionalChartType,
) => Promise<CachedResponse<BirthChartResponse>>;

const getChartSVGCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching chart SVG from orchestrator", { request });
    const { data, source } = await astrologyOrchestrator.getChartSVG(request);
    return wrapCachedResponse(data, CACHE_24H, source);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) => generateCacheKey(args[0] as AstrologyRequest, "chart-svg"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<SVGChartResponse>>;

const getDivisionalChartSVGCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    const chartType = args[1] as DivisionalChartType;
    logger.info("Fetching divisional chart SVG from API", {
      request,
      chartType,
    });
    const data = await astrologyAPI.getDivisionalChartSVG(request, chartType);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) =>
      generateCacheKey(args[0] as AstrologyRequest, `chart-svg-${args[1]}`),
    staleWhileRevalidate: true,
  },
) as (
  request: AstrologyRequest,
  chartType: DivisionalChartType,
) => Promise<CachedResponse<SVGChartResponse>>;

const getPanchangCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching panchang from API", { request });
    const data = await astrologyAPI.getPanchang(request);
    return wrapCachedResponse(data, CACHE_6H);
  },
  {
    ttl: CACHE_6H, // Shorter TTL for daily changing data
    key: (...args: unknown[]) => generateCacheKey(args[0] as AstrologyRequest, "panchang"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<PanchangResponse>>;

const getCompatibilityCached = cached(
  async (...args: unknown[]) => {
    const person1 = args[0] as AstrologyRequest;
    const person2 = args[1] as AstrologyRequest;
    logger.info("Fetching compatibility from API", { person1, person2 });
    const data = await astrologyAPI.getCompatibility(person1, person2);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) =>
      generateCompatibilityKey(args[0] as AstrologyRequest, args[1] as AstrologyRequest),
    staleWhileRevalidate: true,
  },
) as (
  person1: AstrologyRequest,
  person2: AstrologyRequest,
) => Promise<CachedResponse<CompatibilityResponse>>;

const getDasaCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching dasa from API", { request });
    const data = await astrologyAPI.getDasa(request);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) => generateCacheKey(args[0] as AstrologyRequest, "dasa"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<DasaResponse>>;

const getPlanetaryStrengthCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching planetary strength from API", { request });
    const data = await astrologyAPI.getPlanetaryStrength(request);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) =>
      generateCacheKey(args[0] as AstrologyRequest, "planetary-strength"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<PlanetaryStrengthResponse>>;

const getWesternNatalCached = cached(
  async (...args: unknown[]) => {
    const request = args[0] as AstrologyRequest;
    logger.info("Fetching western natal from API", { request });
    const data = await astrologyAPI.getWesternNatal(request);
    return wrapCachedResponse(data, CACHE_24H);
  },
  {
    ttl: CACHE_24H,
    key: (...args: unknown[]) => generateCacheKey(args[0] as AstrologyRequest, "western-natal"),
    staleWhileRevalidate: true,
  },
) as (request: AstrologyRequest) => Promise<CachedResponse<WesternNatalResponse>>;

/**
 * Cached Astrology API Client
 * Use this instead of direct astrologyAPI to benefit from caching
 */
export class CachedAstrologyAPIClient {
  async getBirthChart(request: AstrologyRequest): Promise<CachedResponse<BirthChartResponse>> {
    const result = await getBirthChartCached(request);
    result.from_cache = true;
    return result;
  }

  async getDivisionalChart(
    request: AstrologyRequest,
    chartType: DivisionalChartType,
  ): Promise<CachedResponse<BirthChartResponse>> {
    const result = await getDivisionalChartCached(request, chartType);
    result.from_cache = true;
    return result;
  }

  async getChartSVG(request: AstrologyRequest): Promise<CachedResponse<SVGChartResponse>> {
    const result = await getChartSVGCached(request);
    result.from_cache = true;
    return result;
  }

  async getDivisionalChartSVG(
    request: AstrologyRequest,
    chartType: DivisionalChartType,
  ): Promise<CachedResponse<SVGChartResponse>> {
    const result = await getDivisionalChartSVGCached(request, chartType);
    result.from_cache = true;
    return result;
  }

  async getPanchang(request: AstrologyRequest): Promise<CachedResponse<PanchangResponse>> {
    const result = await getPanchangCached(request);
    result.from_cache = true;
    return result;
  }

  async getCompatibility(
    person1: AstrologyRequest,
    person2: AstrologyRequest,
  ): Promise<CachedResponse<CompatibilityResponse>> {
    const result = await getCompatibilityCached(person1, person2);
    result.from_cache = true;
    return result;
  }

  async getDasa(request: AstrologyRequest): Promise<CachedResponse<DasaResponse>> {
    const result = await getDasaCached(request);
    result.from_cache = true;
    return result;
  }

  async getPlanetaryStrength(
    request: AstrologyRequest,
  ): Promise<CachedResponse<PlanetaryStrengthResponse>> {
    const result = await getPlanetaryStrengthCached(request);
    result.from_cache = true;
    return result;
  }

  async getWesternNatal(request: AstrologyRequest): Promise<CachedResponse<WesternNatalResponse>> {
    const result = await getWesternNatalCached(request);
    result.from_cache = true;
    return result;
  }

  /**
   * Get rate limit info from underlying client
   */
  getRateLimitInfo() {
    return astrologyAPI.getRateLimitInfo();
  }
}

/**
 * Export singleton instance
 * USE THIS for all astrology API calls to benefit from caching
 */
export const cachedAstrologyAPI = new CachedAstrologyAPIClient();

/**
 * Re-export helper
 */
export { createAstrologyRequest };
