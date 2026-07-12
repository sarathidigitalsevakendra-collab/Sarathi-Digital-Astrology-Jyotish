/**
 * POST /api/v1/astrology/transits
 *
 * Enhanced Planetary Transits (Gochar) endpoint
 * - Hybrid implementation: External data fetching + Local aspect analysis
 * - Provides detailed aspect analysis, effects, and summary tone
 * - Caches results for 6 hours
 *
 * @openapi
 * /api/v1/astrology/transits:
 *   post:
 *     summary: Get planetary transits (Gochar)
 *     description: Analyze planetary transits relative to a birth chart
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
 *             properties:
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Birth date and time in ISO 8601 format
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               timezone:
 *                 type: number
 *               transitDate:
 *                 type: string
 *                 format: date-time
 *                 description: Target date for transits (defaults to now)
 *     responses:
 *       200:
 *         description: Transits calculated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteHandler, ApiErrors } from "@/lib/api/route-handler";
import { getTransits } from "@/lib/orchestrators/transits.orchestrator";
import { TransitRequest } from "@/lib/astrology/types";
import { logger } from "@/lib/monitoring/logger";

// Request validation schema
const TransitRequestSchema = z.object({
  dateTime: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
  transitDate: z.string().datetime().optional(),
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  // Parse and validate request
  const body = await req.json();
  const validationResult = TransitRequestSchema.safeParse(body);

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid request body", validationResult.error.errors);
  }

  const { dateTime, latitude, longitude, timezone, transitDate } = validationResult.data;

  // Create request object
  const request: TransitRequest = {
    dateTime,
    latitude,
    longitude,
    timezone,
    transitDate,
  };

  logger.debug("Transits request", {
    date: dateTime,
    transitDate: transitDate || "now",
    location: { latitude, longitude },
  });

  // Get transits using orchestrator
  const { data, source, cached } = await getTransits(request);

  logger.info("Transits generated", {
    source,
    cached,
    tone: data.summary.overallTone,
    aspects: data.summary.totalAspects
  });

  // Return with source information
  return NextResponse.json(
    {
      success: true,
      data,
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
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    },
  );
});

// GET endpoint implementation
export const GET = withRouteHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const dateTime = searchParams.get("dateTime");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const timezone = searchParams.get("timezone");
  const transitDate = searchParams.get("transitDate");

  if (!dateTime || !latitude || !longitude || !timezone) {
    throw ApiErrors.validation(
      "Missing required query parameters",
      { required: ["dateTime", "latitude", "longitude", "timezone"] }
    );
  }

  // Parse numeric values
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
  const validationResult = TransitRequestSchema.safeParse({
    dateTime,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    timezone: parsedTimezone,
    transitDate: transitDate || undefined,
  });

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid query parameters", validationResult.error.errors);
  }

  const validatedData = validationResult.data;

  // Create request object
  const request: TransitRequest = {
    dateTime: validatedData.dateTime,
    latitude: validatedData.latitude,
    longitude: validatedData.longitude,
    timezone: validatedData.timezone,
    transitDate: validatedData.transitDate,
  };

  const { data, source, cached } = await getTransits(request);

  return NextResponse.json(
    {
      success: true,
      data,
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
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    },
  );
});
