import { ExecutionHistory } from '../execution-history'

const mockExecutions = [
  {
    id: "1",
    status: "passed" as const,
    executionTime: 1250,
    timestamp: "2 mins ago",
  },
  {
    id: "2",
    status: "failed" as const,
    executionTime: 2340,
    timestamp: "1 hour ago",
    errorMessage: "Element not found: #submit-button",
    stackTrace: "Error: Element not found\n  at waitForElement (test.js:45)\n  at login (test.js:12)",
  },
  {
    id: "3",
    status: "passed" as const,
    executionTime: 1180,
    timestamp: "3 hours ago",
  },
]

export default function ExecutionHistoryExample() {
  return (
    <div className="p-6">
      <ExecutionHistory executions={mockExecutions} />
    </div>
  )
}
