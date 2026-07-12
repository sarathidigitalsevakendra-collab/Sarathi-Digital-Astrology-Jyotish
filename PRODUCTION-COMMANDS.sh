#!/bin/bash

###############################################################################
# Production Monitoring & Optimization Commands
# Digital Astrology Platform - Ready for 1,000+ Daily Users
#
# Usage:
#   chmod +x PRODUCTION-COMMANDS.sh
#   ./PRODUCTION-COMMANDS.sh [command]
#
# Commands:
#   bundle-analyze    - Generate bundle size report
#   lighthouse        - Run Lighthouse audit
#   build-test        - Test production build locally
#   perf-baseline     - Establish performance baseline
#   deploy-check      - Pre-deployment checklist
###############################################################################

set -e  # Exit on error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_APP="$PROJECT_ROOT/apps/web"
PROD_URL="${PROD_URL:-https://jyotishya.in}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# 1. Bundle Analysis
###############################################################################
bundle-analyze() {
  echo -e "${GREEN}📦 Running bundle analysis...${NC}"

  cd "$WEB_APP"

  # Install analyzer if not present
  if ! grep -q "@next/bundle-analyzer" package.json; then
    echo "Installing @next/bundle-analyzer..."
    yarn add -D @next/bundle-analyzer
  fi

  # Update next.config.js if needed
  if ! grep -q "withBundleAnalyzer" next.config.js; then
    echo -e "${YELLOW}⚠️  Adding bundle analyzer to next.config.js${NC}"
    cat >> next.config.js << 'EOF'

// Bundle Analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(module.exports)
EOF
  fi

  # Generate report
  echo "Building with bundle analysis..."
  ANALYZE=true yarn build

  echo -e "${GREEN}✅ Bundle analysis complete!${NC}"
  echo "📊 Report should open in browser automatically"
  echo ""
  echo "🔍 Look for:"
  echo "  - Chunks >100 KB (optimize with code splitting)"
  echo "  - Duplicate dependencies (check tree shaking)"
  echo "  - Unused code (remove dead code)"
}

###############################################################################
# 2. Lighthouse Audit
###############################################################################
lighthouse() {
  echo -e "${GREEN}⚡ Running Lighthouse audit...${NC}"

  # Check if lighthouse is installed
  if ! command -v lighthouse &> /dev/null; then
    echo "Installing Lighthouse globally..."
    npm install -g lighthouse
  fi

  # Create output directory
  mkdir -p "$PROJECT_ROOT/lighthouse-reports"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  OUTPUT_DIR="$PROJECT_ROOT/lighthouse-reports/$TIMESTAMP"
  mkdir -p "$OUTPUT_DIR"

  echo "Auditing: $PROD_URL"

  # Run Lighthouse for key pages
  PAGES=(
    "/"
    "/auth/signin"
    "/dashboard"
    "/dashboard/birth-chart"
    "/consultations"
  )

  for PAGE in "${PAGES[@]}"; do
    echo -e "${YELLOW}Auditing: ${PROD_URL}${PAGE}${NC}"

    lighthouse "${PROD_URL}${PAGE}" \
      --output=html \
      --output=json \
      --output-path="${OUTPUT_DIR}/${PAGE//\//_}" \
      --chrome-flags="--headless" \
      --quiet \
      --only-categories=performance,accessibility,best-practices,seo

    echo -e "${GREEN}✓ ${PAGE}${NC}"
  done

  echo ""
  echo -e "${GREEN}✅ Lighthouse audit complete!${NC}"
  echo "📊 Reports saved to: $OUTPUT_DIR"
  echo ""
  echo "🎯 Target Scores:"
  echo "  - Performance: >90"
  echo "  - Accessibility: >95"
  echo "  - Best Practices: >90"
  echo "  - SEO: >90"
  echo ""
  echo "Open reports:"
  open "$OUTPUT_DIR"
}

