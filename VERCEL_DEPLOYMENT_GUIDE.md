# Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Supabase Database**: Your PostgreSQL database (already configured)

## Deployment Steps

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Choose the `main` branch

### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (leave as root) |
| **Build Command** | `npm run vercel-build` |
| **Output Directory** | `.next` (auto-detected) |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x |

### 4. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://postgres.htdjnuzcjyghzhupxelc:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

DIRECT_URL=postgresql://postgres.htdjnuzcjyghzhupxelc:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://htdjnuzcjyghzhupxelc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XGiXS6lPawaO8sPpslvVhw_PI68523R

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Optional Variables

```env
# AI Features (Optional)
OPENAI_API_KEY=sk-...
INTERPRETATION_PROVIDER=openai

# Astrology API (Optional)
FREE_ASTROLOGY_API_KEY=your_key
JYOTISH_API_KEY=your_key

# Payments (Optional)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...

# Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=...

# Email (Optional)
RESEND_API_KEY=re_...
```

### 5. Deploy

Click **"Deploy"** and wait for the build to complete.

## Troubleshooting

### Build Fails with Prisma Error

**Error**: `Failed to load config file '/vercel/path0'`

**Solution**: Already fixed! The `vercel-build` script handles Prisma generation correctly.

### Database Connection Fails

**Error**: `password authentication failed`

**Solutions**:
1. Verify DATABASE_URL password is correct
2. Use **direct connection** (port 5432) not pooler (port 6543)
3. Check Supabase → Settings → Database for correct credentials

### Environment Variables Not Loading

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Ensure all variables are set for **Production** environment
3. Redeploy after adding variables

### Build Timeout

**Solution**:
1. Vercel Pro plan has longer build times
2. Check if `postinstall` script is hanging
3. Review build logs for specific errors

## Post-Deployment

### 1. Verify Deployment

Visit your deployment URL and check:
- ✅ Homepage loads
- ✅ Database queries work
- ✅ Authentication works
- ✅ No console errors

### 2. Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 3. Enable Analytics (Optional)

1. Go to Vercel Dashboard → Analytics
2. Enable Web Analytics
3. Enable Speed Insights

## Continuous Deployment

Every push to `main` will automatically trigger a Vercel production deployment.

### Preview Deployments

- Every pull request gets a preview URL
- Test changes before merging to main

### Production Deployments

- Merge to `main` for production deployment

## Database Migrations

To run migrations in production:

```bash
# Local: Push schema changes
npx prisma db push

# Or use migrations
npx prisma migrate dev --name your_migration_name
npx prisma migrate deploy  # In production
```

**Note**: With driver adapters, migrations should be run locally or via CI/CD, not in Vercel build.

## Monitoring

### Logs

View real-time logs:
- Vercel Dashboard → Deployments → [Your Deployment] → Logs

### Errors

Monitor errors with Sentry (if configured):
- Check `NEXT_PUBLIC_SENTRY_DSN` is set
- View errors at sentry.io

## Security Checklist

- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Database password is strong
- [ ] Supabase RLS policies are enabled
- [ ] CORS is properly configured

## Performance Optimization

1. **Enable Edge Functions** (if needed)
2. **Configure Caching** in `next.config.js`
3. **Use ISR** for static pages
4. **Enable Image Optimization**

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
