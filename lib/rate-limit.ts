import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./monitoring/logger";

/**
 * Simple in-memory rate limiter
 * For production, use Redis or Upstash Rate Limit
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    const entry = store[key];
    if (entry && entry.resetAt < now) {
      delete store[key];
    }
  });
}, 60000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;

  /**
   * Window duration in milliseconds
   * @default 60000 (1 minute)
   */
  window?: number;

  /**
   * Custom identifier function
   * @default Uses IP address
   */
  identifier?: (request: NextRequest) => string;
}

/**
 * Rate limiting middleware
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest): Promise<NextResponse> {
 *   const rateLimitResponse = await rateLimit(request, {
 *     limit: 10,
 *     window: 60000,
 *   })
 *
 *   if (rateLimitResponse) return rateLimitResponse
 *
 *   // ... handle request
 * }
 * ```
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): Promise<NextResponse | null> {
  const { limit, window = 60000, identifier } = config;

  // Get identifier (IP address by default)
  const id = identifier
    ? identifier(request)
    : request.ip || request.headers.get("x-forwarded-for") || "anonymous";

  const key = `rate-limit:${id}`;
  const now = Date.now();

  // Get or create rate limit entry
  let entry = store[key];

  if (!entry || entry.resetAt < now) {
    // Create new entry
    entry = {
      count: 1,
      resetAt: now + window,
    };
    store[key] = entry;

    return null; // Allow request
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > limit) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);

    logger.warn("Rate limit exceeded", {
      identifier: id,
      limit,
      count: entry.count,
      resetIn,
    });

    return NextResponse.json(
      {
        error: "rate_limit_exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetIn),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(entry.resetAt),
        },
      },
    );
  }

  // Allow request and add rate limit headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(limit - entry.count));
  response.headers.set("X-RateLimit-Reset", String(entry.resetAt));

  return null; // Allow request
}

/**
 * Create a rate limiter for a specific route
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ limit: 10, window: 60000 })
 *
 * export async function GET(request: NextRequest): Promise<NextResponse> {
 *   const rateLimitResponse = await limiter(request)
 *   if (rateLimitResponse) return rateLimitResponse
 *
 *   // ... handle request
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest) => rateLimit(request, config);
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limit for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: createRateLimiter({
    limit: 5,
    window: 15 * 60 * 1000,
  }),

  /**
   * Moderate rate limit for API endpoints
   * 100 requests per minute
   */
  api: createRateLimiter({
    limit: 100,
    window: 60 * 1000,
  }),

  /**
   * Generous rate limit for public endpoints
   * 300 requests per minute
   */
  public: createRateLimiter({
    limit: 300,
    window: 60 * 1000,
  }),

  /**
   * Very strict rate limit for sensitive operations
   * 3 requests per hour
   */
  sensitive: createRateLimiter({
    limit: 3,
    window: 60 * 60 * 1000,
  }),

  /**
   * Rate limit for astrology calculation endpoints
   * 30 requests per minute (chart calculations are expensive)
   */
  astrology: createRateLimiter({
    limit: 30,
    window: 60 * 1000,
  }),
};
