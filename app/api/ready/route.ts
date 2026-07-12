import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { checkDatabaseConnection } from "@/lib/db/prisma";

// Force dynamic rendering to avoid DATABASE_URL requirement at build time
export const dynamic = "force-dynamic";

/**
 * Readiness Check Endpoint
 * Returns 200 OK only if all critical dependencies are available
 *
 * Checks:
 * - Database connectivity
 * - External service availability
 *
 * Used by: Kubernetes readiness probes, load balancers
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(): Promise<NextResponse> {
  const checks: Record<string, { status: "ok" | "error"; message?: string; latency?: number }> = {};
  let allHealthy = true;

  // 1. Check Database Connection
  try {
    const dbHealth = await checkDatabaseConnection();

    if (!dbHealth.healthy) {
      checks.database = {
        status: "error",
        message: dbHealth.error || "Database connection failed",
        latency: dbHealth.latency,
      };
      allHealthy = false;
    } else {
      checks.database = {
        status: "ok",
        latency: dbHealth.latency,
      };
    }
  } catch (error: unknown) {
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    allHealthy = false;
    logger.error("Database health check failed", error);
  }

  // 2. Check Environment Variables
  try {
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      checks.environment = {
        status: "error",
        message: `Missing required env vars: ${missingVars.join(", ")}`,
      };
      allHealthy = false;
    } else {
      checks.environment = {
        status: "ok",
      };
    }
  } catch (error: unknown) {
    checks.environment = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    allHealthy = false;
  }

  // 3. Check Memory Usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  checks.memory = {
    status: "ok",
    message: `RSS: ${memUsageMB.rss}MB, Heap: ${memUsageMB.heapUsed}/${memUsageMB.heapTotal}MB`,
  };

  const responseBody = {
    status: allHealthy ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    memory: memUsageMB,
  };

  if (!allHealthy) {
    logger.warn("Readiness check failed", responseBody);
  }

  return NextResponse.json(responseBody, { status: allHealthy ? 200 : 503 });
}
