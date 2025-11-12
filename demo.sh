#!/bin/bash

# Flaky Test Detection Demo Script
# This script demonstrates the flaky test detection system by creating
# test cases and submitting simulated test executions

echo "🚀 Flaky Test Detection System - Demo"
echo "======================================"
echo ""

# Base URL
BASE_URL="http://localhost:5000"

echo "📝 Step 1: Creating a test case..."
echo ""

# Create test case
TEST_CASE=$(curl -s -X POST $BASE_URL/api/test-cases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Login Test",
    "url": "https://example.com/login",
    "instructions": "Enter username and password, click submit, verify dashboard redirect"
  }')

TEST_ID=$(echo $TEST_CASE | jq -r '.id')
echo "✅ Created test case: $TEST_ID"
echo ""

echo "🧪 Step 2: Running 10 test executions..."
echo "   (Simulating intermittent failures to demonstrate flaky detection)"
echo ""

# Simulate 10 test runs with varying results
for i in {1..10}; do
  # 40% failure rate
  if [ $((RANDOM % 100)) -lt 40 ]; then
    STATUS="failed"
    TIME=$((2500 + RANDOM % 1500))  # Slower when failing
    DOM_SCORE=$((50 + RANDOM % 30))  # Lower DOM stability
    WAIT_FAILS=$((1 + RANDOM % 3))
    ERROR_MSG="Timeout waiting for element #submit-button"
  else
    STATUS="passed"
    TIME=$((1000 + RANDOM % 500))   # Faster when passing
    DOM_SCORE=$((85 + RANDOM % 15)) # Higher DOM stability
    WAIT_FAILS=0
    ERROR_MSG=""
  fi

  NETWORK_CALLS=$((2 + RANDOM % 4))

  # Create execution payload
  if [ "$STATUS" == "failed" ]; then
    PAYLOAD="{
      \"testCaseId\": \"$TEST_ID\",
      \"status\": \"$STATUS\",
      \"executionTime\": $TIME,
      \"domStabilityScore\": $DOM_SCORE,
      \"networkCallCount\": $NETWORK_CALLS,
      \"waitConditionFailures\": $WAIT_FAILS,
      \"assertionCount\": 5,
      \"errorMessage\": \"$ERROR_MSG\"
    }"
  else
    PAYLOAD="{
      \"testCaseId\": \"$TEST_ID\",
      \"status\": \"$STATUS\",
      \"executionTime\": $TIME,
      \"domStabilityScore\": $DOM_SCORE,
      \"networkCallCount\": $NETWORK_CALLS,
      \"waitConditionFailures\": $WAIT_FAILS,
      \"assertionCount\": 5
    }"
  fi

  # Submit execution
  curl -s -X POST $BASE_URL/api/test-executions \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" > /dev/null

  echo "   Execution $i: $STATUS (${TIME}ms, DOM: $DOM_SCORE%)"
  sleep 0.3
done

echo ""
echo "✅ Completed 10 test executions"
echo ""

echo "📊 Step 3: Checking for flaky test detection..."
echo ""

# Wait a moment for analysis
sleep 1

# Get flaky tests
FLAKY_TESTS=$(curl -s $BASE_URL/api/flaky-tests)
FLAKY_COUNT=$(echo $FLAKY_TESTS | jq '. | length')

if [ "$FLAKY_COUNT" -gt 0 ]; then
  echo "⚠️  FLAKY TEST DETECTED!"
  echo ""
  echo "Flakiness Score: $(echo $FLAKY_TESTS | jq -r '.[0].flakinessScore')%"
  echo "Failure Rate: $(echo $FLAKY_TESTS | jq -r '.[0].failureRate')%"
  echo "Timing Variance: $(echo $FLAKY_TESTS | jq -r '.[0].timingVariance')%"
  echo "Total Runs: $(echo $FLAKY_TESTS | jq -r '.[0].totalRuns')"
  echo "Failed Runs: $(echo $FLAKY_TESTS | jq -r '.[0].failedRuns')"
  echo ""
  echo "Root Causes:"
  echo $FLAKY_TESTS | jq -r '.[0].rootCauses[] | "  - [\(.type | ascii_upcase)] \(.description) (Confidence: \(.confidence)%)"'
else
  echo "ℹ️  No flaky tests detected (may need more executions or variance)"
fi

echo ""
echo "📈 Step 4: View dashboard statistics..."
echo ""

STATS=$(curl -s $BASE_URL/api/dashboard/stats)
echo "Total Tests: $(echo $STATS | jq -r '.totalTests')"
echo "Flaky Tests: $(echo $STATS | jq -r '.flakyTestCount')"
echo "Flaky Percentage: $(echo $STATS | jq -r '.flakyPercentage')%"

echo ""
echo "✨ Demo complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Open the web interface in your browser"
echo "   2. Navigate to 'Dashboard' to see statistics"
echo "   3. Go to 'Flaky Tests' to see detailed analysis"
echo "   4. Click on a test to view execution history"
echo ""
echo "📚 For more information, see USAGE_GUIDE.md"
echo ""
