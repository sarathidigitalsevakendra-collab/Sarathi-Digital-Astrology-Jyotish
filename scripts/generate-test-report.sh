#!/bin/bash

################################################################################
# Jyotishya Staging Test Report Generator
#
# Generates a comprehensive test report documenting all Week 1 features
# verified in staging, issues found, and pass/fail status.
#
# Usage: ./scripts/generate-test-report.sh <staging-url> <output-file>
# Example: ./scripts/generate-test-report.sh https://staging.vercel.app report.md
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Arguments
STAGING_URL="${1:-}"
OUTPUT_FILE="${2:-staging-test-report.md}"

if [ -z "$STAGING_URL" ]; then
    echo -e "${RED}❌ Error: Staging URL required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/generate-test-report.sh <staging-url> [output-file]${NC}"
    exit 1
fi

# Remove trailing slash
STAGING_URL="${STAGING_URL%/}"

# Report metadata
TEST_DATE=$(date +"%Y-%m-%d %H:%M:%S")
TESTER=$(git config user.name || echo "Unknown")
COMMIT_HASH=$(git rev-parse --short HEAD)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Generating Staging Test Report                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Staging URL: ${STAGING_URL}${NC}"
echo -e "${YELLOW}Output File: ${OUTPUT_FILE}${NC}"
echo -e "${YELLOW}Test Date: ${TEST_DATE}${NC}"
echo ""

# Generate report
cat > "$OUTPUT_FILE" << EOF
# Jyotishya Week 1 Staging Test Report

**Test Date:** ${TEST_DATE}
**Tester:** ${TESTER}
**Staging URL:** ${STAGING_URL}
**Commit Hash:** ${COMMIT_HASH}
**Version:** v0.1.0-staging

---

## Executive Summary

This report documents the comprehensive testing of Week 1 MVP deliverables deployed to the staging environment. All features related to legal compliance, payment resilience, and monitoring have been verified.

### Overall Status

| Category | Status | Tests Passed | Tests Failed |
|----------|--------|--------------|--------------|
| Legal Pages | ⏳ Pending | 0/9 | 0/9 |
| Cookie Consent | ⏳ Pending | 0/2 | 0/2 |
| API Health | ⏳ Pending | 0/3 | 0/3 |
| Astrology Disclaimer | ⏳ Pending | 0/1 | 0/1 |
| Payment Resilience | ⏳ Pending | 0/2 | 0/2 |
| Monitoring | ⏳ Pending | 0/3 | 0/3 |
| **Total** | **⏳ Pending** | **0/20** | **0/20** |

**Recommendation:** ⏳ Testing in progress

---

## Test Results

### 1. Legal Pages (9 tests)

#### 1.1 Privacy Policy

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| LP-001 | Privacy page loads (HTTP 200) | ⏳ Pending | URL: ${STAGING_URL}/privacy |
| LP-002 | IT Act 2000 compliance text present | ⏳ Pending | Search: "IT Act 2000" |
| LP-003 | GDPR compliance text present | ⏳ Pending | Search: "GDPR" |
| LP-004 | Grievance officer section present | ⏳ Pending | Search: "Grievance Redressal Officer" |

**Result:** ⏳ 0/4 passed

#### 1.2 Terms of Service

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| LP-005 | Terms page loads (HTTP 200) | ⏳ Pending | URL: ${STAGING_URL}/terms |
| LP-006 | Entertainment disclaimer present | ⏳ Pending | Search: "entertainment and self-reflection purposes only" |
| LP-007 | Subscription pricing present | ⏳ Pending | Search: "₹49" |

**Result:** ⏳ 0/3 passed

#### 1.3 Refund Policy

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| LP-008 | Refund page loads (HTTP 200) | ⏳ Pending | URL: ${STAGING_URL}/refund-policy |
| LP-009 | 7-day guarantee present | ⏳ Pending | Search: "7-Day Money-Back Guarantee" |

**Result:** ⏳ 0/2 passed

---

### 2. Cookie Consent Banner (2 tests)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| CB-001 | Cookie banner component present | ⏳ Pending | Search: "cookie" in homepage HTML |
| CB-002 | Analytics consent mentioned | ⏳ Pending | Search: "analytics" in banner |
| CB-003 | Banner appears on first visit | ⏳ Pending | **Manual test** - Open in incognito |
| CB-004 | localStorage persistence works | ⏳ Pending | **Manual test** - Check localStorage key |

**Result:** ⏳ 0/4 passed

---

### 3. API Health Checks (3 tests)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| API-001 | /api/health returns 200 | ⏳ Pending | Health check endpoint |
| API-002 | /api/ready returns 200 | ⏳ Pending | Readiness probe |
| API-003 | Webhook rejects unauthenticated requests | ⏳ Pending | Expect 400/401 |

**Result:** ⏳ 0/3 passed

---

### 4. Astrology Disclaimer (1 test)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| AD-001 | Disclaimer checkbox appears in booking modal | ⏳ Pending | **Manual test** - Navigate to /consultations |
| AD-002 | Payment button disabled until checkbox checked | ⏳ Pending | **Manual test** - Verify button state |
| AD-003 | Sentry logs disclaimer acceptance | ⏳ Pending | **Manual test** - Check Sentry breadcrumbs |

**Result:** ⏳ 0/3 passed

---

### 5. Payment Resilience (2 tests)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| PR-001 | Retry logic handles network failures | ⏳ Pending | **Manual test** - Check Sentry for retry breadcrumbs |
| PR-002 | Circuit breaker opens after 5 failures | ⏳ Pending | **Manual test** - Simulate 5 failures |
| PR-003 | Circuit breaker auto-resets after 60s | ⏳ Pending | **Manual test** - Wait 60s after opening |

**Result:** ⏳ 0/3 passed

