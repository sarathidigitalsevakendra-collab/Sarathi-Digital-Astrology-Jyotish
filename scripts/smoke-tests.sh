#!/bin/bash

################################################################################
# Jyotishya Staging Smoke Tests
#
# This script runs comprehensive smoke tests against the staging deployment
# to verify all Week 1 features are working correctly.
#
# Usage: ./scripts/smoke-tests.sh <staging-url>
# Example: ./scripts/smoke-tests.sh https://digital-astrology-staging.vercel.app
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Staging URL
STAGING_URL="${1:-}"

if [ -z "$STAGING_URL" ]; then
    echo -e "${RED}❌ Error: Staging URL required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/smoke-tests.sh <staging-url>${NC}"
    echo -e "${YELLOW}Example: ./scripts/smoke-tests.sh https://digital-astrology-staging.vercel.app${NC}"
    exit 1
fi

# Remove trailing slash
STAGING_URL="${STAGING_URL%/}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Jyotishya Staging Smoke Tests - Week 1                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Testing URL: ${STAGING_URL}${NC}"
echo -e "${YELLOW}Start Time: $(date +"%Y-%m-%d %H:%M:%S")${NC}"
echo ""

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_cmd="$2"
    local expected_output="$3"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: ${test_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if eval "$test_cmd"; then
        if [ -n "$expected_output" ]; then
            echo -e "${GREEN}✓ PASSED${NC}: $test_name"
            PASSED=$((PASSED + 1))
        else
            echo -e "${GREEN}✓ PASSED${NC}: $test_name"
            PASSED=$((PASSED + 1))
        fi
    else
        echo -e "${RED}✗ FAILED${NC}: $test_name"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# Helper function to check HTTP status
check_http_status() {
    local url="$1"
    local expected_status="${2:-200}"
    local description="$3"

    echo -e "${YELLOW}  Testing: ${description}${NC}"
    echo -e "${YELLOW}  URL: ${url}${NC}"

    local status=$(curl -s -o /dev/null -w "%{http_code}" "${url}")

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}  ✓ Status: ${status} (expected ${expected_status})${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Status: ${status} (expected ${expected_status})${NC}"
        return 1
    fi
}

# Helper function to check content
check_content() {
    local url="$1"
    local search_text="$2"
    local description="$3"

    echo -e "${YELLOW}  Testing: ${description}${NC}"
    echo -e "${YELLOW}  Searching for: \"${search_text}\"${NC}"

    local response=$(curl -s "${url}")

    if echo "$response" | grep -q "$search_text"; then
        echo -e "${GREEN}  ✓ Content found${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Content not found${NC}"
        return 1
    fi
}

################################################################################
# Test Suite 1: Legal Pages
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 1: Legal Pages${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test 1.1: Privacy Policy Page
run_test "Privacy Policy - Page Loads" \
    "check_http_status '${STAGING_URL}/privacy' 200 'Privacy policy page'" \
    ""

run_test "Privacy Policy - IT Act 2000 Compliance" \
    "check_content '${STAGING_URL}/privacy' 'IT Act 2000' 'IT Act 2000 mention'" \
    ""

run_test "Privacy Policy - GDPR Compliance" \
    "check_content '${STAGING_URL}/privacy' 'GDPR' 'GDPR mention'" \
    ""

run_test "Privacy Policy - Grievance Officer" \
    "check_content '${STAGING_URL}/privacy' 'Grievance Redressal Officer' 'Grievance officer section'" \
    ""

# Test 1.2: Terms of Service Page
run_test "Terms of Service - Page Loads" \
    "check_http_status '${STAGING_URL}/terms' 200 'Terms of service page'" \
    ""

run_test "Terms of Service - Entertainment Disclaimer" \
    "check_content '${STAGING_URL}/terms' 'entertainment and self-reflection purposes only' 'Entertainment disclaimer'" \
    ""

run_test "Terms of Service - Subscription Pricing" \
    "check_content '${STAGING_URL}/terms' '₹49' 'Subscription pricing'" \
    ""

run_test "Terms of Service - Liability Limitation" \
    "check_content '${STAGING_URL}/terms' 'Limitation of Liability' 'Liability section'" \
    ""

# Test 1.3: Refund Policy Page
run_test "Refund Policy - Page Loads" \
    "check_http_status '${STAGING_URL}/refund-policy' 200 'Refund policy page'" \
    ""

run_test "Refund Policy - 7-Day Guarantee" \
    "check_content '${STAGING_URL}/refund-policy' '7-Day Money-Back Guarantee' '7-day guarantee'" \
    ""

run_test "Refund Policy - Consultation Rules" \
    "check_content '${STAGING_URL}/refund-policy' 'Consultation Cancellation and Refunds' 'Consultation refund rules'" \
    ""

################################################################################
# Test Suite 2: Cookie Consent Banner
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 2: Cookie Consent Banner${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test 2.1: Cookie Banner HTML Present
run_test "Cookie Banner - Component Present" \
    "check_content '${STAGING_URL}' 'cookie' 'Cookie banner component'" \
    ""

# Test 2.2: Cookie Banner Mentions Analytics
run_test "Cookie Banner - Analytics Mention" \
    "check_content '${STAGING_URL}' 'analytics' 'Analytics mention in banner'" \
    ""

echo -e "${YELLOW}⚠ Manual Test Required:${NC}"
echo -e "${YELLOW}  - Visit ${STAGING_URL} in browser${NC}"
echo -e "${YELLOW}  - Verify cookie banner appears on first visit${NC}"
echo -e "${YELLOW}  - Click 'Accept' and verify banner disappears${NC}"
echo -e "${YELLOW}  - Refresh page and verify banner doesn't reappear${NC}"
echo -e "${YELLOW}  - Check localStorage for 'jyotishya-cookie-consent' key${NC}"
WARNINGS=$((WARNINGS + 1))
echo ""

################################################################################
# Test Suite 3: API Health Checks
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 3: API Health Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test 3.1: Health Endpoint
run_test "API Health Check" \
    "check_http_status '${STAGING_URL}/api/health' 200 'Health check endpoint'" \
    ""

# Test 3.2: Ready Endpoint
run_test "API Ready Check" \
    "check_http_status '${STAGING_URL}/api/ready' 200 'Ready check endpoint'" \
    ""

# Test 3.3: Webhook Endpoint (should reject without auth)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test: Razorpay Webhook Endpoint Security${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  Testing: Webhook rejects unauthenticated requests${NC}"
echo -e "${YELLOW}  URL: ${STAGING_URL}/api/webhooks/razorpay${NC}"

webhook_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${STAGING_URL}/api/webhooks/razorpay" \
    -H "Content-Type: application/json" \
    -d '{"event":"payment.captured"}')

if [ "$webhook_status" = "400" ] || [ "$webhook_status" = "401" ]; then
    echo -e "${GREEN}  ✓ Webhook correctly rejects unauthenticated requests (${webhook_status})${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}  ✗ Webhook did not reject request (${webhook_status})${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

################################################################################
# Test Suite 4: Astrology Disclaimer
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 4: Astrology Disclaimer${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠ Manual Test Required:${NC}"
echo -e "${YELLOW}  - Navigate to ${STAGING_URL}/consultations${NC}"
echo -e "${YELLOW}  - Click 'Book Consultation' on any astrologer${NC}"
echo -e "${YELLOW}  - Verify disclaimer checkbox appears${NC}"
echo -e "${YELLOW}  - Verify 'Proceed to Pay' button is disabled${NC}"
echo -e "${YELLOW}  - Check disclaimer checkbox${NC}"
echo -e "${YELLOW}  - Verify 'Proceed to Pay' button becomes enabled${NC}"
WARNINGS=$((WARNINGS + 1))
echo ""

################################################################################
# Test Suite 5: Payment System Resilience
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 5: Payment System Resilience${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠ Manual Test Required (requires authentication):${NC}"
echo -e "${YELLOW}  Payment Retry Logic Test:${NC}"
echo -e "${YELLOW}  1. Sign in to ${STAGING_URL}${NC}"
echo -e "${YELLOW}  2. Attempt to create a consultation order${NC}"
echo -e "${YELLOW}  3. Monitor Sentry for retry breadcrumbs${NC}"
echo -e "${YELLOW}  4. Verify circuit breaker prevents cascade failures${NC}"
echo ""
echo -e "${YELLOW}  Circuit Breaker Test:${NC}"
echo -e "${YELLOW}  1. Simulate 5 consecutive payment failures${NC}"
echo -e "${YELLOW}  2. Verify circuit opens (503 response)${NC}"
echo -e "${YELLOW}  3. Wait 60 seconds${NC}"
echo -e "${YELLOW}  4. Verify circuit auto-resets${NC}"
WARNINGS=$((WARNINGS + 1))
echo ""

################################################################################
# Test Suite 6: Monitoring & Observability
################################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite 6: Monitoring & Observability${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Manual Sentry Verification:${NC}"
echo -e "${YELLOW}  1. Visit: https://sentry.io${NC}"
echo -e "${YELLOW}  2. Navigate to jyotishya-staging project${NC}"
echo -e "${YELLOW}  3. Verify breadcrumbs appear for:${NC}"
echo -e "${YELLOW}     - Webhook events (payment.captured, payment.failed)${NC}"
echo -e "${YELLOW}     - Payment retry attempts${NC}"
echo -e "${YELLOW}     - Disclaimer acceptance/rejection${NC}"
echo -e "${YELLOW}     - Cookie consent acceptance/rejection${NC}"
echo ""
echo -e "${YELLOW}Manual Razorpay Dashboard Verification:${NC}"
echo -e "${YELLOW}  1. Visit: https://dashboard.razorpay.com${NC}"
echo -e "${YELLOW}  2. Switch to Test Mode${NC}"
echo -e "${YELLOW}  3. Verify webhook endpoint configured:${NC}"
echo -e "${YELLOW}     ${STAGING_URL}/api/webhooks/razorpay${NC}"
echo -e "${YELLOW}  4. Test webhook with test event${NC}"
echo -e "${YELLOW}  5. Verify Sentry receives webhook log${NC}"
echo ""
WARNINGS=$((WARNINGS + 2))

################################################################################
# Test Summary
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Smoke Test Summary                                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Passed:  ${PASSED}${NC}"
echo -e "${RED}Failed:  ${FAILED}${NC}"
echo -e "${YELLOW}Warnings: ${WARNINGS} (manual tests required)${NC}"
echo ""
echo -e "${YELLOW}End Time: $(date +"%Y-%m-%d %H:%M:%S")${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All automated tests passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "${YELLOW}1. Complete ${WARNINGS} manual tests listed above${NC}"
    echo -e "${YELLOW}2. Verify Sentry dashboard shows webhook logs${NC}"
    echo -e "${YELLOW}3. Test end-to-end payment flow with Razorpay test card${NC}"
    echo -e "${YELLOW}4. If all manual tests pass, promote to production:${NC}"
    echo -e "${GREEN}   git checkout main${NC}"
    echo -e "${GREEN}   git merge staging${NC}"
    echo -e "${GREEN}   git tag -a v0.1.0 -m \"Week 1 Production Release\"${NC}"
    echo -e "${GREEN}   git push origin main --tags${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Some tests failed. Do not promote to production.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Rollback Procedure:${NC}"
    echo -e "${YELLOW}1. Investigate failed tests${NC}"
    echo -e "${YELLOW}2. Fix issues in local environment${NC}"
    echo -e "${YELLOW}3. Re-run: ./scripts/deploy-staging.sh${NC}"
    echo -e "${YELLOW}4. Re-run: ./scripts/smoke-tests.sh ${STAGING_URL}${NC}"
    echo ""
    exit 1
fi
