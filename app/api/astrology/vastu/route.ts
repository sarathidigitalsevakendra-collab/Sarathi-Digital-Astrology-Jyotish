import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import {
  generateVastuReport,
  type FacingDirection,
  type RoomType,
} from "@/lib/astrology/calculations/Vastu";
import { logger } from "@/lib/monitoring/logger";

const VALID_DIRECTIONS: FacingDirection[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const VALID_ROOMS: RoomType[] = [
  "MasterBedroom", "KidsBedroom", "GuestBedroom", "LivingRoom", "DiningRoom",
  "Kitchen", "Bathroom", "Toilet", "Pooja", "Study", "Office", "StoreRoom", "Garage",
];

/**
 * POST /api/astrology/vastu
 * Body: {
 *   facingDirection: FacingDirection;
 *   roomPlacements: Partial<Record<FacingDirection, RoomType[]>>;
 *   zodiacSign?: string;
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAuth();

    const body = await request.json() as {
      facingDirection?: string;
      roomPlacements?: Partial<Record<string, string[]>>;
      zodiacSign?: string;
    };

    if (!body.facingDirection || !VALID_DIRECTIONS.includes(body.facingDirection as FacingDirection)) {
      return NextResponse.json(
        { error: "Invalid facingDirection", valid: VALID_DIRECTIONS },
        { status: 400 },
      );
    }

    // Validate and sanitize room placements
    const sanitizedPlacements: Partial<Record<FacingDirection, RoomType[]>> = {};
    if (body.roomPlacements && typeof body.roomPlacements === "object" && !Array.isArray(body.roomPlacements)) {
      for (const dir of VALID_DIRECTIONS) {
        if (Object.prototype.hasOwnProperty.call(body.roomPlacements, dir)) {
          const rooms = body.roomPlacements[dir];
          if (Array.isArray(rooms)) {
            sanitizedPlacements[dir] = rooms.filter(
              r => VALID_ROOMS.includes(r as RoomType)
            ) as RoomType[];
          }
        }
      }
    }

    const report = generateVastuReport(
      body.facingDirection as FacingDirection,
      sanitizedPlacements,
      body.zodiacSign,
    );

    logger.info("Vastu report generated", {
      facing: body.facingDirection,
      overallScore: report.overallScore,
      zodiac: body.zodiacSign,
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    logger.error("Vastu report error", error);
    return NextResponse.json({ error: "Failed to generate Vastu report" }, { status: 500 });
  }
}
