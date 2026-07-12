import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { analyzeNameNumerology } from "@/lib/numerology/NumerologyCalculator";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/numerology/name
 *
 * Analyse a full name using classical Pythagorean numerology.
 *
 * Body: { fullName: string; dob?: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as { fullName: string; dob?: string };

    if (!body.fullName || typeof body.fullName !== "string" || body.fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid request", required: ["fullName (min 2 characters)"] },
        { status: 400 },
      );
    }

    const dob = body.dob ? new Date(body.dob) : undefined;
    if (dob && isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "Invalid dob format. Use ISO string e.g. '1990-05-15'" },
        { status: 400 },
      );
    }

    const report = analyzeNameNumerology(body.fullName.trim(), dob);

    logger.info("Name numerology report generated", {
      destinyNumber: report.destinyNumber,
      soulUrgeNumber: report.soulUrgeNumber,
      personalityNumber: report.personalityNumber,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("Name numerology report error", error);
    return NextResponse.json({ error: "Failed to analyse name" }, { status: 500 });
  }
}
