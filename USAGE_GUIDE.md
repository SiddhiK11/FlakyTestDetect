# Flaky Test Detection System - Usage Guide

## 🚀 Quick Start

### Setup & Run

The application is **already running** in Replit! You don't need to install anything.

1. **Access the Application**: Click the webview in Replit (or visit the URL shown in the preview)
2. **Navigate**: Use the sidebar to explore:
   - **Dashboard**: Overview stats and recent flaky tests
   - **Flaky Tests**: Detailed list with expandable rows
   - **Test Details**: Click any test to see execution history and root cause analysis

---

## 📊 How to Input Test Data

### Method 1: Using the API (Recommended for Integration)

Submit test execution results programmatically using REST API endpoints.

#### Step 1: Create a Test Case

```bash
curl -X POST http://localhost:5000/api/test-cases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Form Test",
    "url": "https://example.com/login",
    "instructions": "Fill username and password, click submit, verify redirect"
  }'
```

**Response:**
```json
{
  "id": "abc-123-def",
  "name": "Login Form Test",
  "url": "https://example.com/login",
  "instructions": "Fill username and password, click submit, verify redirect",
  "createdAt": "2025-11-09T13:00:00.000Z"
}
```

#### Step 2: Submit Test Executions (Minimum 5 for Analysis)

```bash
# Execution 1 - Passed
curl -X POST http://localhost:5000/api/test-executions \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "abc-123-def",
    "status": "passed",
    "executionTime": 1250,
    "domStabilityScore": 95,
    "networkCallCount": 3,
    "waitConditionFailures": 0,
    "assertionCount": 5
  }'

# Execution 2 - Failed (timing issue)
curl -X POST http://localhost:5000/api/test-executions \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "abc-123-def",
    "status": "failed",
    "executionTime": 3500,
    "errorMessage": "Timeout waiting for element",
    "domStabilityScore": 88,
    "networkCallCount": 5,
    "waitConditionFailures": 2,
    "assertionCount": 5
  }'

# Execution 3 - Passed
curl -X POST http://localhost:5000/api/test-executions \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "abc-123-def",
    "status": "passed",
    "executionTime": 1180,
    "domStabilityScore": 92,
    "networkCallCount": 3,
    "waitConditionFailures": 0,
    "assertionCount": 5
  }'

# Execution 4 - Failed (DOM issue)
curl -X POST http://localhost:5000/api/test-executions \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "abc-123-def",
    "status": "failed",
    "executionTime": 2800,
    "errorMessage": "Element not found: #submit-button",
    "domStabilityScore": 62,
    "networkCallCount": 4,
    "waitConditionFailures": 1,
    "assertionCount": 5
  }'

# Execution 5 - Passed
curl -X POST http://localhost:5000/api/test-executions \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "abc-123-def",
    "status": "passed",
    "executionTime": 1320,
    "domStabilityScore": 94,
    "networkCallCount": 3,
    "waitConditionFailures": 0,
    "assertionCount": 5
  }'
```

**After 5 executions**, the system **automatically analyzes** the test and creates a flaky test record if patterns are detected!

---

### Method 2: Using JavaScript/TypeScript

```typescript
// Create a test case
async function createTestCase() {
  const response = await fetch('/api/test-cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shopping Cart Test',
      url: 'https://shop.example.com/cart',
      instructions: 'Add item to cart, verify total, proceed to checkout'
    })
  });
  return await response.json();
}

// Submit test execution
async function submitExecution(testCaseId: string, passed: boolean) {
  const response = await fetch('/api/test-executions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testCaseId,
      status: passed ? 'passed' : 'failed',
      executionTime: Math.floor(Math.random() * 2000) + 1000,
      domStabilityScore: passed ? 90 + Math.random() * 10 : 60 + Math.random() * 20,
      networkCallCount: Math.floor(Math.random() * 5) + 1,
      waitConditionFailures: passed ? 0 : Math.floor(Math.random() * 3),
      assertionCount: 8,
      errorMessage: passed ? undefined : 'Assertion failed: expected price to match'
    })
  });
  return await response.json();
}

// Example: Create test and run it 10 times
async function runTest() {
  const testCase = await createTestCase();
  
  for (let i = 0; i < 10; i++) {
    // Simulate intermittent failures (flaky test)
    const passed = Math.random() > 0.3;
    await submitExecution(testCase.id, passed);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

---

## 📋 API Reference

### Test Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/test-cases` | List all test cases |
| `POST` | `/api/test-cases` | Create a new test case |
| `GET` | `/api/test-cases/:id` | Get test case details |
| `GET` | `/api/test-cases/:id/executions` | Get execution history |

### Test Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/test-executions` | Submit execution (triggers analysis) |

**Required Fields:**
- `testCaseId`: ID of the test case
- `status`: `"passed"` or `"failed"`
- `executionTime`: Time in milliseconds

