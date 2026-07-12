# Prisma Configuration Explained

## Why `/vercel/path0` Error Occurred

### The Problem

Prisma v7 introduced `prisma.config.ts` for configuration. During `postinstall`, Prisma CLI attempts to:

1. Locate `prisma.config.ts` in the project root
2. Load it as a TypeScript/JavaScript module
3. Use it to resolve database URLs and other settings

In Vercel's build environment:
- Build happens in `/vercel/path0` (temporary directory)
- TypeScript files aren't transpiled during `postinstall`
- Node.js can't directly execute `.ts` files
- Prisma fails to load the config → Build fails

### Why This Happens

```
Vercel Build Process:
1. npm install (runs postinstall)
2. postinstall: prisma generate
3. Prisma tries to load prisma.config.ts
4. TypeScript not transpiled yet → ERROR
5. Build fails before Next.js build even starts
```

## Prisma v7 Configuration Methods

### Method 1: Environment Variables (✅ Recommended)

**What we're using now:**

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

**Pros:**
- ✅ Works in all environments (local, Vercel, Docker)
- ✅ No TypeScript compilation needed
- ✅ Standard 12-factor app pattern
- ✅ Easy to configure per environment

**Cons:**
- ❌ Can't use `prisma db push` or `prisma migrate` without DATABASE_URL set

### Method 2: prisma.config.ts (❌ Not Vercel-Compatible)

```typescript
// prisma.config.ts (REMOVED)
import { defineConfig } from "prisma";

export default defineConfig({
  datasource: {
    url: () => process.env.DATABASE_URL || "",
  },
});
```

**Pros:**
- ✅ Centralized configuration
- ✅ TypeScript type safety

**Cons:**
- ❌ Breaks Vercel builds
- ❌ Requires TypeScript compilation
- ❌ Complex resolution logic

### Method 3: Schema URL (❌ Deprecated in v7)

```prisma
// prisma/schema.prisma (OLD WAY)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ Not allowed in v7
}
```

**Status**: Deprecated in Prisma v7

## Driver Adapters in Prisma v7

### What Are Driver Adapters?

Driver adapters allow Prisma to use custom database drivers instead of its built-in engine.

**Before (Prisma v4-v6):**
```
Prisma Client → Prisma Engine → Database
```

**After (Prisma v7 with adapters):**
```
Prisma Client → Driver Adapter (pg) → Database
```

### Benefits

1. **Smaller bundle size** - No need for Prisma's binary engine
2. **Edge runtime compatible** - Works in Cloudflare Workers, Vercel Edge
3. **Connection pooling** - Use existing pool libraries (pg, mysql2)
4. **Better performance** - Direct driver access

### Our Configuration

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma with adapter
const prisma = new PrismaClient({ adapter });
```

### Preview Feature

In Prisma v7, `driverAdapters` is **no longer a preview feature**:

```prisma
generator client {
  provider = "prisma-client-js"
  // previewFeatures = ["driverAdapters"]  // ❌ Not needed in v7
}
```

## Production-Safe package.json Scripts

### Current Configuration

```json
{
  "scripts": {
    "postinstall": "prisma generate --no-engine || echo 'Prisma generate skipped'",
    "vercel-build": "prisma generate && next build",
    "build": "next build"
  }
}
```

### Script Breakdown

#### `postinstall`

```bash
prisma generate --no-engine || echo 'Prisma generate skipped'
```

- Runs after `npm install`
- `--no-engine`: Skips downloading Prisma binary (not needed with adapters)
- `|| echo ...`: Fallback if Prisma fails (prevents build breakage)

#### `vercel-build`

```bash
prisma generate && next build
```

- Vercel automatically uses this script if it exists
- Ensures Prisma Client is generated before Next.js build
- No `--no-engine` flag here (full generation for build)

#### `build`

```bash
next build
```

- Standard Next.js build
- Used locally and in other CI/CD environments

## Vercel-Specific Considerations

### Build Command

In Vercel settings, use:
```
npm run vercel-build
```

This ensures:
1. Prisma Client is generated
2. Next.js build happens after
3. Proper error handling

### Environment Variables

Required in Vercel:
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...  # For migrations
```

### Build Output

Vercel expects:
- `.next/` directory (auto-detected)
- Prisma Client in `node_modules/@prisma/client`

## Migration Strategy

### Development

```bash
# Make schema changes
npx prisma db push

# Or use migrations
npx prisma migrate dev --name add_users_table
```

### Production (Vercel)

**Option 1: Manual migrations (Recommended)**
```bash
# Run locally or in CI/CD
npx prisma migrate deploy
```

**Option 2: Auto-push (Not recommended)**
```json
{
  "scripts": {
    "vercel-build": "prisma db push --accept-data-loss && next build"
  }
}
```

⚠️ **Warning**: `db push` in production can cause data loss!

## Troubleshooting

### Issue: Prisma Client not found

**Solution**: Ensure `postinstall` runs successfully
```bash
npm run postinstall
```

### Issue: Database connection fails

**Solution**: Check DATABASE_URL format
```env
# ✅ Correct (direct connection)
DATABASE_URL=postgresql://user:pass@host:5432/db

# ❌ Wrong (pooler with wrong auth)
DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true
```

### Issue: Build timeout on Vercel

**Solution**: Optimize postinstall
```json
{
  "postinstall": "prisma generate --no-engine"
}
```

## Best Practices

1. **Use environment variables** for all configuration
2. **Don't commit** `.env.local` or database credentials
3. **Use direct connection** (port 5432) for Supabase
4. **Test locally** before deploying
5. **Monitor build logs** in Vercel dashboard
6. **Use migrations** for schema changes in production

## References

- [Prisma v7 Upgrade Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Vercel Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
