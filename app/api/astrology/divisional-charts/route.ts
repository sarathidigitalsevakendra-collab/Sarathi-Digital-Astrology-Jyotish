import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { cache } from "@/lib/api/cache";
import { 
  calculatePlanetaryPositions, 
  calculateAscendant 
} from "@/lib/astrology/calculations/PlanetaryPositions";
import { 
  calculateDivisionalChart, 
  SUPPORTED_VARGAS 
} from "@/lib/astrology/calculations/DivisionalCharts";
import type { VargaPlanet } from "@/lib/astrology/calculations/DivisionalCharts";
import { getSignName } from "@/lib/astrology/calculations/VedicMath";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";

// Cache TTL: 24 hours
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

/**
 * POST /api/astrology/divisional-charts
 *
 * Calculate Divisional Charts from birth details using local high-precision engine.
 */

interface DivisionalRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chart?: string; // e.g. "D9", "all"
}

function isValidRequest(body: unknown): body is DivisionalRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    // Authentication Check
    await requireAuth();

    const body: unknown = await request.json();

    if (!isValidRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body", required: ["dateTime", "latitude", "longitude", "timezone"] },
        { status: 400 }
      );
    }

    const { dateTime, latitude, longitude, chart } = body;
    const birthDate = new Date(dateTime);
    
    // Generate cache key
    const requestedChart = chart || "all";
    const cacheKey = `astro:varga:${requestedChart}:${latitude}:${longitude}:${birthDate.getTime()}`;

    // Check cache
    const cachedResult = cache.get(cacheKey, { ttl: CACHE_TTL_24H });
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        _meta: {
          fromCache: true,
          calculationTimeMs: Math.round(performance.now() - startTime),
        }
      });
    }

    // Step 1: Calculate Planetary Positions (D1 Base)
    const positions = calculatePlanetaryPositions(birthDate, latitude, longitude);
    const ascendantDeg = calculateAscendant(birthDate, latitude, longitude);
    
    // Convert to VargaPlanet format (D1 base)
    const basePlanets: VargaPlanet[] = positions.map(p => ({
      name: p.name,
      longitude: p.longitude,
      vargaLongitude: p.longitude, // Initial D1
      rashi: Math.floor(p.longitude / 30) + 1
    }));

    // Add Ascendant
    basePlanets.push({
      name: "Ascendant",
      longitude: ascendantDeg,
      vargaLongitude: ascendantDeg,
      rashi: Math.floor(ascendantDeg / 30) + 1
    });

    // Step 2: Calculate Requested Divisional Charts
    const resultsMap = new Map<string, any>();
    const chartsToCalc = requestedChart === "all" ? Object.keys(SUPPORTED_VARGAS) : [requestedChart];

    for (const key of chartsToCalc) {
      if (Object.prototype.hasOwnProperty.call(SUPPORTED_VARGAS, key)) {
        const divData = calculateDivisionalChart(key, basePlanets, SUPPORTED_VARGAS[key] as number);
        
        // Enrich with metadata like Sign Names
        const enrichedPlanets: Record<string, any> = {};
        for (const [pName, pData] of Object.entries(divData.planets)) {
          enrichedPlanets[pName] = {
            ...pData,
            signName: getSignName(pData.rashi)
          };
        }
        
        resultsMap.set(key, {
          chart: key,
          division: SUPPORTED_VARGAS[key],
          ascendant: {
            ...divData.ascendant,
            signName: getSignName(divData.ascendant.rashi)
          },
          planets: enrichedPlanets
        });
      }
    }

    const response = {
      charts: Object.fromEntries(resultsMap),
      backend: "internal_ts_v2",
    };

    // Cache result
    cache.set(cacheKey, response);

    return NextResponse.json({
      ...response,
      _meta: {
        fromCache: false,
        calculationTimeMs: Math.round(performance.now() - startTime),
      }
    });

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    logger.error("Divisional charts API error", error);
    return NextResponse.json(
      { error: "Failed to calculate divisional charts", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
