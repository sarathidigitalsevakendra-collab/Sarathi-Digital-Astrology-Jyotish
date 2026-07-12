import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getAstrologyProvider,
  getInterpretationProvider,
  LocaleCode,
  SunSign,
} from "@digital-astrology/lib";

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

const TONES = ["concise", "detailed", "uplifting", "cautionary"] as const;
const FOCUS_AREAS = ["career", "relationships", "finance", "health", "spirituality"] as const;

const querySchema = z.object({
  sunSign: z.enum(SUN_SIGNS),
  date: z.string().optional(),
  timezone: z.string().default("Asia/Kolkata"),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
  tone: z.enum(TONES).optional(),
  focus: z.enum(FOCUS_AREAS).optional(),
});

// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid horoscope interpretation parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { sunSign, date, timezone, locale, tone, focus } = parsed.data;

  try {
    const [astrologyProvider, interpretationProvider] = await Promise.all([
      getAstrologyProvider(),
      getInterpretationProvider(),
    ]);

    const deterministic = await astrologyProvider.getDailyHoroscope({
      sunSign,
      date,
      timezone,
      locale,
    });

    const interpretation = await interpretationProvider.generateDailyNarrative({
      horoscope: deterministic,
      tone,
      focus,
      locale,
    });

    return NextResponse.json({
      source: deterministic.source,
      metadata: deterministic.metadata,
      horoscope: deterministic.summary,
      interpretation,
    });
  } catch (error: unknown) {
    console.error("[api/horoscope/daily/interpretation] failure", error);
    return NextResponse.json(
      {
        error: "interpretation_failure",
        message: "Unable to generate horoscope interpretation at this time.",
      },
      { status: 502 },
    );
  }
}
