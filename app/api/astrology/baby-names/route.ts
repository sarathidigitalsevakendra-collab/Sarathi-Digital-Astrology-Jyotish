import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateBabyNameReport } from "@/lib/astrology/calculations/BabyNames";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/baby-names
 * Body: { moonLongitude: number; gender: "Male"|"Female"|"Any"; parentDob?: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      moonLongitude: number;
      gender: "Male" | "Female" | "Any";
      parentDob?: string;
    };

    if (typeof body.moonLongitude !== "number" || !body.gender) {
      return NextResponse.json(
        { error: "Invalid request", required: ["moonLongitude (0-360)", "gender"] },
        { status: 400 },
      );
    }

    const parentDob = body.parentDob ? new Date(body.parentDob) : undefined;
    if (parentDob && isNaN(parentDob.getTime())) {
      return NextResponse.json({ error: "Invalid parentDob format" }, { status: 400 });
    }

    const report = generateBabyNameReport(body.moonLongitude, body.gender, parentDob);

    logger.info("Baby name report generated", { nakshatra: report.nakshatra, gender: body.gender });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Baby name report error", error);
    return NextResponse.json({ error: "Failed to generate baby name report" }, { status: 500 });
  }
}
