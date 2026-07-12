# Jyotishya • Vedic Astrology SaaS

A lightweight, single-app Vedic astrology platform for the Indian market featuring Kundli generation, Panchang, daily horoscopes, and compatibility matching.

## ✨ Features

- 🔐 **Authentication** - Supabase-powered auth with Google OAuth and OTP
- 🎯 **Kundli Generation** - Birth chart calculations using `vedic-astro` package
- 🌙 **Panchang** - Traditional Hindu almanac with tithi, nakshatra, yoga
- 📊 **Daily Horoscopes** - Personalized predictions based on sun signs
- 💬 **AI Astrologer** - Chat with an AI-powered astrology assistant
- 🌍 **Multi-language** - English, Hindi, Tamil support
- 📱 **Responsive** - Mobile-first design

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/infidevelopersofficial/jyotisya-astrology.git
cd jyotisya-astrology

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, database, and API credentials

# Generate Prisma client
npx prisma generate

# Run development server
yarn dev
```

The site boots at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENAI_API_KEY` | For AI astrologer feature (optional) |

See `.env.example` for the complete list.

## Project Structure

```
jyotishya-saas/
├── app/                    # Next.js 14 app router
│   ├── api/               # API routes
│   │   ├── astrology/     # Birth chart, compatibility endpoints
│   │   ├── horoscope/     # Daily predictions
│   │   ├── panchang/      # Hindu almanac
│   │   └── user/          # User kundlis
│   ├── dashboard/         # Protected user pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Card)
│   └── ...               # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and business logic
│   ├── astrology/        # Vedic calculations (vedic-engine.ts)
│   ├── supabase/         # Auth helpers
│   └── ...
├── prisma/                # Database schema
│   └── schema.prisma
├── _archived/             # Old monorepo components (reference only)
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

## Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn type-check   # TypeScript type checking
yarn test         # Run tests
yarn format       # Format code with Prettier
```

## Vercel Deployment

This app is configured for zero-config Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set root directory to `.` (root)
3. Framework preset: Next.js
4. Add environment variables in Vercel dashboard
5. Deploy!

### Vercel Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `.` |
| Build Command | `yarn build` |
| Install Command | `yarn install` |
| Node.js Version | 20.x |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Supabase Auth
- **Astrology**: vedic-astro npm package
- **Deployment**: Vercel

## License

MIT

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
# Sarathi-Digital-Astrology-Jyotish
