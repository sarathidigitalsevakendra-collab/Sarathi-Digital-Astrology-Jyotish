# Frontend UI Overview

The home experience is designed for Indian astrology seekers with a cosmic aesthetic, bilingual touch points, and culturally relevant imagery.

## Key Sections

- **Sticky Navigation**: Primary links to Consultations, Dashboard, Marketplace plus quick Sign-In and "Book Muhurat" CTA.
- **Hero Stack**: Gradient typography, live astrologer cards, and an Indian astrologer background image to set context.
- **Trust Indicators**: Metrics bar showcasing astrologers, cities, gemstone certifications, and muhurat alerts.
- **Horoscope Toggle**: Switch between Vedic (Hindi) and Western (English) zodiacs with React Query client data.
- **Feature Grid**: Cards outlining authenticity, regional language support, secure consultations, and energised marketplace.
- **Consultation CTA**: Highlight of chat/voice/video features and multilingual support with background photography.
- **Marketplace Preview**: Product gallery with energised imagery for gemstones, yantras, and puja kits.
- **Panchang Highlights**: Drik Panchang aligned Tithi/Nakshatra/Sunrise info with supporting visuals.
- **Testimonials**: Customer stories from various Indian cities.
- **Mobile App CTA**: Promotes Android availability and upcoming iOS release.
- **Footer**: Quick links and WhatsApp subscription form for muhurat alerts.

## Visual Style

- Tailwind-powered gradients, glassmorphism cards, and star-field overlay for cosmic feel.
- Palette inspired by deep blues, saffron gold, and rose hues to balance modern + traditional.
- Imagery sourced from Unsplash focusing on Indian cultural context.

## Data Flow & Integrations

- The Next.js API routes proxy to external microservices when available:
  - `ASTRO_CORE_URL` → `/horoscope/daily`, `/panchang/today` (falls back to in-repo mocks if offline).
  - `COMMERCE_SERVICE_URL` → `/products` (returns curated fallback catalog otherwise).
- Client components consume these endpoints via React Query (`@tanstack/react-query`) with loading states.
- Shared schemas live in `lib/api/*` and validate responses with Zod before rendering.
- `/api/horoscope/daily/interpretation` enriches deterministic FreeAstrology data with LLM narratives. The prompt builder injects planet positions, Panchang signals, tone/focus, and lucky indicators so OpenAI/Claude responses stay grounded in the upstream payload.

## Internationalisation

- Locale context drives English, Hindi, and Tamil copy defined in `components/providers/intl-provider.tsx`.
- `LocaleSwitcher` in the header syncs selection to `localStorage` and updates UI instantly.
- Hero and consultation CTAs pull from the same string map; extend the provider for more locales.

## Next Steps

- Replace placeholder mock data with real API responses (horoscope, Panchang, marketplace, astrologers).
- Localize copy for additional languages (e.g., Telugu, Marathi) by extending the provider’s string map.
- Add responsive testing for devices ≤360px width and fine-tune typography scales.
- Integrate analytics events for CTA interactions and subscription form.
