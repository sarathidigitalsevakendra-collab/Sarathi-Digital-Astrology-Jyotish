import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateDoshaAnalysisReport } from "@/lib/astrology/calculations/DoshaAnalysis";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/dosha-analysis
 * Body: { planetLongitudes: Record<string, number> }
 *
 * Expects keys: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Ascendant
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();
    const body = await request.json() as { planetLongitudes?: Record<string, number> };

    if (!body.planetLongitudes || typeof body.planetLongitudes !== "object") {
      return NextResponse.json(
        { error: "planetLongitudes is required (object with planet name keys and degree values)" },
        { status: 400 },
      );
    }

    const required = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    const missing = required.filter(p => body.planetLongitudes![p] === undefined);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing planet longitudes: ${missing.join(", ")}` }, { status: 400 });
    }

    const report = generateDoshaAnalysisReport(body.planetLongitudes);

    logger.info("Dosha analysis generated", {
      kaalSarpSeverity: report.kaalSarp.severity,
      kaalSarpType: report.kaalSarp.type,
      manglikSeverity: report.manglik.severity,
      overallDosha: report.overallDosha,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Dosha analysis error", error);
    return NextResponse.json({ error: "Failed to run dosha analysis" }, { status: 500 });
  }
}
