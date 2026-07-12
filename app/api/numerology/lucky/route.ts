import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateLuckyNumberReport } from "@/lib/astrology/calculations/LuckyNumbers";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/numerology/lucky
 *
 * Generate a Lucky Number, Color, and Day report.
 *
 * Body: { name: string; dob: string; fullName?: string }
 * dob format: ISO string e.g. "1990-05-15"
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      name: string;
      dob: string;
      fullName?: string;
    };

    if (!body.name || !body.dob) {
      return NextResponse.json(
        { error: "Invalid request", required: ["name", "dob"] },
        { status: 400 },
      );
    }

    const dob = new Date(body.dob);
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth format. Use ISO string e.g. '1990-05-15'" },
        { status: 400 },
      );
    }

    const report = generateLuckyNumberReport(body.name, dob, body.fullName);

    logger.info("Lucky number report generated", {
      lifePathNumber: report.lifePathNumber,
      birthNumber: report.birthNumber,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("Lucky number report error", error);
    return NextResponse.json(
      { error: "Failed to generate lucky number report" },
      { status: 500 },
    );
  }
}
