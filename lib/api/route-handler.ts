/**
 * API Route Handler Wrapper
 *
 * Provides consistent error handling, logging, and performance monitoring
 * for Next.js App Router API routes.
 */

import { NextRequest, NextResponse } from "next/server";

export interface RouteContext {
  params?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    cached?: boolean;
  };
}

export type RouteHandler<T = unknown> = (
  req: NextRequest,
  context: RouteContext,
) => Promise<T | NextResponse>;

// eslint-disable-next-line complexity, max-lines-per-function
export function withRouteHandler<T = unknown>(
  handler: RouteHandler<T>,
): (req: NextRequest, context: RouteContext) => Promise<NextResponse> {
  return async (req: NextRequest, context: RouteContext) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      const result = await handler(req, context);

      if (result instanceof NextResponse) {
        return result;
      }

      const duration = Date.now() - startTime;
      logRequest(req, 200, duration, requestId);

      return NextResponse.json(
        {
          success: true,
          data: result,
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 200, headers: { "X-Request-ID": requestId } },
      );
    } catch (error: unknown) {
      const duration = Date.now() - startTime;

      if (error instanceof ApiError) {
        logRequest(
          req,
          error.statusCode,
          duration,
          requestId,
          error instanceof Error ? error.message : String(error),
        );
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error instanceof Error ? error.message : String(error),
              details: error.details,
            },
            meta: { timestamp: new Date().toISOString(), requestId },
          },
          { status: error.statusCode, headers: { "X-Request-ID": requestId } },
        );
      }

      console.error("[API Error]", { requestId, error });
      logRequest(req, 500, duration, requestId, "Internal server error");

      return NextResponse.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 500, headers: { "X-Request-ID": requestId } },
      );
    }
  };
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public override message: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function logRequest(
  req: NextRequest,
  status: number,
  duration: number,
  requestId: string,
  error?: string,
): void {
  const log = {
    requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    status,
    duration: `${duration}ms`,
    error,
  };

  if (status >= 500) {
    console.error("[API Error]", log);
  } else if (status >= 400) {
    console.warn("[API Warning]", log);
  } else if (process.env.NODE_ENV === "development") {
    console.error("[API Request]", log);
  }
}

export const ApiErrors = {
  notFound: (resource = "Resource") => new ApiError("NOT_FOUND", `${resource} not found`, 404),
  unauthorized: (message = "Unauthorized") => new ApiError("UNAUTHORIZED", message, 401),
  forbidden: (message = "Forbidden") => new ApiError("FORBIDDEN", message, 403),
  validation: (message: string, details?: unknown) =>
    new ApiError("VALIDATION_ERROR", message, 400, details),
  rateLimit: (message = "Rate limit exceeded") => new ApiError("RATE_LIMIT_EXCEEDED", message, 429),
  serviceUnavailable: (service: string) =>
    new ApiError("SERVICE_UNAVAILABLE", `${service} is currently unavailable`, 503),
  timeout: (message = "Request timeout") => new ApiError("TIMEOUT", message, 504),
};
