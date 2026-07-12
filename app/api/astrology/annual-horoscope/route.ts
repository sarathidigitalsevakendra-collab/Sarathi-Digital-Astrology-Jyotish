import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateAnnualHoroscope } from "@/lib/astrology/calculations/AnnualHoroscope";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/annual-horoscope
 * Body: { moonSignNum: number (1-12); year?: number }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();
    const body = await request.json() as { moonSignNum?: number; year?: number };

    if (!body.moonSignNum || body.moonSignNum < 1 || body.moonSignNum > 12) {
      return NextResponse.json({ error: "moonSignNum must be 1–12" }, { status: 400 });
    }

    const year = body.year ?? new Date().getFullYear();
    const report = generateAnnualHoroscope(body.moonSignNum, year);

    logger.info("Annual horoscope generated", { moonSign: report.moonSign, year, score: report.yearScore });
    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Annual horoscope error", error);
    return NextResponse.json({ error: "Failed to generate annual horoscope" }, { status: 500 });
  }
}
