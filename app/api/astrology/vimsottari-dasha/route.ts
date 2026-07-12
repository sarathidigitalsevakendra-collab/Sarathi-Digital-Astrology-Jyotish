import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { rateLimiters } from "@/lib/rate-limit";
import { cache } from "@/lib/api/cache";
import {
  calculateVimsottariDasha,
  getApproximateMoonLongitude,
} from "@/lib/astrology/calculations/DashaCalculator";
import { calculatePlanetaryPositions } from "@/lib/astrology/calculations/PlanetaryPositions";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import type { DashaResult } from "@/lib/astrology/calculations/DashaCalculator";

// Cache TTL: 24 hours (birth data is immutable)
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

/**
 * POST /api/astrology/vimsottari-dasha
 *
 * Calculate Vimsottari Dasha periods using local TypeScript calculation.
 * No external HTTP dependencies - fully self-hosted.
 */

interface DashaRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  yearsToCalculate?: number;
  moonLongitude?: number;
}

// Validation constants
const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LON = -180;
const MAX_LON = 180;
const MIN_TZ = -12;
const MAX_TZ = 14;
const MIN_YEARS = 1;
const MAX_YEARS = 150;
const MIN_MOON_LON = 0;
const MAX_MOON_LON = 360;
const MIN_BIRTH_YEAR = 1800;
const MAX_BIRTH_YEAR = 2200;

function validateRequest(body: unknown): { valid: true; data: DashaRequestBody } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be an object" };
  }

  const candidate = body as Record<string, unknown>;

  // Required fields type check
  if (typeof candidate.dateTime !== "string") {
    return { valid: false, error: "dateTime must be a string" };
  }
  if (typeof candidate.latitude !== "number" || isNaN(candidate.latitude)) {
    return { valid: false, error: "latitude must be a valid number" };
  }
  if (typeof candidate.longitude !== "number" || isNaN(candidate.longitude)) {
    return { valid: false, error: "longitude must be a valid number" };
  }
  if (typeof candidate.timezone !== "number" || isNaN(candidate.timezone)) {
    return { valid: false, error: "timezone must be a valid number" };
  }

  // Range validation
  if (candidate.latitude < MIN_LAT || candidate.latitude > MAX_LAT) {
    return { valid: false, error: `latitude must be between ${MIN_LAT} and ${MAX_LAT}` };
  }
  if (candidate.longitude < MIN_LON || candidate.longitude > MAX_LON) {
    return { valid: false, error: `longitude must be between ${MIN_LON} and ${MAX_LON}` };
  }
  if (candidate.timezone < MIN_TZ || candidate.timezone > MAX_TZ) {
    return { valid: false, error: `timezone must be between ${MIN_TZ} and ${MAX_TZ}` };
  }

  // Parse and validate date
  const birthDate = new Date(candidate.dateTime);
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: "Invalid dateTime format. Use ISO 8601 format." };
  }
  const year = birthDate.getFullYear();
  if (year < MIN_BIRTH_YEAR || year > MAX_BIRTH_YEAR) {
    return { valid: false, error: `Birth year must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}` };
  }

  // Optional fields validation
  if (candidate.yearsToCalculate !== undefined) {
    if (typeof candidate.yearsToCalculate !== "number" || isNaN(candidate.yearsToCalculate)) {
      return { valid: false, error: "yearsToCalculate must be a number" };
    }
    if (candidate.yearsToCalculate < MIN_YEARS || candidate.yearsToCalculate > MAX_YEARS) {
      return { valid: false, error: `yearsToCalculate must be between ${MIN_YEARS} and ${MAX_YEARS}` };
    }
  }

  if (candidate.moonLongitude !== undefined) {
    if (typeof candidate.moonLongitude !== "number" || isNaN(candidate.moonLongitude)) {
      return { valid: false, error: "moonLongitude must be a number" };
    }
    if (candidate.moonLongitude < MIN_MOON_LON || candidate.moonLongitude >= MAX_MOON_LON) {
      return { valid: false, error: `moonLongitude must be between ${MIN_MOON_LON} and ${MAX_MOON_LON}` };
    }
  }

  return {
    valid: true,
    data: {
      dateTime: candidate.dateTime,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      timezone: candidate.timezone,
      yearsToCalculate: candidate.yearsToCalculate as number | undefined,
      moonLongitude: candidate.moonLongitude as number | undefined,
    },
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    // Authentication Check
    await requireAuth();

    // Rate limiting check
    const rateLimitResponse = await rateLimiters.astrology(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse JSON with error handling
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: validation.error,
          required: ["dateTime", "latitude", "longitude", "timezone"],
          optional: ["yearsToCalculate", "moonLongitude"],
        },
        { status: 400 }
      );
    }

    const { dateTime, yearsToCalculate, moonLongitude } = validation.data;
    const birthDate = new Date(dateTime);

    // Get Moon longitude (use provided or calculate using real ephemeris)
    let moonLon = moonLongitude;
    
    if (moonLon === undefined) {
      // Calculate precise positions
      const planets = calculatePlanetaryPositions(birthDate, validation.data.latitude, validation.data.longitude);
      const moon = planets.find(p => p.name === "Moon");
      if (moon) {
        moonLon = moon.longitude;
      } else {
        // Fallback to approximation should not happen effectively
        moonLon = getApproximateMoonLongitude(birthDate);
      }
    }
    const years = yearsToCalculate ?? 100;

    // Generate cache key
    const cacheKey = `astro:dasha:${moonLon.toFixed(2)}:${birthDate.getTime()}:${years}`;

    // Check cache first
    const cachedResult = cache.get<DashaResult>(cacheKey, { ttl: CACHE_TTL_24H });
    if (cachedResult) {
      const duration = Math.round(performance.now() - startTime);
      logger.info("Dasha cache hit", { cacheKey, duration });
      
      return NextResponse.json({
        ...cachedResult,
        _meta: {
          calculationTimeMs: duration,
          fromCache: true,
          timestamp: new Date().toISOString(),
        },
      }, { status: 200 });
    }

    logger.info("Calculating Vimsottari Dasha (local)", {
      birthDate: birthDate.toISOString(),
      moonLongitude: moonLon,
      yearsToCalculate: years,
    });

    // Calculate Dasha using local TypeScript calculator
    const result = calculateVimsottariDasha(moonLon, birthDate, years);

    // Store in cache
    cache.set(cacheKey, result);

    const duration = Math.round(performance.now() - startTime);
    
    return NextResponse.json({
      ...result,
      _meta: {
        calculationTimeMs: duration,
        fromCache: false,
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 });
  } catch (error: unknown) {
    const duration = Math.round(performance.now() - startTime);
    
    if (error instanceof ApiError) {
      logger.warn("Dasha API auth error", { error: error.message, code: error.code, duration });
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    logger.error("Dasha API error", { error, duration });

    return NextResponse.json(
      {
        error: "Failed to calculate Dasha",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
