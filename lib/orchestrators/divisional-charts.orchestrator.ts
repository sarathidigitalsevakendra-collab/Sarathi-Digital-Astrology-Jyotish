/**
 * Divisional Charts Orchestrator
 *
 * Provides caching and service orchestration for Vedic divisional chart calculations.
 * Supports D1-D60 charts with Redis-based caching and graceful degradation.
 */

import { logger } from "@/lib/monitoring/logger";
import { captureException } from "@/lib/monitoring/sentry";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";
import { cache } from "@/lib/api/cache";
import type {
  AstrologyRequest,
  BirthChartResponse,
  DivisionalChartType,
} from "@/lib/astrology/types";

// Cache TTL: 24 hours (divisional charts don't change)
const DIVISIONAL_CHART_CACHE_TTL = 24 * 60 * 60 * 1000;

// Valid divisional chart types
const VALID_CHART_TYPES: DivisionalChartType[] = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
];

export interface DivisionalChartResult {
  data: BirthChartResponse;
  source: string;
  cached: boolean;
  chartType: DivisionalChartType;
}

export interface DivisionalChartRequest {
  dateTime: Date;
  latitude: number;
  longitude: number;
  timezone: number;
  chartType: DivisionalChartType;
}

/**
 * Generate cache key for divisional chart
 */
function generateCacheKey(
  dateTime: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  chartType: DivisionalChartType
): string {
  // Normalize date to day level for caching (divisional charts don't change within a day)
  const dateKey = dateTime.toISOString().split("T")[0];
  const timeKey = `${dateTime.getHours()}:${dateTime.getMinutes()}`;
  
  return `divisional:${chartType}:${dateKey}:${timeKey}:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${timezone}`;
}

/**
 * Validate chart type
 */
export function validateChartType(type: string): type is DivisionalChartType {
  return VALID_CHART_TYPES.includes(type as DivisionalChartType);
}

/**
 * Get divisional chart with caching
 */
export async function getDivisionalChart(
  request: DivisionalChartRequest
): Promise<DivisionalChartResult> {
  const { dateTime, latitude, longitude, timezone, chartType } = request;

  // Validate chart type
  if (!validateChartType(chartType)) {
    throw new Error(`Invalid chart type: ${chartType}. Valid types: ${VALID_CHART_TYPES.join(", ")}`);
  }

  // Generate cache key
  const cacheKey = generateCacheKey(dateTime, latitude, longitude, timezone, chartType);

  // Check cache
  const cachedResult = cache.get<DivisionalChartResult>(cacheKey, {
    ttl: DIVISIONAL_CHART_CACHE_TTL,
  });

  if (cachedResult) {
    logger.info("Divisional chart cache hit", {
      chartType,
      date: dateTime.toISOString(),
      cacheKey,
    });
    return { ...cachedResult, cached: true };
  }

  logger.debug("Divisional chart cache miss", {
    chartType,
    date: dateTime.toISOString(),
    cacheKey,
  });

  // Create astrology request
  const astrologyRequest: AstrologyRequest = {
    year: dateTime.getFullYear(),
    month: dateTime.getMonth() + 1,
    date: dateTime.getDate(),
    hours: dateTime.getHours(),
    minutes: dateTime.getMinutes(),
    seconds: dateTime.getSeconds(),
    latitude,
    longitude,
    timezone,
  };

  try {
    // Get chart from orchestrator
    const { data, source } = await astrologyOrchestrator.getDivisionalChart(
      astrologyRequest,
      chartType
    );

    const result: DivisionalChartResult = {
      data,
      source,
      cached: false,
      chartType,
    };

    // Cache the result
    cache.set(cacheKey, result);

    logger.info("Divisional chart generated", {
      chartType,
      source,
      date: dateTime.toISOString(),
      planets: data.output?.length || 0,
    });

    return result;
  } catch (error) {
    logger.error("Divisional chart generation failed", {
      chartType,
      date: dateTime.toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });

    captureException(error instanceof Error ? error : new Error(String(error)), {
      extra: {
        chartType,
        dateTime: dateTime.toISOString(),
        latitude,
        longitude,
      },
    });

    throw error;
  }
}

/**
 * Get multiple divisional charts in parallel
 */
export async function getMultipleDivisionalCharts(
  request: Omit<DivisionalChartRequest, "chartType">,
  chartTypes: DivisionalChartType[]
): Promise<Record<DivisionalChartType, DivisionalChartResult>> {
  const results = await Promise.all(
    chartTypes.map(async (chartType) => {
      const result = await getDivisionalChart({ ...request, chartType });
      return [chartType, result] as const;
    })
  );

  return Object.fromEntries(results) as Record<DivisionalChartType, DivisionalChartResult>;
}

/**
 * Clear divisional chart cache
 */
export function clearDivisionalChartCache(): void {
  cache.clear();
  logger.info("Divisional chart cache cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  validChartTypes: DivisionalChartType[];
  cacheTTL: number;
} {
  return {
    validChartTypes: VALID_CHART_TYPES,
    cacheTTL: DIVISIONAL_CHART_CACHE_TTL,
  };
}
