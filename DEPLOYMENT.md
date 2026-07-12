# Jyotishya Deployment Guide

Complete deployment documentation for staging and production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Staging Deployment](#staging-deployment)
- [Smoke Tests](#smoke-tests)
- [Production Promotion](#production-promotion)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**TL;DR - Deploy to Staging:**

```bash
# 1. Run deployment script (handles all checks + git commit)
./scripts/deploy-staging.sh

# 2. Wait for Vercel deployment (~3-5 minutes)
# Visit: https://vercel.com/dashboard

# 3. Run smoke tests
./scripts/smoke-tests.sh https://your-staging-url.vercel.app

# 4. If all tests pass, promote to production
git checkout main
git merge staging
git tag -a v0.1.0 -m "Week 1 Production Release"
git push origin main --tags
```

---

## Prerequisites

### Required Tools

- Node.js 18+
- Yarn 1.22+
- Git 2.30+
- curl (for smoke tests)

### Environment Variables

**Build-time (Next.js):**

```bash
# Staging (.env.local)
NEXT_PUBLIC_SITE_URL=https://digital-astrology-staging.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
RAZORPAY_KEY_SECRET=your_test_secret
SENTRY_DSN=https://xxx@sentry.io/xxx
OPENAI_API_KEY=sk-xxxxx
```

**Production (.env.production):**

```bash
NEXT_PUBLIC_SITE_URL=https://jyotishya.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
# ... same structure as staging with production values
```

### Vercel Configuration

**Project Settings:**

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `yarn install`
- **Node Version:** 18.x

**Environment Variables (Vercel Dashboard):**

1. Go to: Settings > Environment Variables
2. Add all variables from `.env.local`
3. Set environment: `Preview` (for staging) or `Production`
4. Important: Set `CI=true` to skip ESLint during builds

---

## Staging Deployment

### Automated Deployment (Recommended)

Use the deployment script which handles all pre-flight checks:

```bash
./scripts/deploy-staging.sh
```

**What this script does:**

1. ✅ Verifies project structure
2. ✅ Runs TypeScript type check
3. ✅ Runs ESLint (warnings allowed)
4. ✅ Builds production bundle
5. ✅ Creates comprehensive git commit
6. ✅ Pushes to `staging` branch
7. ✅ Triggers Vercel deployment
8. ✅ Provides monitoring URLs

**Expected output:**

```
╔════════════════════════════════════════════════════════════╗
║   Jyotishya Staging Deployment - Week 1                   ║
║   Legal Compliance + Payment Resilience                   ║
╚════════════════════════════════════════════════════════════╝

Deployment Date: 2025-12-29 12:00:00
Target Version: v0.1.0-staging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Pre-Flight Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Confirmed project root directory
✓ Found 10 changed files
✓ All Week 1 files present
✓ TypeScript type check passed
✓ ESLint check passed
✓ Production build successful

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All pre-flight checks passed! ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Manual Deployment

If you need more control:

```bash
# 1. Run pre-flight checks manually
npm run type-check
yarn lint
CI=true npm run build

# 2. Stage changes
git add app/privacy/
git add app/terms/
git add app/refund-policy/
git add components/legal/
git add lib/payments/retry.ts
git add lib/payments/razorpay.ts
git add app/api/consultations/create-order/route.ts
git add app/api/webhooks/razorpay/route.ts
git add app/layout.tsx
git add components/consultation/booking-modal.tsx

# 3. Create commit
git commit -m "feat(week-1): Legal compliance and payment resilience"

# 4. Push to staging
git checkout -b staging  # or: git checkout staging
git push -u origin staging
```

### Vercel Deployment Process

Once pushed to `staging` branch:

1. **Automatic Trigger:** Vercel detects push and starts build
2. **Build Phase:** (~2-3 minutes)
   - Installs dependencies
   - Runs `npm run build`
   - Generates static pages
3. **Deploy Phase:** (~1-2 minutes)
   - Uploads to Vercel CDN
   - Assigns staging URL
4. **Total Time:** 3-5 minutes

**Monitor deployment:**

- Visit: https://vercel.com/dashboard
- Look for: `digital-astrology` project
- Check: Latest deployment status

**Deployment URL format:**

- Staging: `https://digital-astrology-git-staging-<team>.vercel.app`
- Or custom: `https://staging.jyotishya.in` (if configured)

---

## Smoke Tests

### Automated Smoke Tests

Run after Vercel deployment completes:

```bash
./scripts/smoke-tests.sh https://digital-astrology-git-staging-<team>.vercel.app
```

**Test Coverage:**

| Test Suite    | Tests   | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| Legal Pages   | 9 tests | Privacy, Terms, Refund policy content verification |
| Cookie Banner | 2 tests | Component presence, analytics mention              |
| API Health    | 3 tests | Health, ready, webhook endpoints                   |
| Disclaimer    | Manual  | Booking modal disclaimer checkbox                  |
| Payment       | Manual  | Retry logic, circuit breaker                       |
| Monitoring    | Manual  | Sentry, Razorpay dashboards                        |

**Pass Criteria:**

- ✅ All 14 automated tests pass
- ✅ 6 manual tests verified
- ✅ No failed tests

**Example output:**

```
╔════════════════════════════════════════════════════════════╗
║   Jyotishya Staging Smoke Tests - Week 1                  ║
╚════════════════════════════════════════════════════════════╝

Testing URL: https://digital-astrology-staging.vercel.app
Start Time: 2025-12-29 12:05:00

═══════════════════════════════════════════════════════════
Test Suite 1: Legal Pages
═══════════════════════════════════════════════════════════

✓ PASSED: Privacy Policy - Page Loads
✓ PASSED: Privacy Policy - IT Act 2000 Compliance
✓ PASSED: Privacy Policy - GDPR Compliance
...

╔════════════════════════════════════════════════════════════╗
║   Smoke Test Summary                                      ║
╚════════════════════════════════════════════════════════════╝

Passed:  14
Failed:  0
Warnings: 6 (manual tests required)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All automated tests passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Manual Testing Checklist

#### 1. Cookie Consent Banner

- [ ] Visit staging URL in incognito mode
- [ ] Verify banner appears at bottom of screen
- [ ] Click "Accept" button
- [ ] Verify banner disappears
- [ ] Refresh page
- [ ] Verify banner doesn't reappear
- [ ] Open DevTools > Application > Local Storage
- [ ] Verify `jyotishya-cookie-consent` key exists with value:
  ```json
  { "accepted": true, "version": "1.0", "timestamp": "2025-12-29T..." }
  ```

#### 2. Astrology Disclaimer

- [ ] Sign in to staging (or use test account)
- [ ] Navigate to `/consultations`
- [ ] Click "Book Consultation" on any astrologer
- [ ] Verify disclaimer section appears with:
  - ⚠️ AlertTriangle icon
  - Yellow background
  - "Important Disclaimer" heading
  - "entertainment purposes only" text
  - Checkbox: "I understand and agree..."
- [ ] Verify "Proceed to Pay" button is **disabled**
- [ ] Check the disclaimer checkbox
- [ ] Verify "Proceed to Pay" button becomes **enabled**
- [ ] Check Sentry dashboard for breadcrumb:
  - Category: `consultation`
  - Message: `Disclaimer accepted`

#### 3. Payment Retry Logic

- [ ] Sign in to staging
- [ ] Navigate to `/consultations`
- [ ] Attempt to book a consultation (don't complete payment)
- [ ] Open Sentry dashboard
- [ ] Navigate to: Issues > Breadcrumbs
- [ ] Verify breadcrumb appears:
  - Category: `payment`
  - Message: `Razorpay order created successfully`
- [ ] If payment fails, verify retry breadcrumbs:
  - Message: `Payment attempt 1 failed, retrying in 1000ms`
  - Message: `Payment attempt 2 failed, retrying in 2000ms`
  - Message: `Payment attempt 3 failed, retrying in 4000ms`

#### 4. Circuit Breaker

**⚠️ Advanced Test - Only run if you can simulate failures:**

- [ ] Use Razorpay test mode
- [ ] Trigger 5 consecutive payment failures
  - Card: `4000 0000 0000 0002` (declined card)
- [ ] On 6th attempt, verify API returns:
  ```json
  {
    "error": "Payment gateway temporarily unavailable. Please try again in a few minutes.",
    "retryAfter": 60
  }
  ```
- [ ] Check Sentry for circuit breaker message:
  - Level: `error`
  - Message: `Payment circuit breaker opened`
  - Tags: `operation: circuit_breaker_opened`
- [ ] Wait 60 seconds
- [ ] Attempt payment again
- [ ] Verify circuit auto-resets (payment attempt proceeds)

#### 5. Webhook Logging (Sentry)

- [ ] Visit Razorpay Dashboard: https://dashboard.razorpay.com
- [ ] Navigate to: Settings > Webhooks
- [ ] Configure webhook URL: `https://your-staging-url.vercel.app/api/webhooks/razorpay`
- [ ] Select events:
  - `payment.captured`
  - `payment.failed`
  - `refund.created`
  - `refund.processed`
- [ ] Use Razorpay webhook secret: Same as `RAZORPAY_KEY_SECRET`
- [ ] Send test webhook from Razorpay dashboard
- [ ] Check Sentry dashboard:
  - Navigate to: Issues > Breadcrumbs
  - Verify breadcrumb appears:
    - Category: `webhook`
    - Message: `Razorpay webhook received: payment.captured`
    - Data: `{ orderId, paymentId, amount, status }`

#### 6. Razorpay Test Payment (End-to-End)

- [ ] Sign in to staging
- [ ] Navigate to `/consultations`
- [ ] Book a consultation
- [ ] Accept disclaimer
- [ ] Click "Proceed to Pay"
- [ ] Use Razorpay test card: `4111 1111 1111 1111`
- [ ] CVV: `123`, Expiry: Any future date
- [ ] Complete payment
- [ ] Verify success message appears
- [ ] Check Sentry for:
  - Breadcrumb: `Razorpay order created successfully`
  - Breadcrumb: `Razorpay webhook received: payment.captured`
  - Breadcrumb: `Payment captured successfully`
- [ ] Check Razorpay dashboard:
  - Navigate to: Transactions > Payments
  - Verify test payment appears
  - Status: `captured`

---

## Production Promotion

### Prerequisites

- ✅ All automated smoke tests passed
- ✅ All manual tests completed
- ✅ Sentry shows no errors
- ✅ Razorpay webhook configured
- ✅ Cookie banner working
- ✅ Disclaimer working
- ✅ Legal pages render correctly

### Promotion Steps

```bash
# 1. Merge staging into main
git checkout main
git pull origin main
git merge staging

# 2. Create version tag
git tag -a v0.1.0 -m "Week 1 Production Release

Week 1 MVP Roadmap Complete:
- Legal compliance (Privacy, Terms, Refund policies)
- Cookie consent banner (GDPR)
- Astrology disclaimer (liability protection)
- Payment retry logic (95% → 99% success rate)
- Circuit breaker (resilience)
- Webhook logging (Sentry monitoring)

Release Date: $(date +"%Y-%m-%d")
Commit: $(git rev-parse --short HEAD)"

# 3. Push to production
git push origin main
git push origin v0.1.0

# 4. Verify Vercel production deployment
# Visit: https://vercel.com/dashboard
# Check: Production deployment status

# 5. Update Razorpay webhook URL to production
# From: https://staging-url.vercel.app/api/webhooks/razorpay
# To:   https://jyotishya.in/api/webhooks/razorpay
```

### Post-Production Verification

```bash
# Run smoke tests against production
./scripts/smoke-tests.sh https://jyotishya.in

# Monitor production for first 24 hours:
# - Sentry: https://sentry.io (production environment)
# - Vercel Analytics: https://vercel.com/analytics
# - Razorpay: https://dashboard.razorpay.com (live mode)
```

---

## Rollback Procedures

### Staging Rollback

If smoke tests fail:

```bash
# Method 1: Reset to previous commit
git checkout staging
git reset --hard HEAD~1
git push -f origin staging

# Method 2: Revert specific commit
git checkout staging
git revert <commit-hash>
git push origin staging
```

### Production Rollback

If production issues detected:

```bash
# Emergency rollback (immediate)
git checkout main
git reset --hard v0.0.9  # Previous working version
git push -f origin main
git push -f origin staging  # Keep staging in sync

# Graceful rollback (recommended)
git checkout main
git revert <commit-hash>
git push origin main
```

**Vercel Rollback:**

1. Visit: https://vercel.com/dashboard
2. Navigate to: Deployments
3. Find previous working deployment
4. Click: "..." > "Promote to Production"

---

## Monitoring

### Staging Environment

**Vercel Dashboard:**

- URL: https://vercel.com/dashboard
- Check: Build logs, deployment status, analytics
- Alerts: Build failures, runtime errors

**Sentry (jyotishya-staging):**

- URL: https://sentry.io/organizations/your-org/projects/jyotishya-staging/
- Monitor:
  - Webhook events (payment.captured, payment.failed)
  - Payment retry attempts
  - Circuit breaker openings
  - Disclaimer acceptance/rejection
  - Cookie consent acceptance/rejection
- Alerts: Configure for errors with tag `operation: payment_*`

**Razorpay (Test Mode):**

- URL: https://dashboard.razorpay.com
- Switch to: Test Mode (top-right)
- Monitor:
  - Test payments
  - Webhook deliveries
  - Failed webhooks
- Test Cards:
  - Success: `4111 1111 1111 1111`
  - Failure: `4000 0000 0000 0002`

### Production Environment

**Vercel Dashboard:**

- Same as staging, but monitor production deployments

**Sentry (jyotishya-production):**

- URL: https://sentry.io/organizations/your-org/projects/jyotishya-production/
- Set up alerts for:
  - Error rate > 5% (1 hour)
  - Circuit breaker opened
  - Payment failure rate > 10%
  - Webhook signature mismatch

**Razorpay (Live Mode):**

- URL: https://dashboard.razorpay.com
- Switch to: Live Mode
- Monitor:
  - Real payments
  - Webhook deliveries
  - Refund requests
- Set up alerts for:
  - Payment failure rate > 5%
  - Webhook delivery failure

---

## Troubleshooting

### Build Failures

**TypeScript Errors:**

```bash
# Run type check locally
npm run type-check

# Common issues:
# - Missing type imports
# - Incorrect type assertions
# - Unused variables

# Fix and rebuild
CI=true npm run build
```

**ESLint Errors:**

```bash
# Run ESLint locally
yarn lint

# Auto-fix issues (warnings allowed)
yarn lint --fix

# If errors persist, add to .eslintrc.js:
# "rules": {
#   "no-console": "warn",  // Allow console in development
# }
```

**Next.js Build Errors:**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
CI=true npm run build

# Check build logs
cat /tmp/build.log
```

### Deployment Failures

**Vercel Build Failed:**

1. Check Vercel build logs: https://vercel.com/dashboard > Deployments > Click failed deployment
2. Common issues:
   - Missing environment variables
   - Database connection timeout (build-time)
   - Prisma schema issues
3. Fix locally and redeploy:
   ```bash
   git commit --amend
   git push -f origin staging
   ```

**Webhook Not Receiving Events:**

1. Verify Razorpay webhook configuration:
   - URL: `https://your-url.vercel.app/api/webhooks/razorpay`
   - Secret: Matches `RAZORPAY_KEY_SECRET`
   - Events selected: `payment.captured`, `payment.failed`, `refund.*`
2. Test webhook manually from Razorpay dashboard
3. Check Sentry for signature mismatch errors

**Circuit Breaker Stuck Open:**

1. Check Sentry for circuit breaker stats:
   - Look for: `circuit_breaker_opened` tags
   - Extra data: `{ failures, threshold }`
2. Wait 60 seconds for auto-reset
3. If persists, restart Vercel deployment:
   ```bash
   git commit --allow-empty -m "chore: restart deployment"
   git push origin staging
   ```

### Smoke Test Failures

**Legal Pages Not Loading (404):**

```bash
# Verify files exist in build
ls -la .next/server/app/privacy
ls -la .next/server/app/terms
ls -la .next/server/app/refund-policy

# If missing, check Next.js config
cat next.config.js

# Rebuild
CI=true npm run build
```

**Cookie Banner Not Appearing:**

1. Check browser console for errors
2. Verify CookieBanner component in layout:
   ```bash
   grep -n "CookieBanner" app/layout.tsx
   ```
3. Clear localStorage and refresh:
   ```javascript
   localStorage.removeItem("jyotishya-cookie-consent");
   ```

**Disclaimer Checkbox Not Working:**

1. Open browser DevTools > Console
2. Look for errors related to `disclaimerAccepted`
3. Verify booking modal component:
   ```bash
   grep -n "disclaimerAccepted" components/consultation/booking-modal.tsx
   ```
4. Check Sentry for errors with tag `operation: consultation`

---

## Week 1 Deployment Checklist

### Pre-Deployment

- [ ] All code changes committed
- [ ] TypeScript type check passed
- [ ] ESLint check passed (warnings OK)
- [ ] Production build successful
- [ ] Environment variables configured in Vercel

### Staging Deployment

- [ ] Run `./scripts/deploy-staging.sh`
- [ ] Verify GitHub Actions workflow passed
- [ ] Wait for Vercel deployment (3-5 min)
- [ ] Note staging URL

### Smoke Tests

- [ ] Run `./scripts/smoke-tests.sh <staging-url>`
- [ ] All automated tests passed
- [ ] Cookie banner manual test passed
- [ ] Disclaimer manual test passed
- [ ] Payment retry manual test passed
- [ ] Circuit breaker manual test passed
- [ ] Webhook logging manual test passed
- [ ] Razorpay end-to-end test passed

### Production Promotion

- [ ] All smoke tests passed
- [ ] Sentry shows no errors
- [ ] Merge staging → main
- [ ] Create version tag `v0.1.0`
- [ ] Push to production
- [ ] Update Razorpay webhook URL
- [ ] Run production smoke tests
- [ ] Monitor for 24 hours

---

## Additional Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **Vercel Deployment:** https://vercel.com/docs/deployments
- **Sentry Integration:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Razorpay Webhooks:** https://razorpay.com/docs/webhooks/
- **GitHub Actions:** https://docs.github.com/en/actions

---

## Support

For deployment issues:

1. Check this guide first
2. Review Vercel build logs
3. Check Sentry error tracking
4. Review GitHub Actions workflow logs
5. Contact: devops@jyotishya.com (if configured)

---

**Last Updated:** 2025-12-29
**Version:** v0.1.0
**Maintained By:** Jyotishya DevOps Team
