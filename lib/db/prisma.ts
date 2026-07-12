import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logger } from "@/lib/monitoring/logger";

/**
 * Prisma v7 Client Singleton with PostgreSQL Adapter
 *
 * Prisma v7 Changes:
 * - Uses driver adapters instead of connection strings in schema
 * - Connection pooling configured via pg.Pool
 * - Adapter pattern for database connections
 * - Logging for slow queries and errors
 * - Graceful shutdown handling
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * Create PostgreSQL connection pool
 */
function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new Pool({
    connectionString,
    // Connection pool configuration
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 10000, // Connection timeout 10s
  });
}

/**
 * Create Prisma Client with PostgreSQL adapter
 */
function createPrismaClient() {
  // Create or reuse connection pool
  const pool = globalForPrisma.pool ?? createPool();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  // Create Prisma adapter for PostgreSQL
  const adapter = new PrismaPg(pool);

  // Initialize Prisma Client with adapter (Prisma v7)
  const client = new PrismaClient({
    adapter,
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });

  // Log slow queries (> 1 second)
  client.$on("query" as never, (e: unknown) => {
    const queryEvent = e as { duration?: number; query?: string; params?: unknown };
    const duration = queryEvent.duration || 0;

    if (duration > 1000) {
      logger.warn("Slow database query detected", {
        query: queryEvent.query,
        duration: `${duration}ms`,
        params: queryEvent.params,
      });
    }

    if (process.env.NODE_ENV === "development" && duration > 100) {
      logger.debug("Database query", {
        query: queryEvent.query,
        duration: `${duration}ms`,
      });
    }
  });

  // Log errors
  client.$on("error" as never, (e: unknown) => {
    logger.error("Database error", e instanceof Error ? e : undefined, { event: e });
  });

  // Log warnings
  client.$on("warn" as never, (e: unknown) => {
    logger.warn("Database warning", { event: e });
  });

  return client;
}

/**
 * Export singleton Prisma Client instance
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown - disconnect Prisma and close pool on process exit
 */
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    logger.info("Disconnecting Prisma Client and closing pool...");
    await prisma.$disconnect();
    if (globalForPrisma.pool) {
      await globalForPrisma.pool.end();
    }
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT received - disconnecting Prisma Client and closing pool...");
    await prisma.$disconnect();
    if (globalForPrisma.pool) {
      await globalForPrisma.pool.end();
    }
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received - disconnecting Prisma Client and closing pool...");
    await prisma.$disconnect();
    if (globalForPrisma.pool) {
      await globalForPrisma.pool.end();
    }
    process.exit(0);
  });
}

/**
 * Database connection health check
 */
export async function checkDatabaseConnection(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      healthy: true,
      latency,
    };
  } catch (error: unknown) {
    const latency = Date.now() - start;

    logger.error("Database connection check failed", error instanceof Error ? error : undefined);

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get database pool stats (if available)
 */
export async function getDatabaseStats() {
  try {
    // Get active connections (PostgreSQL specific)
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    return {
      activeConnections: Number(result[0]?.count || 0),
    };
  } catch (error: unknown) {
    logger.error("Failed to get database stats", error instanceof Error ? error : undefined);
    return {
      activeConnections: -1,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Transaction helper with retry logic
 */
export async function withTransaction<T>(
  fn: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) => Promise<T>,
  options?: {
    maxRetries?: number;
    timeout?: number;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries || 3;
  const timeout = options?.timeout || 10000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        timeout,
        maxWait: 5000, // Maximum time to wait for a transaction to start
      });
    } catch (error: unknown) {
      lastError = error;

      // Type guard for Prisma errors
      const prismaError = error as { code?: string; message?: string };

      // Don't retry on certain errors
      if (
        prismaError.code === "P2002" || // Unique constraint violation
        prismaError.code === "P2003" || // Foreign key constraint violation
        prismaError.code === "P2025" // Record not found
      ) {
        throw error;
      }

      // Retry on deadlocks and timeouts
      if (attempt < maxRetries) {
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        logger.warn("Transaction failed, retrying...", {
          attempt,
          maxRetries,
          delay,
          error: prismaError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error("Transaction failed after all retries", lastError);
  throw lastError;
}
