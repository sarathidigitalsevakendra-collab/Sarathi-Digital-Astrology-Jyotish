/**
 * POST /api/v1/astrology/birth-chart
 *
 * Enhanced birth chart endpoint using service orchestrator
 * - Uses Railway Python service (primary)
 * - Falls back to FreeAstrologyAPI if needed
 * - Includes source tracking and deprecation headers
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteHandler, ApiErrors } from "@/lib/api/route-handler";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";
import { createAstrologyRequest } from "@/lib/astrology/client";
import { logger } from "@/lib/monitoring/logger";

// Request validation schema
const BirthChartRequestSchema = z.object({
  dateTime: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
  ayanamsha: z.enum(["lahiri", "raman", "krishnamurti", "thirukanitham"]).optional(),
  observation_point: z.enum(["topocentric", "geocentric"]).optional(),
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  // Parse and validate request
  const body = await req.json();
  const validationResult = BirthChartRequestSchema.safeParse(body);

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid request body", validationResult.error.errors);
  }

  const { dateTime, latitude, longitude, timezone, ayanamsha, observation_point } =
    validationResult.data;

  // Create astrology request
  const astrologyRequest = createAstrologyRequest(
    {
      dateTime: new Date(dateTime),
      latitude,
      longitude,
      timezone,
    },
    {
      ayanamsha,
      observation_point,
    },
  );

  logger.debug("Birth chart request", {
    date: dateTime,
    location: { latitude, longitude },
  });

  // Get birth chart using orchestrator (auto-fallback)
  const { data, source } = await astrologyOrchestrator.getBirthChart(astrologyRequest);

  logger.info("Birth chart generated", {
    source,
    planets: data.planets?.length || 0,
  });

  // Return with source information
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        source,
        timestamp: new Date().toISOString(),
        cached: false, // Will be enhanced with caching layer
      },
    },
    {
      status: 200,
      headers: {
        "X-Service-Source": source,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24 hours
      },
    },
  );
});

export const runtime = "nodejs";
export const maxDuration = 30;
