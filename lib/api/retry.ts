/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { logger } from "@/lib/monitoring/logger";
import { captureException } from "@/lib/monitoring/sentry";

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Backoff multiplier
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Function to determine if error is retryable
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  /**
   * Callback on retry attempt
   */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    // Type guard for error with code property
    const hasCode = (err: unknown): err is { code: string } =>
      typeof err === "object" && err !== null && "code" in err;

    // Type guard for error with response property
    const hasResponse = (err: unknown): err is { response: { status: number } } =>
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof (err as any).response === "object" &&
      (err as any).response !== null &&
      "status" in (err as any).response;

    // Retry on network errors and 5xx server errors
    if (hasCode(error) && (error.code === "ECONNRESET" || error.code === "ETIMEDOUT")) {
      return true;
    }

    // Retry on HTTP 5xx errors
    if (hasResponse(error) && error.response.status >= 500 && error.response.status < 600) {
      return true;
    }

    // Retry on specific HTTP errors
    if (hasResponse(error) && [408, 429, 503, 504].includes(error.response.status)) {
      return true;
    }

    return false;
  },
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number,
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (randomness) to prevent thundering herd
  const jitter = delay * 0.1 * Math.random();

  return Math.floor(delay + jitter);
}

/**
 * Retry a function with exponential backoff
 *
 * @example
 * ```ts
 * const data = await retry(
 *   async () => fetch('/api/data').then(r => r.json()),
 *   { maxRetries: 3 }
 * )
 * ```
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt > opts.maxRetries) {
        break;
      }

      // Check if we should retry
      if (!opts.shouldRetry(error, attempt)) {
        logger.warn("Error not retryable, failing immediately", {
          error: error instanceof Error ? error.message : String(error),
          attempt,
        });
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.backoffMultiplier,
        opts.maxDelay,
      );

      logger.warn("Retrying after error", {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        delay,
        maxRetries: opts.maxRetries,
      });

      // Call retry callback
      opts.onRetry(error, attempt, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  logger.error("All retry attempts failed", lastError, {
    maxRetries: opts.maxRetries,
  });

  captureException(lastError, {
    tags: { retry: "failed" },
    extra: { maxRetries: opts.maxRetries },
  });

  throw lastError;
}

/**
 * Retry specifically for fetch requests
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function retryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(input, init);

      // Throw on HTTP errors to trigger retry
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
      }

      return response;
    },
    {
      ...options,
      shouldRetry: (error, attempt) => {
        // Type guards
        const hasCode = (err: unknown): err is { code: string } =>
          typeof err === "object" && err !== null && "code" in err;

        const hasResponse = (err: unknown): err is { response: { status: number } } =>
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object" &&
          (err as any).response !== null &&
          "status" in (err as any).response;

        // Custom logic for fetch
        const status = hasResponse(error) ? error.response.status : undefined;

        // Don't retry client errors (4xx) except specific ones
        if (status && status >= 400 && status < 500) {
          return [408, 429].includes(status);
        }

        // Retry server errors (5xx)
        if (status && status >= 500) {
          return true;
        }

        // Retry network errors
        if (hasCode(error) && (error.code === "ECONNRESET" || error.code === "ETIMEDOUT")) {
          return true;
        }

        // Use custom logic if provided
        if (options?.shouldRetry) {
          return options.shouldRetry(error, attempt);
        }

        return false;
      },
    },
  );
}

/**
 * Circuit breaker pattern
 * Prevents cascading failures by stopping requests after threshold
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000, // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      // Check if we should try again
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "half-open";
        logger.info("Circuit breaker: half-open", {
          failures: this.failures,
        });
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();

      // Success - reset if half-open
      if (this.state === "half-open") {
        this.reset();
        logger.info("Circuit breaker: closed after success");
      }

      return result;
    } catch (error: unknown) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = "open";
      logger.error("Circuit breaker: opened", {
        failures: this.failures,
        threshold: this.threshold,
      });

      captureException(new Error("Circuit breaker opened"), {
        extra: { failures: this.failures },
      });

      // Auto-reset after timeout
      setTimeout(() => {
        if (this.state === "open") {
          this.reset();
          logger.info("Circuit breaker: auto-reset after timeout");
        }
      }, this.timeout);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = "closed";
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Request timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Request timeout",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}
