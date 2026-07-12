import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { calculateVimsottariDasha, getApproximateMoonLongitude } from "@/lib/astrology/calculations/DashaCalculator";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/dasha-reading
 * Body: { birthDate: string; moonLongitude?: number }
 *
 * If moonLongitude is not supplied, it is approximated from birthDate.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();
    const body = await request.json() as { birthDate?: string; moonLongitude?: number };

    if (!body.birthDate) {
      return NextResponse.json({ error: "birthDate is required (ISO format)" }, { status: 400 });
    }

    const birthDate = new Date(body.birthDate);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: "Invalid birthDate format" }, { status: 400 });
    }

    const moonLon = body.moonLongitude ?? getApproximateMoonLongitude(birthDate);
    const report = calculateVimsottariDasha(moonLon, birthDate);

    logger.info("Dasha reading generated", {
      nakshatra: report.birthNakshatra,
      currentMahadasha: report.currentMahadasha,
      currentAntardasha: report.currentAntardasha,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Dasha reading error", error);
    return NextResponse.json({ error: "Failed to calculate dasha reading" }, { status: 500 });
  }
}
