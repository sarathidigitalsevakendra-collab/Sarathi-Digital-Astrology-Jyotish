import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { detectYogas, buildPlanetDataFromChart } from "@/lib/astrology/calculations/YogaDetector";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/yoga-detection
 * Body: {
 *   planets: Array<{ name: string; fullDegree: number; house?: number }>;
 *   ascendant: number; // ascendant longitude 0-360
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      planets?: Array<{ name: string; fullDegree: number; house?: number }>;
      ascendant?: number;
    };

    if (!body.planets || !Array.isArray(body.planets) || body.planets.length < 6) {
      return NextResponse.json(
        { error: "planets array with at least Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn is required" },
        { status: 400 },
      );
    }
    if (body.ascendant === undefined || body.ascendant < 0 || body.ascendant > 360) {
      return NextResponse.json(
        { error: "ascendant longitude (0–360°) is required" },
        { status: 400 },
      );
    }

    const planetMap = buildPlanetDataFromChart(body.planets, body.ascendant);
    const ascRashi = Math.floor(body.ascendant / 30) + 1;
    const result = detectYogas(planetMap, ascRashi);

    logger.info("Yoga detection completed", {
      totalYogas: result.summary.total_yogas,
      hasMahapurusha: result.summary.has_mahapurusha,
      hasRajaYoga: result.summary.has_raja_yoga,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Yoga detection error", error);
    return NextResponse.json({ error: "Failed to detect yogas" }, { status: 500 });
  }
}
