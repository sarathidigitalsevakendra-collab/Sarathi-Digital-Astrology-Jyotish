import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { updateSession } from './lib/supabase/middleware';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'hi'
});

export async function middleware(request: NextRequest) {
  try {
    // 1. Run next-intl to get localized response (handles redirects and rewrites)
    const response = intlMiddleware(request);

    // 2. Pass to Supabase to handle auth session refresh within that response
    return await updateSession(request, response);
  } catch (error) {
    console.error("[Middleware] Error:", error);
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
};
