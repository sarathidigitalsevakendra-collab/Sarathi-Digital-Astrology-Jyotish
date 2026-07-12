# 🏗️ Architecture — Jyotishya Vedic Astrology SaaS

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL DEPLOYMENT                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 14 App Router (root)                 │  │
│  │                                                            │  │
│  │  Frontend:                                                │  │
│  │  ├─ React 18 + TypeScript                                │  │
│  │  ├─ Tailwind CSS                                          │  │
│  │  ├─ Supabase Auth (SSR)                                   │  │
│  │  └─ TanStack Query                                        │  │
│  │                                                            │  │
│  │  API Routes: /api/v1/astrology/*                         │  │
│  │  ├─ birth-chart/route.ts                                 │  │
│  │  ├─ panchang/route.ts                                    │  │
│  │  ├─ divisional-charts/route.ts                           │  │
│  │  ├─ transits/route.ts                                    │  │
│  │  └─ status/route.ts                                      │  │
│  │                                                            │  │
│  │  API Routes: /api/consultations/*                        │  │
│  │  ├─ create-order/route.ts                                │  │
│  │  ├─ verify-payment/route.ts                              │  │
│  │  └─ webhooks/razorpay/route.ts                           │  │
│  │                                                            │  │
│  │  Middleware:                                              │  │
│  │  ├─ withRouteHandler (error handling)                    │  │
│  │  ├─ Zod validation                                        │  │
│  │  └─ Supabase SSR session refresh                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
               ┌────────────────────────────┐
               │   DATA & AUTH              │
               │                            │
               │  ├─ PostgreSQL (Supabase)  │
               │  ├─ Prisma ORM             │
               │  └─ Supabase Auth (SSR)    │
               └────────────────────────────┘
```

---

## Request Flow

### Astrology Calculation Request

```
1. User submits birth data (date, time, lat/lng)
   ↓
2. Next.js API Route (/api/v1/astrology/birth-chart)
   ↓
3. withRouteHandler wrapper
   ├─ Generate request ID
   ├─ Validate with Zod
   └─ Start performance timer
   ↓
4. vedic-astro library (local npm package)
   ├─ Sidereal (Vedic) calculations with Lahiri ayanamsha
   ├─ Planetary positions, houses, nakshatras
   └─ No external service call
   ↓
5. Response Handler
   ├─ Format response
   ├─ Log request (duration, status)
   └─ Return JSON with request ID
   ↓
6. User receives response
   {
     "success": true,
     "data": { ... },
     "meta": {
       "requestId": "uuid",
       "timestamp": "..."
     }
   }
```

---

## Component Responsibilities

### 1. API Routes Layer

**Location**: `app/api/v1/astrology/`

**Responsibilities**:
- HTTP endpoint handling
- Request validation (Zod schemas)
- Response formatting
- Error handling

**Key Files**:
- `birth-chart/route.ts` — Birth chart calculations
- `panchang/route.ts` — Hindu almanac (Tithi, Nakshatra, Yoga)
- `divisional-charts/route.ts` — Varga charts (D1–D60)
- `transits/route.ts` — Planetary transits (Gochar)
- `status/route.ts` — Service health monitoring

### 2. Astrology Library

**Location**: `lib/astrology/`

**Responsibilities**:
- Wrapper around the `vedic-astro` npm package
- Chart data transformation (API → UI model)
- Pure calculation utilities (no side effects)

**Key Files**:
- `vedic-engine.ts` — Main calculation entry point
- `birthChartService.ts` — Birth chart business logic
- `birthChartTransformers.ts` — Data transformation

### 3. Payments Layer

**Location**: `lib/payments/`

**Responsibilities**:
- Razorpay order creation and verification
- Webhook signature validation
- Refund initiation

**Key Files**:
- `razorpay.ts` — Payment functions (type-safe)

### 4. Middleware & Utilities

**Location**: `lib/api/`

**Components**:
- `route-handler.ts` — Error handling wrapper
- `auth.ts` — Authentication helpers (Supabase session)

---

## Data Flow — Birth Chart Calculation

```
User Input:
{
  dateTime: "1990-01-15T10:30:00+05:30",
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5
}
  ↓
Validation (Zod):
  ✓ dateTime is ISO 8601
  ✓ latitude: -90 to 90
  ✓ longitude: -180 to 180
  ✓ timezone: -12 to 14
  ↓
vedic-astro calculation (local, no external call):
  ├─ Sidereal coordinates, Lahiri ayanamsha
  ├─ Ascendant & house calculations (Whole Sign)
  ├─ Nakshatras, signs, retrograde detection
  └─ Divisional charts (D1–D60)
  ↓
Response:
{
  ascendant: 285.4567,
  planets: [
    {
      name: "Sun",
      fullDegree: 301.23,
      sign: "Capricorn",
      nakshatra: "Uttara Ashadha",
      house: 3,
      isRetro: false
    },
    // ... 8 more planets
  ],
  houses: [ ... ]
}
```

---

## Error Handling Strategy

### Error Types

1. **Validation Errors (400)**
   - Invalid request body
   - Missing required fields
   - Out-of-range values

2. **Authentication Errors (401)**
   - Missing/invalid Supabase session token
   - Session expired

3. **Not Found (404)**
   - User profile not found
   - Chart not found

4. **Rate Limit Errors (429)**
   - User API quota exceeded

5. **Internal Errors (500)**
   - Calculation library error
   - Database query failure

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid birth date format",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-01-15T...",
    "requestId": "550e8400-..."
  }
}
```

---

## Performance Characteristics

### Latency Breakdown

**Vedic calculation (local library):**

```
Validation:    1-2ms
Calculation:   2-8ms (CPU)
DB query:      5-20ms (Supabase)
─────────────────────
Total:         8-30ms ⚡
```

### Caching Strategy

**Current:**
- In-memory cache (Map-based, 24hr TTL for birth charts)
- Supabase stores saved charts per user

**Future:**
- Redis distributed cache for high-traffic calculations

---

## Monitoring & Observability

### Metrics Collected

1. **Request Metrics** — count, p50/p95 response time, error rate
2. **Error Tracking** — Sentry (see `docs/MONITORING.md`)
3. **Structured Logging** — JSON format, request ID in every log line

### Log Format

```json
{
  "requestId": "uuid",
  "method": "POST",
  "path": "/api/v1/astrology/birth-chart",
  "status": 200,
  "duration": "12ms",
  "userId": "supabase-user-id"
}
```

---

## Security

- Supabase session-based auth (JWT, SSR)
- Zod request validation on all API routes
- Rate limiting per user
- CORS configured via `next.config.js`
- No sensitive data in logs
- All secrets via Vercel environment variables

---

## Deployment Architecture

### Development

```
Local Machine
├─ Next.js (localhost:3000)
└─ PostgreSQL (Supabase cloud)
```

### Production

```
Vercel (Next.js)
├─ Edge Network (CDN)
├─ Serverless Functions (10s timeout)
└─ Environment Variables

Supabase (Database + Auth)
├─ PostgreSQL
├─ Auth Service (SSR)
└─ Row-Level Security (RLS)
```

---

## Future Enhancements

- **Redis caching** — Distributed cache for calculation results
- **Server-side SVG rendering** — Kundli chart images
- **AI Interpretations** — OpenAI streaming for chart readings
- **PDF Export Phase 3** — Server-side generation (see `docs/pdf/PDF_EXPORT_PHASE2_PLAN.md`)

---

**Last Updated**: 2026-07-12
**Version**: 2.0 (Single Next.js 14 app — monorepo removed)
**Status**: Production ✅
