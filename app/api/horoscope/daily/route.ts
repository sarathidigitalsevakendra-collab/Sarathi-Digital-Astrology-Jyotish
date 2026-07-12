import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAstrologyProvider, LocaleCode, SunSign } from "@digital-astrology/lib";

const SUN_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const satisfies readonly SunSign[];

const SUPPORTED_LOCALES = ["en", "hi", "ta"] as const satisfies readonly LocaleCode[];

const querySchema = z.object({
  sunSign: z.enum(SUN_SIGNS).optional(),
  system: z.enum(["vedic", "western"]).optional(),
  date: z.string().optional(),
  timezone: z.string().default("Asia/Kolkata"),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
});

const DEFAULT_SUN_SIGN: SunSign = "aries";

// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid horoscope query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { sunSign, system, date, timezone, locale } = parsed.data;
  const provider = await getAstrologyProvider();

  if (!sunSign && system) {
    const candidateLocales: LocaleCode[] = locale === "en" ? ["en"] : [locale, "en"];

    try {
      const summaries = await Promise.all(
        SUN_SIGNS.map(async (sign) => {
          let lastResult = await provider.getDailyHoroscope({
            sunSign: sign,
            date,
            timezone,
            locale,
            system,
          });

          if (candidateLocales.length > 1) {
            for (const candidate of candidateLocales) {
              const result = await provider.getDailyHoroscope({
                sunSign: sign,
                date,
                timezone,
                locale: candidate,
                system,
              });

              lastResult = result;

              if (result.metadata.provider !== "open_source_engine") {
                break;
              }
            }
          }

          return [toTitleCase(sign), lastResult.summary] as const;
        }),
      );

      const response = Object.fromEntries(
        summaries.map(([sign, summary]) => [
          sign,
          {
            summary: summary.guidance,
            mood: summary.mood ?? "Balanced",
            luckyNumber: summary.luckyNumber ?? "--",
            luckyColor: summary.luckyColor ?? "--",
          },
        ]),
      );

      return NextResponse.json(response);
    } catch (error: unknown) {
      // Log detailed error information to server console
      console.error("[api/horoscope/daily] batch provider failure", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        params: { system, locale, timezone, date },
      });

      // Extract detailed error information
      const errorDetails: Record<string, unknown> = {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
      };

      // Check if it's a fetch error with response
      if (error && typeof error === "object" && "cause" in error) {
        errorDetails.cause = error.cause;
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Upstream astrology API error",
          details: errorDetails,
        },
        { status: 502 },
      );
    }
  }

  const resolvedSunSign = sunSign ?? DEFAULT_SUN_SIGN;

  if (!sunSign && !system) {
    console.warn("[api/horoscope/daily] No sunSign provided; serving default response.", {
      resolvedSunSign,
    });
  }

  try {
    const result = await provider.getDailyHoroscope({
      sunSign: resolvedSunSign,
      date,
      timezone,
      locale,
      system,
    });

    return NextResponse.json({
      source: result.source,
      metadata: result.metadata,
      horoscope: result.summary,
    });
  } catch (error: unknown) {
    // Log detailed error information to server console
    console.error("[api/horoscope/daily] provider failure", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params: { sunSign: resolvedSunSign, system, locale, timezone, date },
    });

    // Extract detailed error information
    const errorDetails: Record<string, unknown> = {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    };

    // Check if it's a fetch error with response
    if (error && typeof error === "object" && "cause" in error) {
      errorDetails.cause = error.cause;
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Upstream astrology API error",
        details: errorDetails,
      },
      { status: 502 },
    );
  }
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
