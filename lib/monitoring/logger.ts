/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  environment: string;
}

class Logger {
  private readonly environment: string;
  private readonly isDevelopment: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.isDevelopment = this.environment === "development";
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = entry.context ? `\n${JSON.stringify(entry.context, null, 2)}` : "";
      return `[${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
    }

    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }

  /**
   * Log a message with context
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };

    const formatted = this.formatLogEntry(entry);

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = String(error);
    }

    this.log("error", message, errorContext);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext) {
    this.debug(`API Request: ${method} ${url}`, {
      type: "api_request",
      method,
      url,
      ...context,
    });
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    this.log(level, `API Response: ${method} ${url} ${status}`, {
      type: "api_response",
      method,
      url,
      status,
      duration,
      ...context,
    });
  }

  /**
   * Log database query
   */
  dbQuery(operation: string, table: string, duration: number, context?: LogContext) {
    this.debug(`DB Query: ${operation} ${table}`, {
      type: "db_query",
      operation,
      table,
      duration,
      ...context,
    });
  }

  /**
   * Log authentication event
   */
  auth(action: string, userId?: string, context?: LogContext) {
    this.info(`Auth: ${action}`, {
      type: "auth",
      action,
      userId,
      ...context,
    });
  }

  /**
   * Log user action
   */
  userAction(action: string, userId: string, context?: LogContext) {
    this.info(`User Action: ${action}`, {
      type: "user_action",
      action,
      userId,
      ...context,
    });
  }

  /**
   * Log performance metric
   */
performanceMetric(metric: string, value: number, unit = "ms", context?: LogContext) { 
  this.debug(`Performance: ${metric} = ${value}${unit}`, {
      type: "performance",
      metric,
      value,
      unit,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
