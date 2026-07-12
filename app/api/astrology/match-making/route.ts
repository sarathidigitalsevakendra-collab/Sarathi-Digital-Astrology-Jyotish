import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { calculateMatchmaking } from "@/lib/astrology/calculations/Matchmaking";
import { NAKSHATRA_NAMES } from "@/lib/astrology/calculations/NakshatraConfig";
import { getSignName, getRashiFromLongitude } from "@/lib/astrology/calculations/VedicMath";

/**
 * POST /api/astrology/match-making
 *
 * Calculate Ashtakoot compatibility from Moon longitudes
 * Uses internal calculations (no external API dependency).
 *
 * Body:
 * {
 *   "brideMoonLongitude": 280.5,
 *   "groomMoonLongitude": 115.3,
 *   "brideName": "Priya",
 *   "groomName": "Rahul"
 * }
 */

interface MatchingRequestBody {
  brideMoonLongitude: number;
  groomMoonLongitude: number;
  brideName?: string;
  groomName?: string;
}

function isMatchingRequestBody(body: unknown): body is MatchingRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.brideMoonLongitude === "number" &&
    typeof candidate.groomMoonLongitude === "number" &&
    candidate.brideMoonLongitude >= 0 &&
    candidate.brideMoonLongitude < 360 &&
    candidate.groomMoonLongitude >= 0 &&
    candidate.groomMoonLongitude < 360
  );
}

// Helper: get nakshatra index from longitude (0-26)
function getNakshatraIndex(longitude: number): number {
  return Math.floor((longitude % 360) / (360 / 27));
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Auth check
    await requireAuth();

    const body: unknown = await request.json();

    if (!isMatchingRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["brideMoonLongitude", "groomMoonLongitude"],
          optional: ["brideName", "groomName"],
        },
        { status: 400 },
      );
    }

    const { brideMoonLongitude, groomMoonLongitude, brideName, groomName } = body;

    // Use internal calculation engine
    // marsLon and ascLon default to 0 since we only have moon longitudes
    // (Mangal Dosha assessment will be basic — full birth details give better results)
    const result = calculateMatchmaking(
      { moonLon: groomMoonLongitude, marsLon: 0, ascLon: 0 },
      { moonLon: brideMoonLongitude, marsLon: 0, ascLon: 0 },
    );

    // Derive nakshatra/rashi for each person
    const brideNakIdx = getNakshatraIndex(brideMoonLongitude);
    const groomNakIdx = getNakshatraIndex(groomMoonLongitude);
    const brideRashi = getRashiFromLongitude(brideMoonLongitude);
    const groomRashi = getRashiFromLongitude(groomMoonLongitude);

    // Map verdict to frontend-friendly labels
    const verdictMap: Record<string, string> = {
      Excellent: "Excellent Match",
      Good: "Good Match",
      Average: "Average Match",
      Bad: "Below Average",
      "Not Recommended": "Not Recommended",
    };

    const recommendationMap: Record<string, string> = {
      Excellent: "Highly compatible! An auspicious match with strong harmony.",
      Good: "A good match with favorable compatibility indicators.",
      Average: "Average compatibility. Consider consulting an astrologer for remedies.",
      Bad: "Compatibility is low. Remedial measures are advised.",
      "Not Recommended": "Significant compatibility challenges exist. Seek expert guidance.",
    };

    // Transform to match the frontend contract (useMatching.ts expects this shape)
    return NextResponse.json({
      bride: {
        name: brideName || "Bride",
        nakshatra: NAKSHATRA_NAMES[brideNakIdx] || "Unknown",
        nakshatraNumber: brideNakIdx + 1,
        rashi: getSignName(brideRashi),
        rashiNumber: brideRashi + 1,
        moonLongitude: brideMoonLongitude,
      },
      groom: {
        name: groomName || "Groom",
        nakshatra: NAKSHATRA_NAMES[groomNakIdx] || "Unknown",
        nakshatraNumber: groomNakIdx + 1,
        rashi: getSignName(groomRashi),
        rashiNumber: groomRashi + 1,
        moonLongitude: groomMoonLongitude,
      },
      koots: result.kutas.map((k) => ({
        name: k.name,
        score: k.score,
        maxScore: k.total,
        description: k.description,
      })),
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      percentage: Math.round((result.totalScore / result.maxScore) * 100),
      verdict: verdictMap[result.verdict] || result.verdict,
      recommendation: recommendationMap[result.verdict] || "Consult an astrologer for detailed analysis.",
      source: "internal_calculator",
    });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("Match-making API error", error);

    return NextResponse.json(
      {
        error: "Failed to calculate match",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
