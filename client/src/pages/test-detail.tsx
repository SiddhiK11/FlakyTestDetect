import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { RootCausePanel } from "@/components/root-cause-panel";
import { ExecutionHistory } from "@/components/execution-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressIndicator, CircularProgress } from "@/components/progress-indicator";
import { RefreshCw, Archive, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TestDetail() {
  const [, params] = useRoute("/test/:id");
  const testCaseId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();

  const { data: testCase, isLoading: testCaseLoading } = useQuery({
    queryKey: ["/api/test-cases", testCaseId],
    enabled: testCaseId > 0,
  });

  const { data: flakyTest, isLoading: flakyTestLoading } = useQuery({
    queryKey: ["/api/flaky-tests"],
  });

  const { data: executions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ["/api/test-cases", testCaseId, "executions"],
    enabled: testCaseId > 0,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/test-cases/${testCaseId}/analyze`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flaky-tests"] });
      toast({
        title: "Analysis Complete",
        description: "Test case has been analyzed for flakiness",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze test case",
        variant: "destructive",
      });
    },
  });

  const currentFlakyTest = flakyTest?.find((ft: any) => ft.testCaseId === testCaseId);

  const formattedExecutions = executions.slice(0, 20).map((exec: any) => ({
    id: String(exec.id),
    status: exec.status,
    executionTime: exec.executionTime,
    timestamp: formatDistanceToNow(new Date(exec.executedAt), { addSuffix: true }),
    errorMessage: exec.errorMessage,
    stackTrace: exec.stackTrace,
  }));

  const timingData = executions.slice(0, 10).map((exec: any, index: number) => ({
    run: executions.length - index,
    time: exec.executionTime,
  })).reverse();

  if (testCaseLoading || flakyTestLoading || executionsLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-8 text-muted-foreground">Loading test details...</div>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="p-8">
        <div className="text-center py-8 text-muted-foreground">Test case not found</div>
      </div>
    );
  }

  const status = currentFlakyTest ? ("flaky" as const) : ("passed" as const);
  const flakinessScore = currentFlakyTest?.flakinessScore || 0;
  const totalRuns = currentFlakyTest?.totalRuns || executions.length;
  const failedRuns = currentFlakyTest?.failedRuns || executions.filter((e: any) => e.status === "failed").length;
  const successRate = totalRuns > 0 ? ((totalRuns - failedRuns) / totalRuns) * 100 : 100;
  const lastExecution = executions[0];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-mono" data-testid="heading-test-name">
              {testCase.title}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Type: <code className="font-mono">{testCase.type}</code> | Priority: <code className="font-mono">{testCase.priority}</code>
          </p>
          {lastExecution && (
            <p className="text-sm text-muted-foreground">
              Last run: {formatDistanceToNow(new Date(lastExecution.executedAt), { addSuffix: true })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            data-testid="button-rerun"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Analyze Test
          </Button>
          <Button variant="outline" data-testid="button-mark-fixed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Fixed
          </Button>
          <Button variant="outline" data-testid="button-archive">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Flakiness Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <CircularProgress value={Math.round(flakinessScore)} size={120} />
            </div>
            <div className="space-y-3">
              <ProgressIndicator
                value={Math.round(successRate)}
                label="Success Rate"
                variant="success"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Runs</span>
                <span className="font-medium">{totalRuns}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failed Runs</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {failedRuns}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Execution Time Variance</CardTitle>
          </CardHeader>
          <CardContent>
            {timingData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timingData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="run"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="time"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-4">
                  {currentFlakyTest 
                    ? `Timing variance: ${Math.round(currentFlakyTest.timingVariance)}%`
                    : "Execution time tracking across recent runs"}
                </p>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No execution data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {currentFlakyTest && currentFlakyTest.rootCauses && (
        <RootCausePanel rootCauses={currentFlakyTest.rootCauses} />
      )}

      <ExecutionHistory executions={formattedExecutions} />
    </div>
  );
}
