import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// Allowlist of safe redirect paths
const SAFE_REDIRECTS = [
  "/",
  "/dashboard",
  "/profile",
  "/settings",
  "/consultations",
  "/shop",
  "/my-kundlis",
  "/orders",
  "/favorites",
  "/onboarding", // Add onboarding to safe redirects
];

/**
 * Validates and sanitizes redirect path to prevent open redirect attacks
 */
function getSafeRedirect(path: string | null): string {
  if (!path || path === "") return "/";

  // Remove any protocol and domain to get just the path
  const normalizedPath = path.replace(/^https?:\/\/[^\/]+/, "");

  // Ensure path starts with /
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;

  // Check if path matches or is a subpath of allowed redirects
  const isSafe = SAFE_REDIRECTS.some(
    (safePath) => cleanPath === safePath || cleanPath.startsWith(`${safePath}/`),
  );

  return isSafe ? cleanPath : "/";
}

// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    console.error("OAuth callback: Missing code parameter");
    return NextResponse.redirect(`${origin}/auth/error?message=missing_code`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(
        "OAuth callback error:",
        error instanceof Error ? error.message : String(error),
      );
      return NextResponse.redirect(`${origin}/auth/error?message=auth_failed`);
    }

    if (data.session && data.user) {
      // Default redirect path
      let redirectPath = getSafeRedirect(next);

      try {
        // Look up user in our database
        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: data.user.email || undefined }, { phone: data.user.phone || undefined }],
          },
          select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            onboardingCompleted: true,
          },
        });

        // If user doesn't exist in Prisma, create minimal user record
        if (!dbUser) {
          console.error("Creating new user in database...", {
            email: data.user.email,
            phone: data.user.phone,
          });

          dbUser = await prisma.user.create({
            data: {
              email: data.user.email || null,
              phone: data.user.phone || null,
              name:
                data.user.user_metadata?.name ||
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0] ||
                "User",
              image: data.user.user_metadata?.avatar_url || null,
              onboardingCompleted: false,
              // Leave birth details null - will be filled during onboarding
            },
            select: {
              id: true,
              email: true,
              phone: true,
              name: true,
              onboardingCompleted: true,
            },
          });

          console.error("New user created:", {
            id: dbUser.id,
            email: dbUser.email,
            onboardingCompleted: dbUser.onboardingCompleted,
          });
        }

        // Redirect based on onboarding status
        // UNLESS they're already trying to go to onboarding or dashboard
        if (!dbUser.onboardingCompleted && redirectPath !== "/onboarding") {
          console.error("User needs onboarding, redirecting...", {
            email: dbUser.email,
            onboardingCompleted: dbUser.onboardingCompleted,
          });
          redirectPath = "/onboarding";
        } else if (
          dbUser.onboardingCompleted &&
          (redirectPath === "/" || redirectPath === "/onboarding")
        ) {
          // If user completed onboarding but trying to access root or onboarding, send to dashboard
          redirectPath = "/dashboard";
        }

        console.error("Auth callback complete:", {
          userId: dbUser.id,
          email: dbUser.email,
          onboardingCompleted: dbUser.onboardingCompleted,
          redirectPath,
        });
      } catch (dbError) {
        // If database operations fail, log error and redirect to onboarding as safe default
        console.error("Failed to check/create user in database:", dbError);
        // Still redirect to onboarding as a safe default for new users
        if (redirectPath !== "/onboarding") {
          redirectPath = "/onboarding";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  } catch (err) {
    console.error("OAuth callback exception:", err);
    return NextResponse.redirect(`${origin}/auth/error?message=server_error`);
  }

  // Fallback error redirect
  return NextResponse.redirect(`${origin}/auth/error?message=unknown_error`);
}
