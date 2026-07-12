import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

const ASTRO_CORE_URL = process.env.ASTRO_CORE_URL || "https://jyotishya-astro-api.vercel.app";

/**
 * POST /api/astrology/birth-chart/svg
 *
 * Generate SVG chart visualization from the Astro Core API
 *
 * Body:
 * {
 *   "dateTime": "1990-01-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5,
 *   "chartStyle": "north_indian" | "south_indian",
 *   "theme": "light" | "dark",
 *   "size": "small" | "medium" | "large"
 * }
 */

interface ChartSvgRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chartStyle?: "north_indian" | "south_indian";
  theme?: "light" | "dark";
  size?: "small" | "medium" | "large";
}

function isChartSvgRequestBody(body: unknown): body is ChartSvgRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isChartSvgRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["dateTime", "latitude", "longitude", "timezone"],
          optional: ["chartStyle", "theme", "size"],
        },
        { status: 400 },
      );
    }

    const { dateTime, latitude, longitude, timezone, chartStyle, theme, size } = body;

    // Parse datetime
    const dt = new Date(dateTime);
    
    // Build request for Astro Core API
    const astroCoreRequest = {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      date: dt.getDate(),
      hours: dt.getHours(),
      minutes: dt.getMinutes(),
      seconds: dt.getSeconds(),
      latitude,
      longitude,
      timezone,
      observation_point: "topocentric",
      ayanamsha: "lahiri",
      chart_style: chartStyle || "north_indian",
      theme: theme || "dark",
      size: size || "medium",
    };

    // Call Astro Core API
    const response = await fetch(`${ASTRO_CORE_URL}/horoscope-chart-svg-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(astroCoreRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Astro Core SVG API error", { status: response.status, error: errorText });
      return NextResponse.json(
        { error: "Failed to generate chart SVG", details: errorText },
        { status: 502 },
      );
    }

    const result = await response.json();

    return NextResponse.json({
      svg: result.output,
      chartStyle: result.chart_style,
      theme: result.theme,
      size: result.size,
      source: "astro_core",
    });
  } catch (error: unknown) {
    logger.error("Chart SVG API error", error);

    return NextResponse.json(
      {
        error: "Failed to generate chart SVG",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