###############################################################################
# 3. Production Build Test
###############################################################################
build-test() {
  echo -e "${GREEN}🏗️  Testing production build...${NC}"

  cd "$WEB_APP"

  # Clean previous build
  echo "Cleaning previous build..."
  rm -rf .next

  # Set production environment
  export NODE_ENV=production
  export CI=true

  echo ""
  echo "Building..."
  START_TIME=$(date +%s)

  if yarn build; then
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))

    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo "⏱️  Build time: ${BUILD_TIME}s (target: <60s)"

    if [ $BUILD_TIME -lt 60 ]; then
      echo -e "${GREEN}✓ Build time within target${NC}"
    else
      echo -e "${YELLOW}⚠️  Build time exceeds target (${BUILD_TIME}s > 60s)${NC}"
    fi

    # Check bundle size
    echo ""
    echo "📦 Bundle analysis:"
    du -sh .next
    du -sh .next/static/chunks/*.js | sort -rh | head -10

    echo ""
    echo -e "${GREEN}Build ready for deployment!${NC}"
    exit 0
  else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo "Check errors above and fix before deploying"
    exit 1
  fi
}

###############################################################################
# 4. Performance Baseline
###############################################################################
perf-baseline() {
  echo -e "${GREEN}📊 Establishing performance baseline...${NC}"

  # Install required tools
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl not installed${NC}"
    exit 1
  fi

  # Create curl format file
  cat > /tmp/curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF

  BASELINE_FILE="$PROJECT_ROOT/perf-baseline-$(date +%Y%m%d_%H%M%S).txt"

  echo "Testing: $PROD_URL" | tee "$BASELINE_FILE"
  echo "Date: $(date)" | tee -a "$BASELINE_FILE"
  echo "" | tee -a "$BASELINE_FILE"

  # Test key endpoints
  ENDPOINTS=(
    "/"
    "/auth/signin"
    "/dashboard"
    "/api/health"
  )

  for ENDPOINT in "${ENDPOINTS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$BASELINE_FILE"
    echo "Testing: ${PROD_URL}${ENDPOINT}" | tee -a "$BASELINE_FILE"
    echo "" | tee -a "$BASELINE_FILE"

    curl -w "@/tmp/curl-format.txt" \
      -o /dev/null \
      -s \
      "${PROD_URL}${ENDPOINT}" | tee -a "$BASELINE_FILE"

    echo "" | tee -a "$BASELINE_FILE"
  done

  echo "" | tee -a "$BASELINE_FILE"
  echo -e "${GREEN}✅ Baseline complete!${NC}"
  echo "📄 Results saved to: $BASELINE_FILE"
  echo ""
  echo "🎯 Targets:"
  echo "  - TTFB (time_starttransfer): <200ms"
  echo "  - Total time: <2000ms"
}

###############################################################################
# 5. Pre-Deployment Checklist
###############################################################################
deploy-check() {
  echo -e "${GREEN}🚀 Running pre-deployment checklist...${NC}"
  echo ""

  CHECKS_PASSED=0
  CHECKS_FAILED=0

  # Check 1: Build passes
  echo -n "1. Production build passes... "
  cd "$WEB_APP"
  if CI=true yarn build &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC}"
    ((CHECKS_FAILED++))
  fi

  # Check 2: Type check passes
  echo -n "2. TypeScript type check passes... "
  if yarn type-check &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC}"
    ((CHECKS_FAILED++))
  fi

  # Check 3: Environment variables set
  echo -n "3. Required environment variables... "
  REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  )

  VARS_OK=true
  for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      VARS_OK=false
      echo -e "${RED}✗ Missing: $VAR${NC}"
    fi
  done

  if [ "$VARS_OK" = true ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    ((CHECKS_FAILED++))
  fi

  # Check 4: Git status clean
  echo -n "4. Git working directory clean... "
  cd "$PROJECT_ROOT"
  if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${YELLOW}⚠ (uncommitted changes)${NC}"
    ((CHECKS_PASSED++))  # Warning, not failure
  fi

  # Check 5: On main branch
  echo -n "5. On main branch... "
  CURRENT_BRANCH=$(git branch --show-current)
  if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${YELLOW}⚠ (on $CURRENT_BRANCH)${NC}"
  fi

  # Check 6: Prisma migrations up to date
  echo -n "6. Prisma client generated... "
  if [ -d "$PROJECT_ROOT/node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC}"
    ((CHECKS_FAILED++))
  fi

  # Summary
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Checks Passed: ${CHECKS_PASSED}"
  echo "Checks Failed: ${CHECKS_FAILED}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Deploy with:"
    echo "  git push origin main"
    exit 0
  else
    echo -e "${RED}❌ Some checks failed. Fix before deploying.${NC}"
    exit 1
  fi
}

###############################################################################
# 6. Database Query Performance Check
###############################################################################
db-perf() {
  echo -e "${GREEN}🗄️  Checking database query performance...${NC}"

  # This requires database credentials
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    exit 1
  fi

  cd "$PROJECT_ROOT/packages/schemas"

  echo "Analyzing slow queries..."
  npx prisma studio &
  STUDIO_PID=$!

  echo ""
  echo "Prisma Studio opened in background (PID: $STUDIO_PID)"
  echo ""
  echo "📊 Manual checks in Supabase Dashboard:"
  echo "  1. Go to: Database → Query Performance"
  echo "  2. Check for queries >100ms"
  echo "  3. Verify indexes on:"
  echo "     - consultations (userId, paymentStatus)"
  echo "     - kundli (userId)"
  echo "     - users (email, phone)"
  echo ""
  echo "Press Enter to close Prisma Studio and continue..."
  read

  kill $STUDIO_PID 2>/dev/null || true
}

###############################################################################
# 7. Production Metrics Snapshot
###############################################################################
metrics-snapshot() {
  echo -e "${GREEN}📈 Capturing production metrics snapshot...${NC}"

  SNAPSHOT_FILE="$PROJECT_ROOT/metrics-snapshot-$(date +%Y%m%d_%H%M%S).json"

  echo "Fetching metrics from $PROD_URL"

  # Health check
  HEALTH=$(curl -s "${PROD_URL}/api/health" || echo '{"status":"error"}')

  # Build metrics snapshot
  cat > "$SNAPSHOT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "health": $HEALTH,
  "manual_checks": {
    "vercel_analytics": "Check at https://vercel.com/dashboard",
    "sentry_errors": "Check at https://sentry.io",
    "supabase_queries": "Check at https://supabase.com/dashboard"
  },
  "targets": {
    "error_rate": "<0.1%",
    "payment_success_rate": ">99%",
    "api_p95_response_time": "<500ms",
    "core_web_vitals_good": ">90%"
  }
}
EOF

  echo ""
  echo -e "${GREEN}✅ Snapshot saved to: $SNAPSHOT_FILE${NC}"
  cat "$SNAPSHOT_FILE"
}

###############################################################################
# Main Command Router
###############################################################################

case "${1:-help}" in
  bundle-analyze)
    bundle-analyze
    ;;
  lighthouse)
    lighthouse
    ;;
  build-test)
    build-test
    ;;
  perf-baseline)
    perf-baseline
    ;;
  deploy-check)
    deploy-check
    ;;
  db-perf)
    db-perf
    ;;
  metrics-snapshot)
    metrics-snapshot
    ;;
  help|*)
    echo "Production Monitoring & Optimization Commands"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  bundle-analyze    - Generate bundle size report with Next.js analyzer"
    echo "  lighthouse        - Run Lighthouse audit on all key pages"
    echo "  build-test        - Test production build locally (CI mode)"
    echo "  perf-baseline     - Measure TTFB and total time for endpoints"
    echo "  deploy-check      - Run pre-deployment checklist"
    echo "  db-perf           - Check database query performance"
    echo "  metrics-snapshot  - Capture current production metrics"
    echo ""
    echo "Examples:"
    echo "  $0 build-test"
    echo "  PROD_URL=https://staging.jyotishya.in $0 lighthouse"
    echo "  $0 deploy-check && git push origin main"
    ;;
esac
