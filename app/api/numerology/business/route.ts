import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { analyzeBusinessName } from "@/lib/numerology/NumerologyCalculator";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/numerology/business
 * Body: { proposedNames: string[]; ownerDob: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      proposedNames: string[];
      ownerDob: string;
    };

    if (!Array.isArray(body.proposedNames) || body.proposedNames.length === 0 || !body.ownerDob) {
      return NextResponse.json(
        { error: "Invalid request", required: ["proposedNames (array)", "ownerDob"] },
        { status: 400 },
      );
    }

    const ownerDob = new Date(body.ownerDob);
    if (isNaN(ownerDob.getTime())) {
      return NextResponse.json(
        { error: "Invalid ownerDob. Use ISO format e.g. '1990-05-15'" },
        { status: 400 },
      );
    }

    const filteredNames = body.proposedNames.slice(0, 5).filter(n => typeof n === "string" && n.trim().length > 0);
    const report = analyzeBusinessName(filteredNames, ownerDob);

    logger.info("Business name report generated", { topPick: report.topPickName, ownerLP: report.ownerLifePathNumber });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Business name report error", error);
    return NextResponse.json({ error: "Failed to analyse business names" }, { status: 500 });
  }
}
