/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { logger } from "@/lib/monitoring/logger";

export interface CacheOptions {
  /**
   * Time to live in milliseconds
   * @default 300000 (5 minutes)
   */
  ttl?: number;

  /**
   * Custom cache key generator
   */
  key?: (...args: unknown[]) => string;

  /**
   * Whether to cache errors
   * @default false
   */
  cacheErrors?: boolean;

  /**
   * Whether to return stale data while revalidating
   * @default true
   */
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isError: boolean;
}

/**
 * In-memory cache with TTL support
 * For production, consider using Redis
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private revalidating = new Set<string>();

  /**
   * Get item from cache
   */
  get<T>(key: string, options?: CacheOptions): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const ttl = options?.ttl || 300000;

    // Return cached data if still fresh
    if (age < ttl) {
      logger.debug("Cache hit", { key, age, ttl });
      return entry.data as T;
    }

    // Stale data - trigger revalidation but return stale
    if (options?.staleWhileRevalidate && !this.revalidating.has(key)) {
      logger.debug("Cache stale - returning stale data", { key, age, ttl });
      return entry.data as T;
    }

    // Expired
    logger.debug("Cache miss - expired", { key, age, ttl });
    this.cache.delete(key);
    return null;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, isError: boolean = false) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isError,
    });
    logger.debug("Cache set", { key });
  }

  /**
   * Delete item from cache
   */
  delete(key: string) {
    this.cache.delete(key);
    logger.debug("Cache delete", { key });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    logger.info("Cache cleared");
  }

  /**
   * Mark key as revalidating
   */
  markRevalidating(key: string) {
    this.revalidating.add(key);
  }

  /**
   * Unmark key as revalidating
   */
  unmarkRevalidating(key: string) {
    this.revalidating.delete(key);
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      revalidating: this.revalidating.size,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(ttl: number = 300000) {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Cache cleanup", { cleaned, remaining: this.cache.size });
    }
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Auto-cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => cache.cleanup(), 300000);
}

/**
 * Default cache key generator
 */
function defaultKeyGenerator(...args: unknown[]): string {
  return JSON.stringify(args);
}

/**
 * Cache decorator for async functions
 *
 * @example
 * ```ts
 * const getCachedData = cached(
 *   async (id: string) => fetchData(id),
 *   { ttl: 60000 }
 * )
 * ```
 */
export function cached<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: CacheOptions = {},
): T {
  const keyGenerator = options.key || defaultKeyGenerator;
  const ttl = options.ttl || 300000;

  return (async (...args: Parameters<T>) => {
    const key = `cached:${fn.name}:${keyGenerator(...args)}`;

    // Try to get from cache
    const cached = cache.get(key, options);
    if (cached !== null) {
      // If stale, trigger background revalidation
      const entry = (cache as any).cache.get(key);
      if (entry && Date.now() - entry.timestamp >= ttl) {
        cache.markRevalidating(key);

        // Revalidate in background
        fn(...args)
          .then((data) => {
            cache.set(key, data);
            cache.unmarkRevalidating(key);
          })
          .catch((err) => {
            logger.error("Cache revalidation failed", err, { key });
            cache.unmarkRevalidating(key);
          });
      }

      return cached;
    }

    // Execute function
    try {
      const data = await fn(...args);
      cache.set(key, data, false);
      return data;
    } catch (error: unknown) {
      if (options.cacheErrors) {
        cache.set(key, error, true);
      }
      throw error;
    }
  }) as T;
}

/**
 * Memoization for synchronous functions
 */
export function memoize<T extends (...args: unknown[]) => any>(
  fn: T,
  options: { key?: (...args: unknown[]) => string; maxSize?: number } = {},
): T {
  const cache = new Map<string, any>();
  const keyGenerator = options.key || defaultKeyGenerator;
  const maxSize = options.maxSize || 100;

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);

    // LRU eviction if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request deduplication
 * Prevents multiple identical requests from running simultaneously
 */
class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Return existing promise if request is in flight
    if (this.pending.has(key)) {
      logger.debug("Request deduplicated", { key });
      // @ts-expect-error - Type inference issue with deduplicator return type
      return this.pending.get(key)!;
    }

    // Execute and store promise
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Get number of pending requests
   */
  getPendingCount() {
    return this.pending.size;
  }
}

export const deduplicator = new RequestDeduplicator();

/**
 * Deduplicate requests with the same key
 */
export function deduplicated<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator?: (...args: unknown[]) => string,
): T {
  const getKey = keyGenerator || defaultKeyGenerator;

  return (async (...args: Parameters<T>) => {
    const key = `dedup:${fn.name}:${getKey(...args)}`;
    return deduplicator.deduplicate(key, () => fn(...args));
  }) as T;
}

/**
 * Batch multiple requests into a single request
 */
export class RequestBatcher<T, K = string> {
  private queue: Array<{
    key: K;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchFn: (keys: K[]) => Promise<T[]>,
    private options: {
      maxBatchSize?: number;
      maxWaitTime?: number;
    } = {},
  ) {}

  async load(key: K): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Execute immediately if batch is full
      if (this.queue.length >= (this.options.maxBatchSize || 50)) {
        this.executeBatch();
        return;
      }

      // Otherwise wait for more requests
      if (!this.timer) {
        this.timer = setTimeout(() => this.executeBatch(), this.options.maxWaitTime || 50);
      }
    });
  }

  private async executeBatch() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0);
    if (batch.length === 0) return;

    try {
      const keys = batch.map((item) => item.key);
      const results = await this.batchFn(keys);

      // Resolve all promises
      batch.forEach((item, index) => {
        const result = results[index];
        if (result !== undefined) {
          item.resolve(result);
        }
      });
    } catch (error: unknown) {
      // Reject all promises
      batch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}
