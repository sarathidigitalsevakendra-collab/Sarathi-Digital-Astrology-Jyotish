/**
 * Payment Retry Logic with Exponential Backoff
 *
 * Implements retry logic for failed payment operations to improve payment
 * success rate from 95% to 99% by handling transient network failures.
 *
 * Retry Strategy:
 * - Attempt 1: Immediate
 * - Attempt 2: After 1 second
 * - Attempt 3: After 2 seconds
 * - Attempt 4: After 4 seconds (total 3 retries)
 *
 * @module lib/payments/retry
 *
 * Note: Sentry is conditionally imported to avoid Edge Runtime compatibility issues
 */

/**
 * Runtime-safe Sentry utilities
 * These functions detect the runtime environment and only use Sentry in Node.js runtime
 */
const SafeSentry = {
  addBreadcrumb: (breadcrumb: {
    category: string;
    message: string;
    level?: "info" | "warning" | "error";
    data?: Record<string, unknown>;
  }) => {
    // Skip Sentry in Edge Runtime (where __dirname is not available)
    if (typeof process !== "undefined" && process.release?.name === "node") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const Sentry = require("@sentry/nextjs");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        Sentry.addBreadcrumb(breadcrumb);
      } catch {
        // Silently fail if Sentry not available - this is expected in Edge Runtime
      }
    }
  },
  captureException: (
    error: unknown,
    options?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    },
  ) => {
    if (typeof process !== "undefined" && process.release?.name === "node") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const Sentry = require("@sentry/nextjs");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        Sentry.captureException(error, options);
      } catch {
        // Silently fail if Sentry not available - this is expected in Edge Runtime
      }
    }
  },
  captureMessage: (
    message: string,
    options?: {
      level?: "info" | "warning" | "error";
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    },
  ) => {
    if (typeof process !== "undefined" && process.release?.name === "node") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const Sentry = require("@sentry/nextjs");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        Sentry.captureMessage(message, options);
      } catch {
        // Silently fail if Sentry not available - this is expected in Edge Runtime
      }
    }
  },
};

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number;

  /**
   * Initial delay in milliseconds (default: 1000ms = 1s)
   */
  initialDelay?: number;

  /**
   * Backoff multiplier (default: 2 for exponential backoff)
   */
  backoffMultiplier?: number;

  /**
   * Function to determine if an error is retryable
   */
  isRetryable?: (error: unknown) => boolean;

  /**
   * Callback fired on each retry attempt
   */
  onRetry?: (attempt: number, error: unknown, nextDelay: number) => void;
}

/**
 * Default retryable error checker
 * Returns true for network errors, timeouts, and 5xx server errors
 */
