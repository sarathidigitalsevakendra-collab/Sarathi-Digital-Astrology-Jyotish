import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateSadeSatiReport } from "@/lib/astrology/calculations/SadeSati";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/sade-sati
 * Body: { moonSignNum: number (1-12) }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();
    const body = await request.json() as { moonSignNum?: number };

    if (!body.moonSignNum || body.moonSignNum < 1 || body.moonSignNum > 12) {
      return NextResponse.json(
        { error: "moonSignNum must be 1–12 (Aries=1 … Pisces=12)" },
        { status: 400 },
      );
    }

    const currentYear = new Date().getFullYear();
    const report = generateSadeSatiReport(body.moonSignNum, currentYear);

    logger.info("Sade Sati report generated", {
      moonSign: report.natalMoonSign,
      phase: report.sadeSatiPhase,
      intensity: report.intensity,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Sade Sati error", error);
    return NextResponse.json({ error: "Failed to generate Sade Sati report" }, { status: 500 });
  }
}
