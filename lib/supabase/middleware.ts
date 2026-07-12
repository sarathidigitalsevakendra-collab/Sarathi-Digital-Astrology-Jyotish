/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Validate environment variables before attempting to create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Middleware] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: process.env.NODE_ENV,
      url: request.url,
    });

    // Return early without crashing - allows app to load without auth
    // This is better than crashing the entire application
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: Don't just check if user exists to refresh the session
    // This will cause issues with server-side rendering
    // Instead, let the session refresh happen naturally
    await supabase.auth.getUser();
  } catch (error) {
    // Log error but don't crash - middleware should be resilient
    console.error("[Middleware] Supabase session update failed:", error);
    // Continue without auth refresh - better than crashing entire app
  }

  return supabaseResponse;
}

/**
 * Note: requireAuth and optionalAuth have been moved to lib/api/auth.ts
 * for use in API routes (Node.js runtime only).
 *
 * This middleware file should only contain Edge Runtime-compatible code.
 */