function defaultIsRetryable(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // Timeout errors
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  // HTTP 5xx errors (server errors are retryable)
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: number }).status === "number"
  ) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }

  // Razorpay gateway timeout or temporary errors
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    const retryableCodes = ["GATEWAY_ERROR", "BAD_REQUEST_ERROR", "SERVER_ERROR"];
    return retryableCodes.includes(code);
  }

  return false;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn Async function to retry
 * @param options Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => createRazorpayOrder({ amount: 500 }),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown;
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts + 1; attempt++) {
    try {
      // Attempt the operation
      const result = await fn();

      // Success! Log if this was a retry
      if (attempt > 1) {
        SafeSentry.addBreadcrumb({
          category: "payment.retry",
          message: `Payment operation succeeded on attempt ${attempt}`,
          level: "info",
          data: {
            attempt,
            totalAttempts: maxAttempts + 1,
          },
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // If this is the last attempt, don't retry
      if (attempt > maxAttempts) {
        // Log final failure to Sentry
        SafeSentry.captureException(error, {
          tags: {
            operation: "payment_retry_exhausted",
            attempts: String(attempt),
          },
          extra: {
            maxAttempts,
            finalError: error,
          },
        });

        throw error;
      }

      // Check if error is retryable
      if (!isRetryable(error)) {
        SafeSentry.addBreadcrumb({
          category: "payment.retry",
          message: "Payment error is not retryable, failing immediately",
          level: "warning",
          data: {
            attempt,
            error: String(error),
          },
        });

        throw error;
      }

      // Calculate next delay
      const nextDelay = attempt === 1 ? currentDelay : currentDelay * backoffMultiplier;

      // Log retry attempt
      SafeSentry.addBreadcrumb({
        category: "payment.retry",
        message: `Payment attempt ${attempt} failed, retrying in ${nextDelay}ms`,
        level: "warning",
        data: {
          attempt,
          nextAttempt: attempt + 1,
          delay: nextDelay,
          error: String(error),
        },
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error, nextDelay);
      }

      // Wait before next attempt
      await sleep(nextDelay);

      // Update delay for next iteration
      currentDelay = nextDelay;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Specialized retry for Razorpay order creation
 *
 * @param orderCreationFn Function that creates a Razorpay order
 * @returns Razorpay order
 *
 * @example
 * ```typescript
 * const order = await retryRazorpayOrderCreation(() =>
 *   createRazorpayOrder({ amount: 500, currency: "INR" })
 * );
 * ```
 */
export async function retryRazorpayOrderCreation<T>(orderCreationFn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(orderCreationFn, {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt, error, nextDelay) => {
      console.warn(
        `[Razorpay] Order creation attempt ${attempt} failed. Retrying in ${nextDelay}ms...`,
      );
      console.warn(`[Razorpay] Error:`, error);
    },
  });
}

/**
 * Specialized retry for payment verification
 *
 * @param verificationFn Function that verifies payment
 * @returns Verification result
 *
 * @example
 * ```typescript
 * const verified = await retryPaymentVerification(() =>
 *   verifyPayment({ orderId, paymentId, signature })
 * );
 * ```
 */
export async function retryPaymentVerification<T>(verificationFn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(verificationFn, {
    maxAttempts: 2, // Fewer retries for verification (it's usually quick)
    initialDelay: 500,
    backoffMultiplier: 2,
    onRetry: (attempt, error, nextDelay) => {
      console.warn(
        `[Razorpay] Payment verification attempt ${attempt} failed. Retrying in ${nextDelay}ms...`,
      );
      console.warn(`[Razorpay] Error:`, error);
    },
  });
}

/**
 * Circuit breaker for payment gateway
 *
 * Tracks failures and temporarily disables payment gateway if failure rate
 * exceeds threshold.
 */
export class PaymentCircuitBreaker {
  private failures = 0;
  private successes = 0;
  private isOpen = false;
  private lastFailureTime: number | null = null;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000, // 1 minute
  ) {}

  /**
   * Check if circuit is open (gateway disabled)
   */
  isCircuitOpen(): boolean {
    // Auto-reset if timeout has passed
    if (this.isOpen && this.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeout) {
        this.reset();
        return false;
      }
    }

    return this.isOpen;
  }

  /**
   * Record a successful payment
   */
  recordSuccess(): void {
    this.successes++;
    this.failures = 0; // Reset failure count on success

    if (this.isOpen) {
      SafeSentry.addBreadcrumb({
        category: "payment.circuit_breaker",
        message: "Circuit breaker closed after successful payment",
        level: "info",
      });
    }

    this.isOpen = false;
  }

  /**
   * Record a failed payment
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold && !this.isOpen) {
      this.isOpen = true;

      SafeSentry.captureMessage("Payment circuit breaker opened", {
        level: "error",
        tags: {
          operation: "circuit_breaker_opened",
        },
        extra: {
          failures: this.failures,
          threshold: this.failureThreshold,
        },
      });
    }
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.isOpen = false;
    this.lastFailureTime = null;
  }

  /**
   * Get current stats
   */
  getStats(): { failures: number; successes: number; isOpen: boolean } {
    return {
      failures: this.failures,
      successes: this.successes,
      isOpen: this.isOpen,
    };
  }
}

// Global circuit breaker instance
export const paymentCircuitBreaker = new PaymentCircuitBreaker();
