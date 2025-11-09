# Flaky Test Detection System

## Project Overview

An automated flaky test detection system with multi-factor analysis for web test automation. This application helps identify non-deterministic tests and provides root cause analysis with confidence scores.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Wouter routing
- **UI Components**: Shadcn UI + Tailwind CSS
- **Design System**: Linear/GitHub-inspired developer tooling aesthetic
- **State Management**: TanStack Query for server state

### Backend (Express + TypeScript)
- **Server**: Express.js REST API
- **Storage**: In-memory storage with PostgreSQL schema (ready for DB integration)
- **Analysis Engine**: Statistical variance analyzer for flaky test detection

## Flaky Test Detection Methodology

Unlike the research paper's KNN-based approach with trace-back coverage, this system uses **Statistical Variance & Pattern Recognition**:

### Detection Factors

1. **Execution Time Variance**
   - Calculates standard deviation across test runs
   - High variance (>30%) indicates async/timing issues
   - Formula: `(stdDev / average) * 100`

2. **DOM Stability Score**
   - Tracks element locator consistency
   - Scores below 70% suggest dynamic page structure issues
   - Averages stability across all executions

3. **Network Dependency Analysis**
   - Detects failed runs with high network call counts (>5)
   - Indicates external API reliability problems

4. **Test Complexity Metrics**
   - Analyzes wait condition failures
   - Tracks assertion counts and interaction depth

### Root Cause Identification

The analyzer identifies four primary root cause types:

1. **Timing Issues** (`timing`)
   - Triggered when: Variance >30% with wait condition failures
   - Confidence: Proportional to timing variance
   - Example: "Wait conditions failing due to variable API response times"

2. **DOM Instability** (`dom`)
   - Triggered when: DOM stability <70%
   - Confidence: `100 - stability score`
   - Example: "Element selectors inconsistent across page loads"

3. **Concurrency Problems** (`concurrency`)
   - Triggered when: Execution time spread ratio >2 and variance >40%
   - Confidence: Based on timing variance
   - Example: "Race conditions or resource contention detected"

4. **Resource Dependencies** (`resource`)
   - Triggered when: Failed runs have >5 network calls
   - Confidence: Fixed at 65%
   - Example: "External API dependency failures"

### Flakiness Score Calculation

```typescript
flakinessScore = (failureRate * 0.5) + (timingVariance * 0.3) + ((100 - domStability) * 0.2)
```

Weights:
- Failure rate: 50% (most important indicator)
- Timing variance: 30% (execution consistency)
- DOM instability: 20% (structural consistency)

### Detection Threshold

- Minimum runs required: 5 executions
- Flaky classification: Has intermittent failures AND (high variance OR low DOM stability)
- Intermittent: 0 < failures < total runs

## API Endpoints

### Test Cases
- `GET /api/test-cases` - List all test cases
- `POST /api/test-cases` - Create new test case
- `GET /api/test-cases/:id` - Get test case details
- `GET /api/test-cases/:id/executions` - Get execution history

### Test Executions
- `POST /api/test-executions` - Record execution (triggers analysis)

### Flaky Tests
- `GET /api/flaky-tests` - List all active flaky tests
- `GET /api/flaky-tests/:id` - Get flaky test details
- `PATCH /api/flaky-tests/:id/resolve` - Mark as resolved

### Dashboard
- `GET /api/dashboard/stats` - Get summary statistics

## Data Schema

### Test Cases
```typescript
{
  id: string;
  name: string;
  url: string;
  instructions: string;
  createdAt: Date;
}
```

### Test Executions
```typescript
{
  id: string;
  testCaseId: string;
  status: "passed" | "failed" | "flaky";
  executionTime: number; // milliseconds
  errorMessage?: string;
  stackTrace?: string;
  domStabilityScore?: number; // 0-100
  networkCallCount?: number;
  waitConditionFailures?: number;
  assertionCount?: number;
  executedAt: Date;
}
```

### Flaky Tests
```typescript
{
  id: string;
  testCaseId: string;
  flakinessScore: number; // 0-100
  timingVariance: number; // percentage
  failureRate: number; // percentage
  totalRuns: number;
  failedRuns: number;
  rootCauses: RootCause[];
  lastFailedAt?: Date;
  isResolved: boolean;
  detectedAt: Date;
}
```

## Usage Flow

1. **Create Test Case**: Define URL and test instructions
2. **Execute Tests**: Submit multiple test execution results (minimum 5)
3. **Automatic Analysis**: System analyzes patterns after 5+ runs
4. **View Results**: Dashboard shows detected flaky tests with root causes
5. **Investigate**: Detailed view shows execution history and metrics
6. **Resolve**: Mark tests as fixed when issues are addressed

## Design Guidelines

- **Typography**: Inter for UI, JetBrains Mono for code
- **Color Scheme**: Blue primary (#3B82F6), semantic status colors
- **Components**: Minimal elevation, subtle borders, data-first layouts
- **Spacing**: Consistent 4/8/16px grid system

## Development

```bash
npm install
npm run dev
```

Access at: http://localhost:5000

## Future Enhancements

- Machine learning model training on historical data
- Advanced statistical analysis (Bayesian probability)
- Test isolation recommendations
- CI/CD pipeline integration
- Automated fix suggestions based on root causes
- Export reports to CSV/JSON
