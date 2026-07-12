# Security Documentation

Security features, best practices, and implementation guide.

## Overview

The platform implements multiple security layers:

- Rate limiting
- Security headers (OWASP recommended)
- CORS configuration
- Content Security Policy (CSP)
- Input validation
- Session management

---

## Rate Limiting

### Configuration

```typescript
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

// Use preset limiter
export async function POST(request: NextRequest) {
  const limitResponse = await rateLimiters.auth(request);
  if (limitResponse) return limitResponse;

  // Handle request
}

// Custom rate limit
const limitResponse = await rateLimit(request, {
  limit: 10,
  window: 60000, // 1 minute
});
```

### Preset Limiters

| Limiter     | Limit | Window | Use Case                 |
| ----------- | ----- | ------ | ------------------------ |
| `auth`      | 5     | 15 min | Authentication endpoints |
| `api`       | 100   | 1 min  | General API routes       |
| `public`    | 300   | 1 min  | Public endpoints         |
| `sensitive` | 3     | 1 hour | Sensitive operations     |

### Custom Identifiers

```typescript
await rateLimit(request, {
  limit: 10,
  window: 60000,
  identifier: (req) => req.headers.get("x-api-key") || "anonymous",
});
```

### Headers

Rate limit responses include:

- `X-RateLimit-Limit` - Maximum requests
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `Retry-After` - Seconds until reset (on 429)

---

## Security Headers

### Implemented Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), ...
Strict-Transport-Security: max-age=31536000 (production)
Content-Security-Policy: [see below]
```

### Content Security Policy

Default CSP configuration:

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### Custom CSP

Modify `lib/security/headers.ts` to customize CSP for your needs.

---

## CORS Configuration

### Basic CORS

```typescript
import { handleCORS } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  let response = NextResponse.json(data);

  // Add CORS headers
  response = handleCORS(response, request);

  return response;
}
```

### Custom Origins

```typescript
const allowedOrigins = ["https://example.com", "https://app.example.com"];

response = handleCORS(response, request, allowedOrigins);
```

### Preflight Handling

OPTIONS requests are automatically handled:

```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

---

## Authentication Security

### Session Management

```typescript
// Middleware automatically:
- Validates sessions
- Refreshes tokens
- Sets secure cookies
```

### Protected Routes

```typescript
import { requireAuth } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  // User is authenticated
}
```

### Optional Auth

```typescript
import { optionalAuth } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const user = await optionalAuth(request);

  if (user) {
    // Personalized content
  } else {
    // Public content
  }
}
```

---

## Input Validation

### Email Validation

```typescript
import { validateEmail } from "@/lib/validation";

if (!validateEmail(email)) {
  return NextResponse.json({ error: "Invalid email" }, { status: 400 });
}
```

### Phone Validation

```typescript
import { validatePhone } from "@/lib/validation";

if (!validatePhone(phone)) {
  return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
}
```

### Zod Schemas

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const result = schema.safeParse(data);

if (!result.success) {
  return NextResponse.json({ errors: result.error.errors }, { status: 400 });
}
```

---

## API Security

### API Routes Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/middleware";
import { rateLimiters } from "@/lib/rate-limit";
import { apiSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const limitResponse = await rateLimiters.api(request);
  if (limitResponse) return limitResponse;

  // 2. Authentication
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  // 3. Validation
  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.errors }, { status: 400 });
  }

  // 4. Business logic
  const data = await processRequest(result.data);

  // 5. Response with security headers
  let response = NextResponse.json(data);
  response = apiSecurityHeaders(response);

  return response;
}
```

---

## Best Practices

### 1. Always Validate Input

```typescript
// ❌ Bad
const name = body.name;
await db.user.create({ name });

// ✅ Good
const schema = z.object({ name: z.string().min(1).max(100) });
const { name } = schema.parse(body);
await db.user.create({ name });
```

### 2. Rate Limit Sensitive Endpoints

```typescript
// ✅ Always rate limit:
- Authentication (/auth/*)
- Password reset
- OTP requests
- Payment endpoints
- Data export
```

### 3. Sanitize User Input

```typescript
import { sanitizeInput } from "@/lib/validation";

const cleanEmail = sanitizeInput(email); // Trim + lowercase
```

### 4. Use Secure Cookies

```typescript
// Automatically handled by Supabase middleware
// Cookies are:
- HttpOnly
- Secure (production)
- SameSite=Lax
- Path=/
```

### 5. Log Security Events

```typescript
import { logger } from "@/lib/monitoring/logger";

// Log auth events
logger.auth("signin.failed", undefined, { reason: "invalid_password" });

// Log rate limit hits
logger.warn("Rate limit exceeded", { ip: request.ip });

// Log suspicious activity
logger.error("Potential attack detected", null, { pattern: "sql_injection" });
```

---

## Security Checklist

### Pre-launch

- [ ] Enable rate limiting on all routes
- [ ] Implement input validation with Zod
- [ ] Configure CSP for your domains
- [ ] Set up Sentry error tracking
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure CORS for allowed origins
- [ ] Review security headers
- [ ] Test authentication flows
- [ ] Add logging for security events
- [ ] Set up monitoring alerts

### Post-launch

- [ ] Monitor error rates in Sentry
- [ ] Review rate limit logs
- [ ] Check for suspicious patterns
- [ ] Update dependencies regularly (Dependabot)
- [ ] Review security advisories
- [ ] Conduct security audits
- [ ] Rotate secrets periodically
- [ ] Monitor performance metrics

---

## Incident Response

### If Security Issue Detected

1. **Identify** - Determine scope of issue
2. **Contain** - Disable affected endpoints if needed
3. **Investigate** - Check logs and Sentry
4. **Fix** - Deploy hotfix
5. **Verify** - Test fix in production
6. **Notify** - Inform affected users if needed
7. **Document** - Post-mortem analysis

### Emergency Contacts

- Sentry: https://sentry.io
- GitHub Security: https://github.com/security
- Vercel Support: https://vercel.com/support

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Rate Limiting Guide](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)
