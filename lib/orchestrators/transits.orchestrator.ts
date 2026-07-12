/**
 * Transits Orchestrator
 *
 * Coordinates data fetching and calculation for Planetary Transits (Gochar).
 * - Fetches precise Natal positions (Python/FreeAstrologyAPI)
 * - Fetches precise Transit positions (Python/FreeAstrologyAPI)
 * - Analyzes aspects using local hybrid logic
 * - Caches results in Redis (6 hour TTL)
 */

import { logger } from "@/lib/monitoring/logger";
import { captureException } from "@/lib/monitoring/sentry";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";
import { cache } from "@/lib/api/cache";
import { 
  calculateTransits 
} from "@/lib/astrology/calculations/Transits";
import { 
  calculateAscendant
} from "@/lib/astrology/calculations/PlanetaryPositions";
import { buildPlanetDataFromChart } from "@/lib/astrology/calculations/YogaDetector";
import type { 
  TransitRequest, 
  TransitsResponse,
  AstrologyRequest 
} from "@/lib/astrology/types";

// Cache TTL: 6 hours (Transits change slowly, but we want reasonable freshness)
const TRANSITS_CACHE_TTL = 6 * 60 * 60 * 1000;

export interface TransitResult {
  data: TransitsResponse;
  source: string;
  cached: boolean;
}

/**
 * Generate cache key for transits
 */
function generateCacheKey(request: TransitRequest): string {
  const { dateTime, latitude, longitude, timezone, transitDate } = request;
  
  // Normalize dates to hour precision for caching
  const birthKey = new Date(dateTime).toISOString().slice(0, 13);
  const transitKey = transitDate 
    ? new Date(transitDate).toISOString().slice(0, 13) 
    : new Date().toISOString().slice(0, 13);

  return `transits:${birthKey}:${transitKey}:${latitude.toFixed(2)}:${longitude.toFixed(2)}:${timezone}`;
}

/**
 * Get transits analysis with caching and orchestration
 */
export async function getTransits(request: TransitRequest): Promise<TransitResult> {
  const { dateTime, latitude, longitude, timezone, transitDate } = request;
  const birthDate = new Date(dateTime);
  const targetDate = transitDate ? new Date(transitDate) : new Date();

  // Generate cache key
  const cacheKey = generateCacheKey(request);

  // Check cache
  const cachedResult = cache.get<TransitResult>(cacheKey, { ttl: TRANSITS_CACHE_TTL });
  if (cachedResult) {
    logger.info("Transits cache hit", { cacheKey });
    return { ...cachedResult, cached: true };
  }

  logger.debug("Transits cache miss", { cacheKey });

  try {
    // Parallel Fetching Strategy:
    // 1. Natal Positions (Orchestrator -> External API)
    // 2. Transit Positions (Orchestrator -> External API)
    
    // Construct requests
    const natalReq: AstrologyRequest = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      date: birthDate.getDate(),
      hours: birthDate.getHours(),
      minutes: birthDate.getMinutes(),
      seconds: birthDate.getSeconds(),
      latitude,
      longitude,
      timezone,
    };

    const transitReq: AstrologyRequest = {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      date: targetDate.getDate(),
      hours: targetDate.getHours(),
      minutes: targetDate.getMinutes(),
      seconds: targetDate.getSeconds(),
      // For transits, we use geocentric positions (0,0), effectively independent of location
      // But API requires lat/long, so we can use same as natal or 0,0
      latitude: 0, 
      longitude: 0,
      timezone: 0, 
    };

    // Execute fetches in parallel
    const [natalResponse, transitResponse] = await Promise.all([
      astrologyOrchestrator.getBirthChart(natalReq),
      astrologyOrchestrator.getBirthChart(transitReq)
    ]);

    // Prepare data for analysis
    const source = `${natalResponse.source}+${transitResponse.source}`;
    
    // 1. Build Natal Map
    // Note: We need Ascendant for the Natal map. The external API returns planets including Ascendant usually,
    // but if not, we can calculate it locally or extract it.
    // Our Python/FreeAstrologyAPI responses include 'Ascendant' in the planets array.
    
    const ascendantPlanet = natalResponse.data.output.find(p => p.name === "Ascendant");
    const ascendantDeg = ascendantPlanet ? ascendantPlanet.fullDegree : calculateAscendant(birthDate, latitude, longitude);

    const chartPlanets = natalResponse.data.output
      .filter(p => p.name !== "Ascendant") // buildPlanetDataFromChart expects planets
      .map(p => ({
        name: p.name,
        fullDegree: p.fullDegree
      }));
      
    const natalMap = buildPlanetDataFromChart(chartPlanets, ascendantDeg);

    // 2. Prepare Transit Positions
    const transitPositions = transitResponse.data.output.map(p => ({
      name: p.name,
      longitude: p.fullDegree
    }));

    // 3. Analyze Transits (Hybrid Logic)
    const analysis = calculateTransits(natalMap, targetDate, transitPositions);

    const result: TransitResult = {
      data: analysis,
      source,
      cached: false
    };

    // Cache result
    cache.set(cacheKey, result);

    logger.info("Transits generated", { 
      source,
      aspects: analysis.summary.totalAspects,
      tone: analysis.summary.overallTone 
    });

    return result;

  } catch (error) {
    logger.error("Transit generation failed", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    captureException(error instanceof Error ? error : new Error(String(error)), {
      extra: { request }
    });

    throw error;
  }
}
