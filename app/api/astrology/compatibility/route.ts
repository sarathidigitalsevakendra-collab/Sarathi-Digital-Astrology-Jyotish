import { NextResponse } from "next/server";
import { cachedAstrologyAPI, createAstrologyRequest } from "@/lib/astrology/cached-client";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/compatibility
 *
 * Get compatibility score between two people (Ashtakoot matching)
 *
 * Body:
 * {
 *   "person1": {
 *     "dateTime": "1990-01-15T10:30:00",
 *     "latitude": 28.6139,
 *     "longitude": 77.2090,
 *     "timezone": 5.5
 *   },
 *   "person2": {
 *     "dateTime": "1992-03-20T14:15:00",
 *     "latitude": 19.0760,
 *     "longitude": 72.8777,
 *     "timezone": 5.5
 *   }
 * }
 */

interface PersonData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface CompatibilityRequestBody {
  person1: PersonData;
  person2: PersonData;
}

function isPersonData(data: unknown): data is PersonData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number"
  );
}

function isCompatibilityRequestBody(body: unknown): body is CompatibilityRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return isPersonData(candidate.person1) && isPersonData(candidate.person2);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isCompatibilityRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["person1", "person2"],
          details: "Each person object must have: dateTime, latitude, longitude, timezone",
        },
        { status: 400 },
      );
    }

    const { person1, person2 } = body;

    // Create astrology requests
    const request1 = createAstrologyRequest({
      dateTime: new Date(person1.dateTime),
      latitude: person1.latitude,
      longitude: person1.longitude,
      timezone: person1.timezone,
    });

    const request2 = createAstrologyRequest({
      dateTime: new Date(person2.dateTime),
      latitude: person2.latitude,
      longitude: person2.longitude,
      timezone: person2.timezone,
    });

    // Get compatibility (will be cached for 24 hours)
    const result = await cachedAstrologyAPI.getCompatibility(request1, request2);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error("Compatibility API error", error);

    return NextResponse.json(
      {
        error: "Failed to fetch compatibility",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
