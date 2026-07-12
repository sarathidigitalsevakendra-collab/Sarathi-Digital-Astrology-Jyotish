/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers configuration
 * Based on OWASP recommendations
 */
export function addSecurityHeaders(response: NextResponse, request: NextRequest) {
  const headers = response.headers;

  // Prevent clickjacking attacks
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection (legacy browsers)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy
  headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=(self)",
      "usb=()",
      "magnetometer=()",
    ].join(", "),
  );

  // Content Security Policy
  const csp = buildCSP(request);
  headers.set("Content-Security-Policy", csp);

  // HTTP Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

/**
 * Build Content Security Policy
 */
function buildCSP(_request: NextRequest): string {
  const isDevelopment = process.env.NODE_ENV === "development";

  const cspDirectives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-eval'", // Required for Next.js
      "'unsafe-inline'", // Required for Next.js in dev
      "https://vercel.live",
      "https://va.vercel-scripts.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'"], // Required for Tailwind
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:",
      // Add your image CDN domains
      "https://*.supabase.co",
      "https://images.unsplash.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.freeastrologyapi.com",
      "https://nominatim.openstreetmap.org", // 🔧 OPTION A: Allow Nominatim for geocoding
      "https://vercel.live",
      isDevelopment ? "ws://localhost:*" : "",
      isDevelopment ? "http://localhost:*" : "",
    ].filter(Boolean),
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  // In development, relax some restrictions
  if (isDevelopment) {
    delete cspDirectives["upgrade-insecure-requests"];
  }

  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * CORS configuration
 */
export function handleCORS(
  response: NextResponse,
  request: NextRequest,
  allowedOrigins?: string[],
): NextResponse {
  const origin = request.headers.get("origin");

  // Determine if origin is allowed
  const isAllowed = allowedOrigins
    ? allowedOrigins.includes(origin || "")
    : process.env.NEXT_PUBLIC_APP_URL === origin;

  if (isAllowed && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

/**
 * Security headers for API routes
 */
export function apiSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // API specific headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent caching of sensitive data
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
