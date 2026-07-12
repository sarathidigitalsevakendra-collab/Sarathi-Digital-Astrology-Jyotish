# Monitoring & Error Tracking

Production monitoring, error tracking, and logging infrastructure.

## Overview

The platform uses **Sentry** for error tracking and custom **structured logging** for application monitoring.

---

## Sentry Setup

### Configuration

Add to your environment variables:

```bash
# Production (required)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional
NEXT_PUBLIC_VERCEL_ENV=production # Auto-set by Vercel
```

### Features

✅ **Automatic error capture** - Catches unhandled errors
✅ **Performance monitoring** - Tracks slow operations
✅ **Session replay** - Replay user sessions on errors
✅ **Error filtering** - Ignores common/expected errors
✅ **User context** - Tracks which user hit errors

### Usage

```typescript
import { captureException, setUser } from "@/lib/monitoring/sentry";

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    operation: "riskyOperation",
    userId: user.id,
  });
}

// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Clear user on logout
setUser(null);
```

### Error Filtering

Sentry automatically filters:

- ResizeObserver errors (browser quirks)
- Network errors (user connection issues)
- Expected auth errors (invalid sessions)
- Non-error promise rejections

### Performance Tracking

```typescript
import { startTransaction } from "@/lib/monitoring/sentry";

const transaction = startTransaction("api.users.fetch", "http");

try {
  const users = await fetchUsers();
  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

---

## Structured Logging

### Configuration

Logging is environment-aware:

- **Development**: Pretty-printed, debug enabled
- **Production**: JSON format, info+ only

### Usage

```typescript
import { logger } from "@/lib/monitoring/logger";

// Basic logging
logger.info("User signed in", { userId: user.id });
logger.warn("Rate limit approaching", { count: 95, limit: 100 });
logger.error("Payment failed", error, { orderId: "123" });

// API logging
logger.apiRequest("GET", "/api/users", { page: 1 });
logger.apiResponse("GET", "/api/users", 200, 150); // 150ms

// Database logging
logger.dbQuery("SELECT", "users", 45, { userId: "123" });

// Auth events
logger.auth("signin", userId, { method: "google" });

// Performance
logger.performance("page.render", 1200, "ms");

// User actions
logger.userAction("product.purchase", userId, { productId: "abc" });
```

### Log Levels

- **debug** - Development only, verbose info
- **info** - General information
- **warn** - Warning conditions
- **error** - Error conditions

### Log Format

#### Development

```
[INFO] User signed in
{
  "userId": "user-123",
  "method": "google"
}
```

#### Production (JSON)

```json
{
  "level": "info",
  "message": "User signed in",
  "context": {
    "userId": "user-123",
    "method": "google"
  },
  "timestamp": "2025-12-03T10:30:00.000Z",
  "environment": "production"
}
```

---

## Monitoring Best Practices

### 1. Always Log Errors

```typescript
try {
  await operation();
} catch (error) {
  logger.error("Operation failed", error, { operation: "name" });
  captureException(error);
  throw error;
}
```

### 2. Add Context

```typescript
logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  items: order.items.length,
});
```

### 3. Use Appropriate Levels

```typescript
logger.debug("Cache hit"); // Development only
logger.info("User action completed"); // Normal flow
logger.warn("Approaching rate limit"); // Potential issue
logger.error("Database connection failed"); // Error state
```

### 4. Track Performance

```typescript
const start = Date.now();
await slowOperation();
const duration = Date.now() - start;

if (duration > 1000) {
  logger.warn("Slow operation detected", {
    operation: "slowOperation",
    duration,
  });
}
```

### 5. Monitor Critical Paths

```typescript
// Authentication
logger.auth("signin.attempt", undefined, { method: "google" });
logger.auth("signin.success", userId, { method: "google" });

// Payments
logger.userAction("payment.initiated", userId, { amount: 1000 });
logger.userAction("payment.completed", userId, { orderId: "abc" });

// Data operations
logger.dbQuery("UPDATE", "users", duration, { userId });
```

---

## Error Handling

### Pattern 1: Capture and Re-throw

```typescript
try {
  await riskyOperation();
} catch (error) {
  captureException(error, { context: "operation" });
  logger.error("Operation failed", error);
  throw error; // Let Next.js error boundary handle it
}
```

### Pattern 2: Capture and Handle

```typescript
try {
  await riskyOperation();
} catch (error) {
  captureException(error);
  logger.error("Operation failed, using fallback", error);
  return fallbackValue;
}
```

### Pattern 3: Wrap Functions

```typescript
import { withErrorTracking } from "@/lib/monitoring/sentry";

const safeFunction = withErrorTracking(riskyFunction, { context: "user-action" });
```

---

## Alerts & Notifications

### Sentry Alerts

Configure in Sentry dashboard:

1. **Error Rate** - Alert when error rate > 5%
2. **New Errors** - Notify on first occurrence
3. **Regression** - Alert when resolved error returns
4. **Performance** - Alert on slow transactions

### Custom Alerts

```typescript
// Alert on critical errors
if (isCritical) {
  logger.error("CRITICAL: Payment processor down", error);
  captureException(error, { level: "fatal" });
}

// Alert on threshold
if (errorCount > threshold) {
  captureMessage("Error threshold exceeded", "warning");
}
```

---

## Production Checklist

Before going live:

- [ ] Set `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Configure Sentry alerts
- [ ] Set up error notifications (email/Slack)
- [ ] Test error tracking in staging
- [ ] Verify logs in production
- [ ] Set up log aggregation (optional)
- [ ] Configure performance monitoring
- [ ] Set performance budgets

---

## Viewing Errors

### Sentry Dashboard

1. Visit https://sentry.io/organizations/your-org/
2. Select project
3. View **Issues** for errors
4. Check **Performance** for slow operations
5. Use **Replays** to see user sessions

### Logs

#### Development

Check terminal output

#### Production (Vercel)

1. Visit Vercel dashboard
2. Select deployment
3. Click **Logs**
4. Filter by level/search

---

## Troubleshooting

### Sentry not capturing errors

Check:

1. `NEXT_PUBLIC_SENTRY_DSN` is set
2. Error isn't filtered (see filtering rules)
3. Sentry is initialized (`sentry.*.config.ts`)
4. Running in production or with DSN set

### Logs not showing

Check:

1. Log level (debug only shows in dev)
2. Environment configuration
3. Console.log suppression (tests)

### Too many errors

1. Review error frequency
2. Add filters for expected errors
3. Fix underlying issues
4. Adjust sampling rate

---

## Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Structured Logging Best Practices](https://www.datadoghq.com/blog/structured-logging-best-practices/)
- [Error Monitoring Guide](https://sentry.io/welcome/)
