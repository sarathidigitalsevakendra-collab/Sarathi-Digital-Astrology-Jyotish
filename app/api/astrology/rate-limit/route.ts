import { NextResponse } from "next/server";
import { cachedAstrologyAPI } from "@/lib/astrology/cached-client";

/**
 * GET /api/astrology/rate-limit
 *
 * Get current rate limit information for FreeAstrologyAPI
 *
 * Returns:
 * {
 *   "daily_limit": 50,
 *   "used_today": 12,
 *   "remaining_today": 38,
 *   "reset_at": "2025-12-04T00:00:00.000Z",
 *   "last_request_at": "2025-12-03T15:30:00.000Z"
 * }
 */
export function GET(): NextResponse {
  try {
    const rateLimitInfo = cachedAstrologyAPI.getRateLimitInfo();

    return NextResponse.json(rateLimitInfo, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to fetch rate limit info",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