**Optional Fields:**
- `errorMessage`: Error description for failures
- `stackTrace`: Full stack trace
- `domStabilityScore`: 0-100 (lower = more DOM changes)
- `networkCallCount`: Number of network requests
- `waitConditionFailures`: Failed wait/timeout attempts
- `assertionCount`: Total assertions in test

### Flaky Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/flaky-tests` | List all detected flaky tests |
| `GET` | `/api/flaky-tests/:id` | Get flaky test details |
| `PATCH` | `/api/flaky-tests/:id/resolve` | Mark as resolved |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Get summary statistics |

---

## 🔍 Understanding the Analysis

### Detection Criteria

A test is marked as **flaky** when:
1. **Minimum 5 executions** have been submitted
2. Has **intermittent failures** (some pass, some fail)
3. Shows **high timing variance** (>30%) OR **low DOM stability** (<70%)

### Flakiness Score

Calculated as:
```
score = (failureRate × 0.5) + (timingVariance × 0.3) + ((100 - domStability) × 0.2)
```

- **75-100%**: Critical (needs immediate attention)
- **50-74%**: High (investigate soon)
- **0-49%**: Moderate (monitor)

### Root Cause Types

1. **Timing Issues** - Async operations, network delays, wait conditions
2. **DOM Instability** - Element selectors changing, dynamic content
3. **Concurrency** - Race conditions, resource contention
4. **Resource Dependencies** - External API failures, network issues

---

## 💡 Example Workflow

### Scenario: Testing a Real Application

```bash
# 1. Create test case
TEST_ID=$(curl -s -X POST http://localhost:5000/api/test-cases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Signup Flow",
    "url": "https://myapp.com/signup",
    "instructions": "Fill form, submit, verify email sent"
  }' | jq -r '.id')

# 2. Run test multiple times (simulate CI/CD)
for i in {1..10}; do
  STATUS=$([ $((RANDOM % 100)) -lt 70 ] && echo "passed" || echo "failed")
  TIME=$((1000 + RANDOM % 2000))
  
  curl -s -X POST http://localhost:5000/api/test-executions \
    -H "Content-Type: application/json" \
    -d "{
      \"testCaseId\": \"$TEST_ID\",
      \"status\": \"$STATUS\",
      \"executionTime\": $TIME,
      \"domStabilityScore\": $((60 + RANDOM % 40)),
      \"networkCallCount\": $((2 + RANDOM % 4)),
      \"waitConditionFailures\": $((RANDOM % 2)),
      \"assertionCount\": 12
    }" > /dev/null
  
  echo "Execution $i: $STATUS (${TIME}ms)"
  sleep 0.5
done

# 3. Check for flaky tests
curl -s http://localhost:5000/api/flaky-tests | jq '.'
```

---

## 🎯 Integration with Test Frameworks

### Playwright Integration Example

```typescript
import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  // Submit execution result to flaky detection system
  await fetch('http://localhost:5000/api/test-executions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testCaseId: 'your-test-id',
      status: testInfo.status === 'passed' ? 'passed' : 'failed',
      executionTime: testInfo.duration,
      errorMessage: testInfo.error?.message,
      stackTrace: testInfo.error?.stack,
      domStabilityScore: 85, // Calculate based on your metrics
      networkCallCount: 3,
      waitConditionFailures: 0,
      assertionCount: 5
    })
  });
});
```

### Cypress Integration Example

```javascript
afterEach(function() {
  const status = this.currentTest.state === 'passed' ? 'passed' : 'failed';
  
  cy.request('POST', 'http://localhost:5000/api/test-executions', {
    testCaseId: Cypress.env('TEST_CASE_ID'),
    status: status,
    executionTime: this.currentTest.duration,
    errorMessage: this.currentTest.err?.message,
    domStabilityScore: 90,
    networkCallCount: 4,
    assertionCount: this.currentTest.assertions?.length || 0
  });
});
```

---

## 📱 Using the Web Interface

1. **Dashboard** - See overall statistics and top flaky tests
2. **Flaky Tests Page** - Browse all detected flaky tests
3. **Expand Rows** - Click any row to see detailed root cause information
4. **View Details** - Click "View Details" for full execution history
5. **Charts** - Visual execution timeline and failure patterns

---

## 🐛 Troubleshooting

### No tests appearing?
- Ensure you've submitted at least 5 executions per test case
- Check that test case IDs match between creation and execution submission

### Test not marked as flaky?
- Must have intermittent failures (not all pass or all fail)
- Timing variance must be >30% OR DOM stability <70%

### API not responding?
- Check that the application is running on port 5000
- Verify JSON payload structure matches the schema

---

## 🔗 Next Steps

- Integrate with your CI/CD pipeline
- Set up automated test execution reporting
- Configure alerts for critical flaky tests (score >75%)
- Export reports for team review
