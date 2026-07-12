import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { cache } from "@/lib/api/cache";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { calculatePlanetaryPositions, calculateAscendant } from "@/lib/astrology/calculations/PlanetaryPositions";
import { calculateMatchmaking } from "@/lib/astrology/calculations/Matchmaking";

// Cache TTL: 24h
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

interface ProfileInput {
  dateTime: string;
  latitude: number;
  longitude: number;
}

interface MatchmakingRequestBody {
  boy: ProfileInput;
  girl: ProfileInput;
}

function isValidProfile(p: unknown): p is ProfileInput {
  if (typeof p !== "object" || p === null) return false;
  const candidate = p as Record<string, unknown>;
  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    // Auth Check
    await requireAuth();

    const body: unknown = await request.json();
    const { boy, girl } = body as MatchmakingRequestBody;

    if (!isValidProfile(boy) || !isValidProfile(girl)) {
      return NextResponse.json(
        { error: "Invalid request. 'boy' and 'girl' objects required with dateTime, lat, lon." },
        { status: 400 }
      );
    }
    
    // Cache Key
    const cacheKey = `astro:match:${boy.dateTime}:${boy.latitude}|${girl.dateTime}:${girl.latitude}`;
    
    const cachedResult = cache.get(cacheKey, { ttl: CACHE_TTL_24H });
    if (cachedResult) {
       return NextResponse.json({ ...cachedResult, _meta: { fromCache: true } });
    }

    // 1. Calculate Boy Positions
    const boyDate = new Date(boy.dateTime);
    const boyPlanets = calculatePlanetaryPositions(boyDate, boy.latitude, boy.longitude);
    const boyAsc = calculateAscendant(boyDate, boy.latitude, boy.longitude);
    
    // 2. Calculate Girl Positions
    const girlDate = new Date(girl.dateTime);
    const girlPlanets = calculatePlanetaryPositions(girlDate, girl.latitude, girl.longitude);
    const girlAsc = calculateAscendant(girlDate, girl.latitude, girl.longitude);

    // 3. Extract relevant points
    const boyMoon = boyPlanets.find(p => p.name === "Moon")!.longitude;
    const boyMars = boyPlanets.find(p => p.name === "Mars")!.longitude;
    
    const girlMoon = girlPlanets.find(p => p.name === "Moon")!.longitude;
    const girlMars = girlPlanets.find(p => p.name === "Mars")!.longitude;

    // 4. Run Matching
    const result = calculateMatchmaking(
      { moonLon: boyMoon, marsLon: boyMars, ascLon: boyAsc },
      { moonLon: girlMoon, marsLon: girlMars, ascLon: girlAsc }
    );

    const response = {
      ...result,
      profiles: {
        boy: { dateTime: boy.dateTime },
        girl: { dateTime: girl.dateTime }
      },
      backend: "internal_ts_v1"
    };

    cache.set(cacheKey, response);

    return NextResponse.json({
       ...response,
       _meta: {
         fromCache: false,
         calculationTimeMs: Math.round(performance.now() - startTime)
       }
    });

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    logger.error("Matchmaking API error", error);
    return NextResponse.json(
      { error: "Failed to calculate match", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
