import { logger } from "./logger";

/**
 * Performance Monitoring Utilities
 *
 * Provides tools for measuring and tracking application performance:
 * - Function execution timing
 * - API request timing
 * - Component render timing
 * - Custom performance marks
 *
 * Note: Sentry is conditionally imported to avoid Edge Runtime compatibility issues
 */

/**
 * Runtime-safe Sentry utilities
 * These functions detect the runtime environment and only use Sentry in Node.js runtime
 */
const SafeSentry = {
  metrics: {
    distribution: (
      name: string,
      value: number,
      options?: { unit?: string; tags?: Record<string, string> },
    ) => {
      // Skip Sentry in Edge Runtime (where __dirname is not available)
      if (typeof process !== "undefined" && process.release?.name === "node") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
          const Sentry = require("@sentry/nextjs");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          Sentry.metrics.distribution(name, value, options);
        } catch {
          // Silently fail if Sentry not available - this is expected in Edge Runtime
        }
      }
    },
  },
};

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface TimingResult {
  duration: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance Metrics Store
 * Keeps track of all performance measurements
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Prevent memory leaks

  /**
   * Record a performance metric
   */
  record(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Log slow operations
    if (metric.duration > 1000) {
      logger.warn("Slow operation detected", {
        operation: metric.name,
        duration: `${metric.duration}ms`,
        ...metric.metadata,
      });

      // Report to Sentry (runtime-safe)
      SafeSentry.metrics.distribution(`performance.${metric.name}`, metric.duration, {
        unit: "millisecond",
        tags: metric.metadata as Record<string, string>,
      });
    }

    // Trim old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(filter?: { name?: string; minDuration?: number }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter((m) => m.name === filter.name);
    }

    if (filter?.minDuration !== undefined) {
      const minDuration = filter.minDuration;
      filtered = filtered.filter((m) => m.duration >= minDuration);
    }

    return filtered;
  }

  /**
   * Get performance statistics
   */
  getStats(name?: string) {
    const metrics = name ? this.metrics.filter((m) => m.name === name) : this.metrics;

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      min: durations[0],
      max: durations[durations.length - 1],
      mean: sum / metrics.length,
      median: durations[Math.floor(durations.length / 2)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure execution time of a function
 *
 * @example
 * ```ts
 * const result = await measureAsync(
 *   'fetchUserData',
 *   () => fetch('/api/user'),
 *   { userId: '123' }
 * )
 * ```
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    performanceMonitor.record({
      name,
      duration,
      timestamp: Date.now(),
      metadata: { ...metadata, success: true },
    });

    logger.debug(`Performance: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });

    return result;
  } catch (error: unknown) {
    const duration = performance.now() - start;

    performanceMonitor.record({
      name,
      duration,
      timestamp: Date.now(),
      metadata: { ...metadata, success: false },
    });

    logger.error(`Performance: ${name} (failed)`, error, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });

    throw error;
  }
}

/**
 * Measure execution time of a synchronous function
 */
export function measureSync<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
  const start = performance.now();

  try {
    const result = fn();
    const duration = performance.now() - start;

    performanceMonitor.record({
      name,
      duration,
      timestamp: Date.now(),
      metadata: { ...metadata, success: true },
    });

    logger.debug(`Performance: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });

    return result;
  } catch (error: unknown) {
    const duration = performance.now() - start;

    performanceMonitor.record({
      name,
      duration,
      timestamp: Date.now(),
      metadata: { ...metadata, success: false },
    });

    logger.error(`Performance: ${name} (failed)`, error, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });

    throw error;
  }
}

/**
 * Start a performance timer
 * Returns a function to end the timer
 *
 * @example
 * ```ts
 * const endTimer = startTimer('dataProcessing')
 * // ... do work ...
 * const { duration } = endTimer()
 * ```
 */
