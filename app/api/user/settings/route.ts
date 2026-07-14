import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { AstrologySystem } from "@prisma/client";

// Force dynamic rendering to avoid DATABASE_URL requirement at build time
export const dynamic = "force-dynamic";

/**
 * GET /api/user/settings
 * Get user settings (name, locale, preferredSystem, plan, etc.)
 */
export async function GET(_request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
      },
    });

    if (!dbUser) {
      return NextResponse.json({ plan: "FREE" }, { status: 200 }); // Default
    }

    return NextResponse.json({ 
      plan: dbUser.plan,
      name: dbUser.name,
      locale: dbUser.locale,
      preferredSystem: dbUser.preferredSystem
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/settings
 * Update user settings (name, locale, preferredSystem)
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    // Parse request body
    const body = (await request.json()) as Record<string, unknown>;
    const { name, locale, preferredSystem } = body;

    // Validate inputs
    if (name && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name format" }, { status: 400 });
    }

    if (locale && !["en", "hi"].includes(String(locale))) {
      return NextResponse.json({ error: 'Invalid locale. Must be "en" or "hi"' }, { status: 400 });
    }

    if (preferredSystem && !["VEDIC", "WESTERN"].includes(String(preferredSystem))) {
      return NextResponse.json(
        { error: 'Invalid preferredSystem. Must be "VEDIC" or "WESTERN"' },
        { status: 400 },
      );
    }

    // Find user in database
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        ...(name && typeof name === "string" ? { name } : {}),
        ...(locale && typeof locale === "string" ? { locale } : {}),
        ...(preferredSystem && typeof preferredSystem === "string"
          ? { preferredSystem: preferredSystem as AstrologySystem }
          : {}),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        preferredSystem: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Settings update error:", error);

    return NextResponse.json(
      {
        error: "Failed to update settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
