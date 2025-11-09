import { TestExecutionChart } from '../test-execution-chart'

const mockData = [
  { date: "Mon", passed: 45, failed: 3, flaky: 2 },
  { date: "Tue", passed: 52, failed: 2, flaky: 3 },
  { date: "Wed", passed: 48, failed: 5, flaky: 1 },
  { date: "Thu", passed: 61, failed: 1, flaky: 2 },
  { date: "Fri", passed: 55, failed: 4, flaky: 3 },
]

export default function TestExecutionChartExample() {
  return (
    <div className="p-6">
      <TestExecutionChart data={mockData} />
    </div>
  )
}
