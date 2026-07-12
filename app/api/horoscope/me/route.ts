import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/monitoring/logger";
import { getAstrologyProvider, SunSign } from "@digital-astrology/lib";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * GET /api/horoscope/me
 *
 * Get personalized daily horoscope for the authenticated user
 * Uses user's sun sign from their profile
 *
 * Query params:
 * - date (optional): Date for horoscope (defaults to today)
 * - locale (optional): Language code (en, hi, ta)
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Horoscope API: Unauthorized request");
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    // Get user from database with astrological data
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
      },
      select: {
        id: true,
        name: true,
        sunSign: true,
        moonSign: true,
        risingSign: true,
        preferredSystem: true,
        onboardingCompleted: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found. Please complete onboarding." },
        { status: 404 },
      );
    }

    if (!dbUser.onboardingCompleted || !dbUser.sunSign) {
      return NextResponse.json(
        { error: "Please complete your astrological profile first." },
        { status: 400 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const locale = (searchParams.get("locale") || "en") as "en" | "hi" | "ta";

    // Convert sun sign to lowercase for API
    const sunSign = dbUser.sunSign.toLowerCase() as SunSign;
    const system = dbUser.preferredSystem.toLowerCase() as "vedic" | "western";

    // Get astrology provider
    const provider = await getAstrologyProvider();

    // Fetch daily horoscope
    const result = await provider.getDailyHoroscope({
      sunSign,
      date,
      timezone: "Asia/Kolkata", // Could be user-specific in future
      locale,
      system,
    });

    logger.info("Fetched personalized horoscope", {
      userId: dbUser.id,
      sunSign,
      system,
    });

    return NextResponse.json(
      {
        user: {
          name: dbUser.name,
          sunSign: dbUser.sunSign,
          moonSign: dbUser.moonSign,
          risingSign: dbUser.risingSign,
          system: dbUser.preferredSystem,
        },
        horoscope: result.summary,
        source: result.source,
        metadata: result.metadata,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    logger.error("Horoscope me API error", error);

    return NextResponse.json(
      {
        error: "Failed to fetch your horoscope",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
