/**
 * Astrology Service Orchestrator
 *
 * Intelligently routes requests between:
 * 1. Python FastAPI service (Railway) - PRIMARY, unlimited requests
 * 2. FreeAstrologyAPI - FALLBACK, 50 req/day limit
 *
 * Strategy:
 * - Always try Python service first (free, fast, unlimited)
 * - Fall back to FreeAstrologyAPI only if Python service fails
 * - Track service health and automatically switch
 */

import { logger } from "@/lib/monitoring/logger";
import { pythonAstrologyClient } from "./python-client";
import { astrologyAPI, rateLimitTracker } from "./client";
import type {
  AstrologyRequest,
  BirthChartResponse,
  SVGChartResponse,
  PanchangResponse,
  DivisionalChartType,
} from "./types";

export type ServiceBackend = "python" | "freeastrology" | "unavailable";

/**
 * Service health tracker
 */
class ServiceHealthTracker {
  private pythonHealthy = true;
  private lastHealthCheck = 0;
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  async checkPythonHealth(): Promise<boolean> {
    const now = Date.now();

    // Only check health every minute
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.pythonHealthy;
    }

    this.lastHealthCheck = now;

    try {
      await pythonAstrologyClient.checkHealth();
      this.pythonHealthy = true;
      logger.info("Python service health check: OK");
      return true;
    } catch (error: unknown) {
      this.pythonHealthy = false;
      logger.warn("Python service health check: FAILED", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  isPythonHealthy(): boolean {
    return this.pythonHealthy;
  }
}

const healthTracker = new ServiceHealthTracker();

/**
 * Determine which backend to use for the request
 */
async function selectBackend(): Promise<ServiceBackend> {
  // Check if Python service is available
  if (pythonAstrologyClient.isAvailable()) {
    const isHealthy = await healthTracker.checkPythonHealth();
    if (isHealthy) {
      return "python";
    }
  }

  // Check if FreeAstrologyAPI has quota remaining
  if (rateLimitTracker.canMakeRequest()) {
    return "freeastrology";
  }

  return "unavailable";
}

/**
 * Astrology Service Orchestrator
 */
export class AstrologyOrchestrator {
  /**
   * Get birth chart with automatic fallback
   */
  async getBirthChart(request: AstrologyRequest): Promise<{
    data: BirthChartResponse;
    source: ServiceBackend;
  }> {
    const backend = await selectBackend();

    logger.debug("Birth chart request", { backend });

    try {
      if (backend === "python") {
        const data = await pythonAstrologyClient.getBirthChart(request);
        return { data, source: "python" };
      }

      if (backend === "freeastrology") {
        const data = await astrologyAPI.getBirthChart(request);
        return { data, source: "freeastrology" };
      }

      throw new Error("No astrology service available");
    } catch (error: unknown) {
      // If Python service fails, try FreeAstrologyAPI as fallback
      if (backend === "python" && rateLimitTracker.canMakeRequest()) {
        logger.warn("Python service failed, falling back to FreeAstrologyAPI", {
          error: error instanceof Error ? error.message : String(error),
        });

        try {
          const data = await astrologyAPI.getBirthChart(request);
          return { data, source: "freeastrology" };
        } catch (fallbackError) {
          logger.error("FreeAstrologyAPI fallback also failed", {
            error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Get chart SVG with automatic fallback
   */
  async getChartSVG(request: AstrologyRequest): Promise<{
    data: SVGChartResponse;
    source: ServiceBackend;
  }> {
    const backend = await selectBackend();

    logger.debug("Chart SVG request", { backend });

    try {
      if (backend === "python") {
        const data = await pythonAstrologyClient.getChartSVG(request);
        return { data, source: "python" };
      }

      if (backend === "freeastrology") {
        const data = await astrologyAPI.getChartSVG(request);
        return { data, source: "freeastrology" };
      }

      throw new Error("No astrology service available");
    } catch (error: unknown) {
      if (backend === "python" && rateLimitTracker.canMakeRequest()) {
        logger.warn("Python service failed, falling back to FreeAstrologyAPI", {
          error: error instanceof Error ? error.message : String(error),
        });

        try {
          const data = await astrologyAPI.getChartSVG(request);
          return { data, source: "freeastrology" };
        } catch (fallbackError) {
          logger.error("FreeAstrologyAPI fallback also failed", {
            error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Get Panchang (only available via FreeAstrologyAPI for now)
   */
  async getPanchang(request: AstrologyRequest): Promise<{
    data: PanchangResponse;
    source: ServiceBackend;
  }> {
    // Panchang not implemented in Python service yet, use FreeAstrologyAPI
    const data = await astrologyAPI.getPanchang(request);
    return { data, source: "freeastrology" };
  }

  /**
   * Get divisional chart (only available via FreeAstrologyAPI for now)
   */
  async getDivisionalChart(
    request: AstrologyRequest,
    chartType: DivisionalChartType,
  ): Promise<{
    data: BirthChartResponse;
    source: ServiceBackend;
  }> {
    // Divisional charts not implemented in Python service yet
    const data = await astrologyAPI.getDivisionalChart(request, chartType);
    return { data, source: "freeastrology" };
  }

  /**
   * Get service status
   */
  async getServiceStatus() {
    const backend = await selectBackend();

    return {
      selected_backend: backend,
      python_service: {
        available: pythonAstrologyClient.isAvailable(),
        healthy: healthTracker.isPythonHealthy(),
        state: pythonAstrologyClient.getServiceState(),
        url: process.env.ASTRO_PYTHON_SERVICE_URL,
      },
      freeastrology: {
        available: rateLimitTracker.canMakeRequest(),
        rate_limit: rateLimitTracker.getInfo(),
      },
    };
  }
}

/**
 * Singleton instance
 */
export const astrologyOrchestrator = new AstrologyOrchestrator();