---

### 6. Monitoring & Observability (3 tests)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| MO-001 | Sentry receives webhook logs | ⏳ Pending | **Manual test** - Send test webhook from Razorpay |
| MO-002 | Payment breadcrumbs appear in Sentry | ⏳ Pending | **Manual test** - Complete test payment |
| MO-003 | Razorpay webhook endpoint configured | ⏳ Pending | **Manual test** - Check Razorpay dashboard |

**Result:** ⏳ 0/3 passed

---

## Issues Found

### Critical Issues (Blocking Production)
> None found yet. Will be updated after testing.

### High Priority Issues (Should fix before production)
> None found yet. Will be updated after testing.

### Medium Priority Issues (Can be addressed post-launch)
> None found yet. Will be updated after testing.

### Low Priority Issues (Nice to have)
> None found yet. Will be updated after testing.

---

## Monitoring Dashboard URLs

### Staging Environment

**Vercel Dashboard:**
- URL: https://vercel.com/dashboard
- Project: digital-astrology
- Branch: staging
- Status: Check deployment logs

**Sentry (Staging):**
- URL: https://sentry.io
- Project: jyotishya-staging
- Environment: staging
- Check for:
  - Webhook events (category: \`webhook\`)
  - Payment events (category: \`payment\`)
  - Disclaimer events (category: \`consultation\`)
  - Cookie consent events (category: \`cookie_consent\`)

**Razorpay (Test Mode):**
- URL: https://dashboard.razorpay.com
- Mode: Test Mode (top-right toggle)
- Webhook URL: ${STAGING_URL}/api/webhooks/razorpay
- Webhook Secret: [Check environment variables]
- Test Cards:
  - Success: 4111 1111 1111 1111
  - Decline: 4000 0000 0000 0002

---

## Rollback Procedures

### If Critical Issues Found

**Immediate Rollback (Staging):**
\`\`\`bash
git checkout staging
git reset --hard HEAD~1
git push -f origin staging
\`\`\`

**Vercel Rollback:**
1. Visit: https://vercel.com/dashboard
2. Go to: Deployments
3. Find: Previous working deployment
4. Click: "..." > "Promote to Production"

**Notify Team:**
- Document issues in this report
- Do NOT promote to production
- Fix issues locally
- Re-run deployment script
- Re-run smoke tests

---

## Production Promotion Readiness

### Pre-Promotion Checklist

- [ ] All automated tests passed (20/20)
- [ ] All manual tests completed
- [ ] No critical or high-priority issues
- [ ] Sentry shows no errors in last 24 hours
- [ ] Razorpay webhook tested successfully
- [ ] Legal pages reviewed by legal team (if applicable)
- [ ] Cookie consent GDPR compliant
- [ ] Disclaimer legally sufficient
- [ ] Payment retry logic verified
- [ ] Circuit breaker tested

### Promotion Commands

\`\`\`bash
# 1. Merge staging → main
git checkout main
git merge staging

# 2. Create version tag
git tag -a v0.1.0 -m "Week 1 Production Release"

# 3. Push to production
git push origin main --tags

# 4. Update Razorpay webhook URL
# From: ${STAGING_URL}/api/webhooks/razorpay
# To: https://jyotishya.in/api/webhooks/razorpay

# 5. Run production smoke tests
./scripts/smoke-tests.sh https://jyotishya.in
\`\`\`

---

## Appendix

### Test Environment Details

**Staging URL:** ${STAGING_URL}
**Node Version:** $(node -v)
**Yarn Version:** $(yarn -v)
**OS:** $(uname -s)
**Browser:** Chrome/Safari (for manual tests)

### Test Data Used

**Test User:**
- Email: test@jyotishya.com
- Phone: +91 9876543210
- Birth Date: 1990-01-01
- Birth Time: 12:00 PM
- Birth Place: Mumbai, India

**Test Astrologer:**
- ID: [To be filled]
- Name: [To be filled]
- Hourly Rate: ₹500

**Test Payment:**
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: 12/25
- Expected Amount: Based on consultation duration

---

## Recommendations

### Before Production Launch

1. **Legal Review:** Have legal team review:
   - Privacy policy (IT Act 2000 compliance)
   - Terms of service (liability limitations)
   - Refund policy (consumer protection compliance)
   - Astrology disclaimer (entertainment only)

2. **Security Audit:**
   - Verify webhook signature validation
   - Test circuit breaker under load
   - Verify Sentry doesn't log sensitive data (PII, card numbers)

3. **Performance Testing:**
   - Load test payment endpoint
   - Verify retry logic under high load
   - Test circuit breaker recovery

4. **Documentation:**
   - Update README with deployment instructions
   - Document rollback procedures for team
   - Create runbook for common issues

---

**Report Generated:** ${TEST_DATE}
**Report Version:** 1.0
**Next Review:** After manual tests completion

---

## Sign-Off

**Tested By:** ${TESTER}
**Reviewed By:** ___________________ (DevOps Lead)
**Approved By:** ___________________ (Product Owner)

**Production Promotion:** ⏳ Pending test completion

---

_This is an auto-generated report template. Fill in test results by running smoke tests._
EOF

echo -e "${GREEN}✓ Test report template generated: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Run smoke tests: ${GREEN}./scripts/smoke-tests.sh ${STAGING_URL}${NC}"
echo -e "2. Complete manual tests documented in DEPLOYMENT.md"
echo -e "3. Update ${OUTPUT_FILE} with actual test results"
echo -e "4. Fill in 'Issues Found' section"
echo -e "5. Complete 'Production Promotion Readiness' checklist"
echo -e "6. Get sign-off from DevOps Lead and Product Owner"
echo ""
echo -e "${BLUE}Report location: ${OUTPUT_FILE}${NC}"
