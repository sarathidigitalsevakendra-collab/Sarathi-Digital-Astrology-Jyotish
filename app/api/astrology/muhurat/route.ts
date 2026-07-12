import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { calculateMuhurat, type MuhuratType } from "@/lib/astrology/calculations/Muhurat";
import { logger } from "@/lib/monitoring/logger";

const VALID_TYPES = ["Marriage", "GrihaPravesh", "BusinessOpening", "NamingCeremony", "Travel"];

/**
 * POST /api/astrology/muhurat
 * Body: { muhuratType: MuhuratType; fromDate: string; toDate: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      muhuratType?: string;
      fromDate?: string;
      toDate?: string;
    };

    if (!body.muhuratType || !VALID_TYPES.includes(body.muhuratType)) {
      return NextResponse.json(
        { error: "Invalid muhuratType", valid: VALID_TYPES },
        { status: 400 },
      );
    }
    if (!body.fromDate || !body.toDate) {
      return NextResponse.json(
        { error: "fromDate and toDate are required (ISO format)" },
        { status: 400 },
      );
    }

    const fromDate = new Date(body.fromDate);
    const toDate   = new Date(body.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    if (fromDate > toDate) {
      return NextResponse.json({ error: "fromDate must be before toDate" }, { status: 400 });
    }

    const report = calculateMuhurat(body.muhuratType as MuhuratType, fromDate, toDate);

    logger.info("Muhurat report generated", {
      type: body.muhuratType,
      days: report.totalDaysScanned,
      topSlots: report.topSlots.length,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Muhurat calculation error", error);
    return NextResponse.json({ error: "Failed to calculate muhurat" }, { status: 500 });
  }
}
