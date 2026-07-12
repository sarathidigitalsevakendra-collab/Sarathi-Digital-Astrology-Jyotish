import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { cache } from "@/lib/api/cache";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { calculatePlanetaryPositions, calculateAscendant } from "@/lib/astrology/calculations/PlanetaryPositions";
import { buildPlanetDataFromChart } from "@/lib/astrology/calculations/YogaDetector";
import { calculateTransits } from "@/lib/astrology/calculations/Transits";

// Cache TTL: 1 hour (Transits change slowly)
const CACHE_TTL_1H = 60 * 60 * 1000;

interface TransitsRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
}

function isValidRequest(body: unknown): body is TransitsRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number"
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
        { error: "Invalid request body", required: ["dateTime", "latitude", "longitude"] },
        { status: 400 }
      );
    }

    const { dateTime, latitude, longitude } = body;
    const birthDate = new Date(dateTime);
    
    // Generate cache key based on birth details + current hour
    // We quantize current time to hour to allow caching for "current" transits
    const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const cacheKey = `astro:transits:${dateTime}:${latitude}:${longitude}:${currentHour}`;

    // Check cache
    const cachedResult = cache.get(cacheKey, { ttl: CACHE_TTL_1H });
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        _meta: {
          fromCache: true,
          calculationTimeMs: Math.round(performance.now() - startTime),
        }
      });
    }

    // 1. Calculate Natal Positions (Re-calc for statelessness)
    const natalPositions = calculatePlanetaryPositions(birthDate, latitude, longitude);
    const ascendantDeg = calculateAscendant(birthDate, latitude, longitude);
    
    // Map to PlanetInput format for builder
    const chartPlanets = natalPositions.map(p => ({
      name: p.name,
      fullDegree: p.longitude,
    }));

    // Build secure Natal Map
    const natalMap = buildPlanetDataFromChart(chartPlanets, ascendantDeg);

    // 2. Calculate Transits
    // Uses current server time by default
    const transitResults = calculateTransits(natalMap);

    const response = {
      ...transitResults,
      backend: "internal_ts_v1",
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
    logger.error("Transits API error", error);
    return NextResponse.json(
      { error: "Failed to calculate transits", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
