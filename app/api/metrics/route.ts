import { NextResponse } from "next/server";
import { performanceMonitor } from "@/lib/monitoring/performance";
import { cache } from "@/lib/api/cache";
import { deduplicator } from "@/lib/api/cache";
import { logger } from "@/lib/monitoring/logger";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * Performance Metrics Endpoint
 * Exposes application performance metrics
 *
 * GET /api/metrics - Get all performance statistics
 * GET /api/metrics?name=api_request - Get stats for specific metric
 */
// eslint-disable-next-line complexity, max-lines-per-function
export function GET(request: Request): NextResponse {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get("name");

    // Get performance statistics
    const stats = performanceMonitor.getStats(metricName || undefined);

    // Get cache statistics
    const cacheStats = cache.getStats();

    // Get deduplication statistics
    const dedupStats = {
      pendingRequests: deduplicator.getPendingCount(),
    };

    // Get slow operations (> 1 second)
    const slowOperations = performanceMonitor.getMetrics({
      minDuration: 1000,
    });

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    const response = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: stats,
      cache: cacheStats,
      deduplication: dedupStats,
      memory: memUsageMB,
      slowOperations: slowOperations.slice(-10).map((op) => ({
        name: op.name,
        duration: `${op.duration.toFixed(2)}ms`,
        timestamp: new Date(op.timestamp).toISOString(),
        metadata: op.metadata,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    logger.error("Failed to get metrics", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
