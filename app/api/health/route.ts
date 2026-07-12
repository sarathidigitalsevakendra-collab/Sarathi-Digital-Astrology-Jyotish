import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

/**
 * Basic Health Check Endpoint
 * Returns 200 OK if application is running
 *
 * Used by: Load balancers, monitoring systems, uptime checks
 */
export function GET(): NextResponse {
  try {
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    logger.error("Health check failed", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
