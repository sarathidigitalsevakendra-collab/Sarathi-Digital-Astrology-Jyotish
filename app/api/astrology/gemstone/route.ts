import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateGemstoneReport } from "@/lib/astrology/calculations/GemstoneReport";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/gemstone
 *
 * Generate a personalised Gemstone Recommendation Report from a birth chart.
 *
 * Body: { planets: Planet[], ascendant: number }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      planets: { name: string; fullDegree: number; isRetro?: boolean }[];
      ascendant: number;
    };

    if (
      !Array.isArray(body.planets) ||
      body.planets.length === 0 ||
      typeof body.ascendant !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid request body", required: ["planets", "ascendant"] },
        { status: 400 },
      );
    }

    const report = generateGemstoneReport(body.planets, body.ascendant);

    logger.info("Gemstone report generated", {
      ascendantSign: report.ascendantSign,
      primaryGemstone: report.primaryGemstone?.gemstone,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("Gemstone report error", error);
    return NextResponse.json(
      { error: "Failed to generate gemstone report" },
      { status: 500 },
    );
  }
}
