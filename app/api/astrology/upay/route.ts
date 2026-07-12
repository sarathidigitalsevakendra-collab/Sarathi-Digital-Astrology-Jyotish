import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { generateUpayReport, type UpayInput } from "@/lib/astrology/calculations/UpayReport";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/upay
 * Body: UpayInput
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();
    const body = await request.json() as Partial<UpayInput>;

    if (!body.currentMahadashaPlanet) {
      return NextResponse.json({ error: "currentMahadashaPlanet is required" }, { status: 400 });
    }
    if (!body.moonSignNum || body.moonSignNum < 1 || body.moonSignNum > 12) {
      return NextResponse.json({ error: "moonSignNum must be 1–12" }, { status: 400 });
    }
    if (!body.lagnaSignNum || body.lagnaSignNum < 1 || body.lagnaSignNum > 12) {
      return NextResponse.json({ error: "lagnaSignNum must be 1–12" }, { status: 400 });
    }

    const input: UpayInput = {
      currentMahadashaPlanet: body.currentMahadashaPlanet,
      currentAntardashaPlanet: body.currentAntardashaPlanet,
      moonSignNum: body.moonSignNum,
      lagnaSignNum: body.lagnaSignNum,
      hasSadeSati: body.hasSadeSati ?? false,
      hasKaalSarp: body.hasKaalSarp ?? false,
      hasManglik: body.hasManglik ?? false,
    };

    const report = generateUpayReport(input);

    logger.info("Upay report generated", {
      mahadasha: input.currentMahadashaPlanet,
      totalRemedies: report.allRemedies.length,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Upay report error", error);
    return NextResponse.json({ error: "Failed to generate upay report" }, { status: 500 });
  }
}
