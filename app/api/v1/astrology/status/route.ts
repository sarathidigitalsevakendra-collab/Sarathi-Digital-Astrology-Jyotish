/**
 * GET /api/v1/astrology/status
 *
 * Get astrology service status and health information
 * Useful for monitoring and debugging
 */

import { NextRequest } from "next/server";
import { withRouteHandler } from "@/lib/api/route-handler";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";

export const GET = withRouteHandler(async (_req: NextRequest) => {
  const status = await astrologyOrchestrator.getServiceStatus();

  return {
    ...status,
    timestamp: new Date().toISOString(),
  };
});

export const runtime = "nodejs";
export const maxDuration = 10;
