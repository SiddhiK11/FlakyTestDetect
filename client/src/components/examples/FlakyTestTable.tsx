import { FlakyTestTable } from '../flaky-test-table'

const mockTests = [
  {
    id: "1",
    name: "test_user_login_flow",
    flakinessScore: 85,
    failureRate: 35,
    lastFailed: "2 hours ago",
    rootCause: "Async timing issue with API response",
    totalRuns: 20,
    failedRuns: 7,
  },
  {
    id: "2",
    name: "test_checkout_process",
    flakinessScore: 62,
    failureRate: 28,
    lastFailed: "5 hours ago",
    rootCause: "DOM element not found intermittently",
    totalRuns: 25,
    failedRuns: 7,
  },
]

export default function FlakyTestTableExample() {
  return (
    <div className="p-6">
      <FlakyTestTable tests={mockTests} />
    </div>
  )
}
