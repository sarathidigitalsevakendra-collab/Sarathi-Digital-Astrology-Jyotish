/**
 * POST /api/v1/astrology/panchang
 *
 * Enhanced Panchang (Vedic calendar) endpoint using service orchestrator
 * - Provides daily astrological data: tithi, nakshatra, yoga, karana
 * - Uses Railway Python service (primary) with FreeAstrologyAPI fallback
 * - Includes source tracking, caching, and comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteHandler, ApiErrors } from "@/lib/api/route-handler";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";
import { createAstrologyRequest } from "@/lib/astrology/client";
import { logger } from "@/lib/monitoring/logger";

// Request validation schema
const PanchangRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  // Parse and validate request
  const body = await req.json();
  const validationResult = PanchangRequestSchema.safeParse(body);

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid request body", validationResult.error.errors);
  }

  const { date, latitude, longitude, timezone } = validationResult.data;

  // Parse date and set time to sunrise (6:00 AM) for panchang calculation
  const dateTime = new Date(date);
  dateTime.setHours(6, 0, 0, 0);

  // Create astrology request
  const astrologyRequest = createAstrologyRequest({
    dateTime,
    latitude,
    longitude,
    timezone,
  });

  logger.debug("Panchang request", {
    date,
    location: { latitude, longitude },
  });

  // Get panchang using orchestrator (auto-fallback)
  const { data, source } = await astrologyOrchestrator.getPanchang(astrologyRequest);

  logger.info("Panchang generated", {
    source,
    date,
    tithi: data.output?.tithi?.name,
    nakshatra: data.output?.nakshatra?.name,
  });

  // Return with source information
  return NextResponse.json(
    {
      success: true,
      data: {
        date,
        tithi: data.output?.tithi || null,
        nakshatra: data.output?.nakshatra || null,
        yoga: data.output?.yoga || null,
        karana: data.output?.karana || null,
        sunrise: data.output?.sunrise || null,
        sunset: data.output?.sunset || null,
        moonrise: data.output?.moonrise || null,
        moonset: data.output?.moonset || null,
      },
      meta: {
        source,
        timestamp: new Date().toISOString(),
        cached: false,
      },
    },
    {
      status: 200,
      headers: {
        "X-Service-Source": source,
        "Cache-Control": "public, max-age=21600, s-maxage=21600", // 6 hours - panchang changes slowly
      },
    },
  );
});

// Also support GET for easier integration
export const GET = withRouteHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const date = searchParams.get("date");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const timezone = searchParams.get("timezone");

  if (!date || !latitude || !longitude || !timezone) {
    throw ApiErrors.validation(
      "Missing required query parameters",
      { required: ["date", "latitude", "longitude", "timezone"] }
    );
  }

  // Parse numeric values
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);
  const parsedTimezone = parseFloat(timezone);

  // Check for NaN values from parseFloat
  if (isNaN(parsedLatitude) || isNaN(parsedLongitude) || isNaN(parsedTimezone)) {
    throw ApiErrors.validation(
      "Invalid query parameters",
      { message: "latitude, longitude, and timezone must be valid numbers" }
    );
  }

  // Validate
  const validationResult = PanchangRequestSchema.safeParse({
    date,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    timezone: parsedTimezone,
  });

  if (!validationResult.success) {
    throw ApiErrors.validation("Invalid query parameters", validationResult.error.errors);
  }

  const validatedData = validationResult.data;

  // Parse date and set time to sunrise (6:00 AM) for panchang calculation
  const dateTime = new Date(validatedData.date);
  dateTime.setHours(6, 0, 0, 0);

  // Create astrology request
  const astrologyRequest = createAstrologyRequest({
    dateTime,
    latitude: validatedData.latitude,
    longitude: validatedData.longitude,
    timezone: validatedData.timezone,
  });

  logger.debug("Panchang GET request", {
    date: validatedData.date,
    location: { 
      latitude: validatedData.latitude, 
      longitude: validatedData.longitude 
    },
  });

  // Get panchang using orchestrator
  const { data, source } = await astrologyOrchestrator.getPanchang(astrologyRequest);

  logger.info("Panchang generated (GET)", {
    source,
    date: validatedData.date,
    tithi: data.output?.tithi?.name,
    nakshatra: data.output?.nakshatra?.name,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        date: validatedData.date,
        tithi: data.output?.tithi || null,
        nakshatra: data.output?.nakshatra || null,
        yoga: data.output?.yoga || null,
        karana: data.output?.karana || null,
        sunrise: data.output?.sunrise || null,
        sunset: data.output?.sunset || null,
        moonrise: data.output?.moonrise || null,
        moonset: data.output?.moonset || null,
      },
      meta: {
        source,
        timestamp: new Date().toISOString(),
        cached: false,
      },
    },
    {
      status: 200,
      headers: {
        "X-Service-Source": source,
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    },
  );
});

export const runtime = "nodejs";
export const maxDuration = 30;
