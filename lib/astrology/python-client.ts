/**
 * Python FastAPI Astrology Service Client
 *
 * Connects to the Railway-deployed Python service for astrology calculations.
 *
 * Features:
 * - Connection pooling with retry logic
 * - Circuit breaker pattern for service failures
 * - Automatic failover to FreeAstrologyAPI
 * - Health check monitoring
 * - Timeout handling (10s default)
 */

import { logger } from "@/lib/monitoring/logger";
import { captureException } from "@/lib/monitoring/sentry";
import { retryFetch } from "@/lib/api/retry";
import { measureAsync } from "@/lib/monitoring/performance";
import type { AstrologyRequest, BirthChartResponse, SVGChartResponse } from "./types";

const PYTHON_SERVICE_URL = process.env.ASTRO_PYTHON_SERVICE_URL || "http://localhost:4001";
const TIMEOUT_MS = parseInt(process.env.ASTRO_PYTHON_SERVICE_TIMEOUT_MS || "10000", 10);

/**
 * Circuit breaker for Python service
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 1 minute

  recordSuccess() {
    this.failureCount = 0;
    this.state = "closed";
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.state = "open";
      logger.warn("Python service circuit breaker opened", {
        failureCount: this.failureCount,
      });
    }
  }

  canMakeRequest(): boolean {
    if (this.state === "closed") {
      return true;
    }

    if (this.state === "open") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.RESET_TIMEOUT) {
        this.state = "half-open";
        logger.info("Python service circuit breaker entering half-open state");
        return true;
      }
      return false;
    }

    // half-open state
    return true;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
    };
  }
}

const circuitBreaker = new CircuitBreaker();

/**
 * Make request to Python service with timeout and retry
 */
async function makePythonRequest<T>(
  endpoint: string,
  payload: Partial<AstrologyRequest> | Record<string, unknown>,
  operationName: string,
): Promise<T> {
  // Check circuit breaker
  if (!circuitBreaker.canMakeRequest()) {
    const state = circuitBreaker.getState();
    throw new Error(
      `Python service circuit breaker is ${state.state} (failures: ${state.failureCount})`,
    );
  }

  const url = `${PYTHON_SERVICE_URL}${endpoint}`;

  return measureAsync(
    `python_service_${operationName}`,
    async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await retryFetch(
          url,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
          {
            maxRetries: 2,
            initialDelay: 100,
          },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Python service error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        circuitBreaker.recordSuccess();

        logger.debug("Python service request successful", {
          endpoint,
          operation: operationName,
        });

        return data as T;
      } catch (error: unknown) {
        circuitBreaker.recordFailure();

        logger.error("Python service request failed", error, {
          endpoint,
          operation: operationName,
          circuitBreakerState: circuitBreaker.getState(),
        });

        captureException(error, {
          tags: { component: "python-astrology-service", endpoint },
          extra: { operation: operationName },
        });

        throw error;
      }
    },
    { endpoint, operation: operationName },
  );
}

/**
 * Python Astrology Service Client
 */
export class PythonAstrologyClient {
  /**
   * Check if Python service is healthy
   */
  async checkHealth(): Promise<{ status: string; source: string; version?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s health check timeout

      const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      circuitBreaker.recordSuccess();

      return data;
    } catch (error: unknown) {
      circuitBreaker.recordFailure();
      logger.error("Python service health check failed", error);
      throw error;
    }
  }

  /**
   * Get birth chart from Python service
   */
  async getBirthChart(request: AstrologyRequest): Promise<BirthChartResponse> {
    return makePythonRequest<BirthChartResponse>("/planets", request, "birth_chart");
  }

  /**
   * Get chart SVG from Python service
   */
  async getChartSVG(request: AstrologyRequest): Promise<SVGChartResponse> {
    const response = await makePythonRequest<Record<string, unknown>>(
      "/horoscope-chart-svg-code",
      request,
      "chart_svg",
    );

    return {
      svg_code: (response.output as string) || (response.svg_code as string) || "",
      chart_name: "Rasi Chart",
    };
  }

  /**
   * Check if Python service is available
   */
  isAvailable(): boolean {
    return circuitBreaker.canMakeRequest();
  }

  /**
   * Get circuit breaker state
   */
  getServiceState() {
    return circuitBreaker.getState();
  }
}

/**
 * Singleton instance
 */
export const pythonAstrologyClient = new PythonAstrologyClient();
