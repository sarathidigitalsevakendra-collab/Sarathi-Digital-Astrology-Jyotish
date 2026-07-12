# API Reference

All endpoints are implemented as **Next.js 14 Route Handlers** — there are no separate microservices. Every route lives under `app/api/`.

---

## Astrology Routes (`/api/v1/astrology/`)

All astrology calculations are performed locally using the `vedic-astro` npm package. No external service calls.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/astrology/birth-chart` | Generate Kundli (birth chart) for given date/time/location |
| `POST` | `/api/v1/astrology/panchang` | Hindu almanac — Tithi, Nakshatra, Yoga, Karana |
| `POST` | `/api/v1/astrology/divisional-charts` | Varga charts (D1–D60) |
| `POST` | `/api/v1/astrology/transits` | Planetary transits (Gochar) for natal chart |
| `GET`  | `/api/v1/astrology/status` | Service health check |

### Birth Chart — Request Body

```typescript
{
  dateTime: string;    // ISO 8601, e.g. "1990-01-15T10:30:00+05:30"
  latitude: number;    // -90 to 90
  longitude: number;   // -180 to 180
  timezone: number;    // -12 to 14 (offset in hours, e.g. 5.5 for IST)
}
```

---

## Consultation Routes (`/api/consultations/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/consultations/create-order` | Create a Razorpay order for a booking |
| `POST` | `/api/consultations/verify-payment` | Verify Razorpay payment signature |
| `POST` | `/api/webhooks/razorpay` | Razorpay webhook (payment events) |

---

## User / Onboarding Routes (`/api/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` / `POST` | `/api/onboarding` | Read or save user profile (birth data, astrology system) |
| `GET` / `POST` | `/api/saved-charts` | List or save a birth chart |
| `PATCH` | `/api/saved-charts/[id]` | Toggle favourite, rename chart |

---

## Response Format

All endpoints return a consistent envelope:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human-readable description",
    "details": { ... }   // optional, Zod field errors etc.
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}
```

---

## Authentication

Protected routes require a valid **Supabase SSR session cookie**. The `withRouteHandler` middleware in `lib/api/route-handler.ts` handles auth validation. Unauthenticated requests receive `401 UNAUTHORIZED`.

---

## Rate Limiting

Per-user rate limits are applied server-side. Exceeding the limit returns `429 TOO_MANY_REQUESTS`.
