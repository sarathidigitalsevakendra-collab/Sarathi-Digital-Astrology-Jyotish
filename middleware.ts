import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Runtime Middleware
 *
 * IMPORTANT: This middleware runs in Vercel Edge Runtime, which:
 * - Does NOT support Node.js APIs (__dirname, fs, path, etc.)
 * - Only supports Web Standard APIs (fetch, Request, Response, etc.)
 * - Cannot import @sentry/nextjs or any Node.js-specific packages
 */

import { updateSession } from './lib/supabase/middleware';
 
 export function middleware(_request: NextRequest) {
   try {
     return updateSession(_request);
  } catch (error) {
    // Log error for Vercel monitoring (console.error is Edge-compatible)
    console.error("[Middleware] Error:", error);

    // Return 500 response instead of crashing
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  // Note: Middleware automatically runs in Edge Runtime, no need to specify
};
