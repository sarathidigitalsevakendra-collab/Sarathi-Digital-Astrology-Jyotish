/**
 * POST /api/v1/astrology/divisional-charts
 *
 * Enhanced Divisional Charts (Varga) endpoint using service orchestrator
 * - Provides D1-D60 Vedic divisional charts for detailed life area analysis
 * - Uses Railway Python service (primary) with FreeAstrologyAPI fallback
 * - Includes Redis-based caching, source tracking, and comprehensive error handling
 *
 * @openapi
 * /api/v1/astrology/divisional-charts:
 *   post:
 *     summary: Get Vedic divisional chart
 *     description: Calculate divisional charts (D1-D60) for detailed analysis of specific life areas
 *     tags:
 *       - Astrology
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateTime
 *               - latitude
 *               - longitude
 *               - timezone
 *               - chartType
 *             properties:
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Birth date and time in ISO 8601 format
 *                 example: "1990-01-15T10:30:00Z"
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Birth location latitude
 *                 example: 28.6139
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Birth location longitude
 *                 example: 77.209
 *               timezone:
 *                 type: number
 *                 minimum: -12
 *                 maximum: 14
 *                 description: Timezone offset from UTC
 *                 example: 5.5
 *               chartType:
 *                 type: string
 *                 enum: [D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60]
 *                 description: Divisional chart type
 *                 example: "D9"
 *     responses:
 *       200:
 *         description: Divisional chart calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     chartType:
 *                       type: string
 *                       example: "D9"
 *                     planets:
 *                       type: array
 *                       items:
 *                         type: object
 *                     ascendant:
 *                       type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     source:
 *                       type: string
 *                       example: "python"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     cached:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteHandler, ApiErrors } from "@/lib/api/route-handler";
import {
  getDivisionalChart,
  validateChartType,
  type DivisionalChartRequest,
} from "@/lib/orchestrators/divisional-charts.orchestrator";
import { logger } from "@/lib/monitoring/logger";

// Valid divisional chart types (D1-D60)
const VALID_CHART_TYPES = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
] as const;

// Request validation schema
const DivisionalChartRequestSchema = z.object({
  dateTime: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
  chartType: z.enum(VALID_CHART_TYPES),
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  // Parse and validate request
  const body = await req.json();
  const validationResult = DivisionalChartRequestSchema.safeParse(body);

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid request body", validationResult.error.errors);
  }

  const { dateTime, latitude, longitude, timezone, chartType } = validationResult.data;

  // Additional validation for chart type
  if (!validateChartType(chartType)) {
    throw ApiErrors.validation(
      "Invalid chart type",
      {
        validTypes: VALID_CHART_TYPES,
        received: chartType,
      }
    );
  }

  // Create request object
  const request: DivisionalChartRequest = {
    dateTime: new Date(dateTime),
    latitude,
    longitude,
    timezone,
    chartType,
  };

  logger.debug("Divisional chart request", {
    chartType,
    date: dateTime,
    location: { latitude, longitude },
  });

  // Get divisional chart using orchestrator with caching
  const { data, source, cached } = await getDivisionalChart(request);

  logger.info("Divisional chart generated", {
    chartType,
    source,
    cached,
    date: dateTime,
    planets: data.output?.length || 0,
  });

  // Return with source information
  return NextResponse.json(
    {
      success: true,
      data: {
        chartType,
        planets: data.output || [],
        ascendant: data.output?.[0]?.fullDegree || null,
      },
      meta: {
        source,
        timestamp: new Date().toISOString(),
        cached,
      },
    },
    {
      status: 200,
      headers: {
        "X-Service-Source": source,
        "X-Cached": cached ? "true" : "false",
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24 hours
      },
    },
  );
});

// GET endpoint for fetching multiple charts at once
export const GET = withRouteHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const dateTime = searchParams.get("dateTime");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const timezone = searchParams.get("timezone");
  const chartType = searchParams.get("chartType");

  // Validate required parameters
  if (!dateTime || !latitude || !longitude || !timezone || !chartType) {
    throw ApiErrors.validation(
      "Missing required query parameters",
      {
        required: ["dateTime", "latitude", "longitude", "timezone", "chartType"],
      }
    );
  }

  // Parse numeric values with NaN detection
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);
  const parsedTimezone = parseFloat(timezone);

  if (isNaN(parsedLatitude) || isNaN(parsedLongitude) || isNaN(parsedTimezone)) {
    throw ApiErrors.validation(
      "Invalid query parameters",
      { message: "latitude, longitude, and timezone must be valid numbers" }
    );
  }

  // Validate
  const validationResult = DivisionalChartRequestSchema.safeParse({
    dateTime,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    timezone: parsedTimezone,
    chartType,
  });

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid query parameters", validationResult.error.errors);
  }

  const validatedData = validationResult.data;

  // Create request object
  const request: DivisionalChartRequest = {
    dateTime: new Date(validatedData.dateTime),
    latitude: validatedData.latitude,
    longitude: validatedData.longitude,
    timezone: validatedData.timezone,
    chartType: validatedData.chartType,
  };

  logger.debug("Divisional chart GET request", {
    chartType: validatedData.chartType,
    date: validatedData.dateTime,
    location: {
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
    },
  });

  // Get divisional chart using orchestrator
  const { data, source, cached } = await getDivisionalChart(request);

  logger.info("Divisional chart generated (GET)", {
    chartType: validatedData.chartType,
    source,
    cached,
    date: validatedData.dateTime,
    planets: data.output?.length || 0,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        chartType: validatedData.chartType,
        planets: data.output || [],
        ascendant: data.output?.[0]?.fullDegree || null,
      },
      meta: {
        source,
        timestamp: new Date().toISOString(),
        cached,
      },
    },
    {
      status: 200,
      headers: {
        "X-Service-Source": source,
        "X-Cached": cached ? "true" : "false",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
});

export const runtime = "nodejs";
export const maxDuration = 30;
