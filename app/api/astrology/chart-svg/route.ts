import { NextResponse } from "next/server";
import { cachedAstrologyAPI, createAstrologyRequest } from "@/lib/astrology/cached-client";
import { logger } from "@/lib/monitoring/logger";
import type { DivisionalChartType } from "@/lib/astrology/types";

/**
 * POST /api/astrology/chart-svg
 *
 * Get birth chart as SVG code
 *
 * Body:
 * {
 *   "dateTime": "1990-01-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5,
 *   "chartType": "D1" // Optional: D1, D9, D10, etc. (default: D1)
 * }
 */

interface ChartSVGRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chartType?: string;
}

function isChartSVGRequestBody(body: unknown): body is ChartSVGRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number" &&
    (candidate.chartType === undefined || typeof candidate.chartType === "string")
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isChartSVGRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["dateTime", "latitude", "longitude", "timezone"],
        },
        { status: 400 },
      );
    }

    const { dateTime, latitude, longitude, timezone, chartType = "D1" } = body;

    // Create astrology request
    const astrologyRequest = createAstrologyRequest({
      dateTime: new Date(dateTime),
      latitude,
      longitude,
      timezone,
    });

    // Get SVG chart (will be cached for 24 hours)
    const result =
      chartType === "D1"
        ? await cachedAstrologyAPI.getChartSVG(astrologyRequest)
        : await cachedAstrologyAPI.getDivisionalChartSVG(
            astrologyRequest,
            chartType as DivisionalChartType,
          );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error("Chart SVG API error", error);

    return NextResponse.json(
      {
        error: "Failed to fetch chart SVG",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