export function startTimer(name: string, metadata?: Record<string, unknown>) {
  const start = performance.now();

  return (additionalMetadata?: Record<string, unknown>): TimingResult => {
    const duration = performance.now() - start;
    const combinedMetadata = { ...metadata, ...additionalMetadata };

    performanceMonitor.record({
      name,
      duration,
      timestamp: Date.now(),
      metadata: combinedMetadata,
    });

    logger.debug(`Performance: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...combinedMetadata,
    });

    return {
      duration,
      metadata: combinedMetadata,
    };
  };
}

/**
 * Performance mark (Web Performance API wrapper)
 */
export function mark(name: string) {
  if (typeof window !== "undefined" && window.performance) {
    try {
      performance.mark(name);
    } catch (error: unknown) {
      logger.warn("Failed to create performance mark", { name, error });
    }
  }
}

/**
 * Performance measure (Web Performance API wrapper)
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if (typeof window !== "undefined" && window.performance) {
    try {
      const measureResult = performance.measure(name, startMark, endMark);
      const duration = measureResult.duration;

      performanceMonitor.record({
        name,
        duration,
        timestamp: Date.now(),
      });

      return duration;
    } catch (error: unknown) {
      logger.warn("Failed to measure performance", {
        name,
        startMark,
        endMark,
        error,
      });
      return null;
    }
  }

  return null;
}

/**
 * Track API request performance
 */
export async function trackApiRequest<T>(
  method: string,
  url: string,
  fn: () => Promise<T>,
): Promise<T> {
  return measureAsync("api_request", fn, { method, url });
}

/**
 * Create a performance tracking decorator
 *
 * @example
 * ```ts
 * class MyService {
 *   @tracked('MyService.fetchData')
 *   async fetchData() {
 *     // Implementation
 *   }
 * }
 * ```
 */
export function tracked(name?: string) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return measureAsync(metricName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Report Web Vitals to monitoring services
 * Use with Next.js app/layout.tsx
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: "web-vital" | "custom";
  rating?: "good" | "needs-improvement" | "poor";
}) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Web Vitals]", metric);
  }

  // Send to monitoring service
  logger.info("Web Vitals", {
    metricName: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
  });

  // Send to Sentry (runtime-safe)
  SafeSentry.metrics.distribution(`webvital.${metric.name}`, metric.value, {
    unit: "millisecond",
    tags: {
      rating: metric.rating || "unknown",
    },
  });

  // Send to analytics
  if (typeof window !== "undefined") {
    const windowWithGtag = window as unknown as Window & { gtag?: (...args: unknown[]) => void };
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag("event", metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_rating: metric.rating,
        non_interaction: true,
      });
    }
  }
}

/**
 * Component render tracker (React)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useRenderTracking('MyComponent')
 *   return <div>...</div>
 * }
 * ```
 */
export function useRenderTracking(componentName: string, props?: Record<string, unknown>) {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      renderCount.current++;

      if (renderCount.current > 1) {
        logger.debug("Component re-render", {
          component: componentName,
          renderCount: renderCount.current,
          props: props ? Object.keys(props) : undefined,
        });
      }
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace React {
  function useRef<T>(initialValue: T): { current: T };
  function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
}

/**
 * Performance budget checker
 * Warns when operations exceed thresholds
 */
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();

  /**
   * Set performance budget for an operation
   */
  setBudget(operation: string, maxDuration: number) {
    this.budgets.set(operation, maxDuration);
  }

  /**
   * Check if operation is within budget
   */
  check(operation: string, duration: number): boolean {
    const budget = this.budgets.get(operation);

    if (budget === undefined) {
      return true; // No budget set
    }

    if (duration > budget) {
      logger.warn("Performance budget exceeded", {
        operation,
        duration: `${duration}ms`,
        budget: `${budget}ms`,
        exceeded: `${duration - budget}ms`,
      });

      return false;
    }

    return true;
  }
}

export const performanceBudget = new PerformanceBudget();

// Set default budgets
performanceBudget.setBudget("api_request", 2000); // 2 seconds
performanceBudget.setBudget("page_load", 3000); // 3 seconds
performanceBudget.setBudget("database_query", 1000); // 1 second
