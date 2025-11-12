import { useQuery } from "@tanstack/react-query";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { TestExecutionChart } from "@/components/test-execution-chart";
import { FlakyTestTable } from "@/components/flaky-test-table";
import { formatDistanceToNow } from "date-fns";

const mockChartData = [
  { date: "Mon", passed: 145, failed: 8, flaky: 5 },
  { date: "Tue", passed: 152, failed: 6, flaky: 7 },
  { date: "Wed", passed: 148, failed: 12, flaky: 4 },
  { date: "Thu", passed: 161, failed: 5, flaky: 6 },
  { date: "Fri", passed: 155, failed: 9, flaky: 8 },
  { date: "Sat", passed: 143, failed: 4, flaky: 3 },
  { date: "Sun", passed: 139, failed: 7, flaky: 5 },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: flakyTests = [], isLoading: flakyTestsLoading } = useQuery({
    queryKey: ["/api/flaky-tests"],
  });

  const { data: allTestCases = [] } = useQuery({
    queryKey: ["/api/test-cases"],
  });

  const recentFlakyTests = flakyTests.slice(0, 3).map((test: any) => ({
    id: String(test.id),
    name: allTestCases.find((tc: any) => tc.id === test.testCaseId)?.title || `Test Case #${test.testCaseId}`,
    flakinessScore: Math.round(test.flakinessScore),
    failureRate: Math.round(test.failureRate),
    lastFailed: test.lastFailedAt 
      ? formatDistanceToNow(new Date(test.lastFailedAt), { addSuffix: true })
      : "Never",
    rootCause: test.rootCauses?.[0]?.description || "Unknown",
    totalRuns: test.totalRuns,
    failedRuns: test.failedRuns,
  }));

  const totalTests = stats?.totalTests || 0;
  const flakyCount = stats?.flakyTestCount || 0;
  const flakyPercentage = stats?.flakyPercentage || 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="heading-dashboard">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of test execution and flaky test detection
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Test Cases"
          value={statsLoading ? "..." : String(totalTests)}
          subtitle="In database"
          icon={FileText}
        />
        <StatCard
          title="Flaky Tests Detected"
          value={statsLoading ? "..." : String(flakyCount)}
          subtitle={`${flakyPercentage.toFixed(1)}% of total`}
          icon={AlertTriangle}
        />
        <StatCard
          title="Success Rate"
          value={statsLoading ? "..." : `${(100 - flakyPercentage).toFixed(1)}%`}
          subtitle="Non-flaky tests"
          icon={CheckCircle}
        />
        <StatCard
          title="Avg Execution Time"
          value="1.2s"
          subtitle="Per test"
          icon={Clock}
        />
      </div>

      <TestExecutionChart data={mockChartData} />

      {flakyTestsLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading flaky tests...</div>
      ) : (
        <FlakyTestTable tests={recentFlakyTests} title="Recent Flaky Tests" />
      )}
    </div>
  );
}
