import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAstrologyProvider, LocaleCode } from "@digital-astrology/lib";

const SUPPORTED_LOCALES = ["en", "hi", "ta"] as const satisfies readonly LocaleCode[];

const querySchema = z.object({
  date: z.string().optional(),
  timezone: z.string().default("Asia/Kolkata"),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
});

// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid Panchang query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { date, timezone, locale } = parsed.data;

  try {
    const provider = await getAstrologyProvider();
    const result = await provider.getPanchang({
      date,
      timezone,
      locale,
    });

    return NextResponse.json({
      source: result.source,
      metadata: result.metadata,
      panchang: result.details,
    });
  } catch (error: unknown) {
    // Log detailed error information to server console
    console.error("[api/panchang/today] provider failure", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params: { date, timezone, locale },
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
