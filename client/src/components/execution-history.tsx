import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface ExecutionRecord {
  id: string;
  status: "passed" | "failed" | "flaky";
  executionTime: number;
  timestamp: string;
  errorMessage?: string;
  stackTrace?: string;
}

interface ExecutionHistoryProps {
  executions: ExecutionRecord[];
}

export function ExecutionHistory({ executions }: ExecutionHistoryProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {executions.map((execution) => (
            <div
              key={execution.id}
              className="border rounded-md hover-elevate"
              data-testid={`execution-${execution.id}`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => execution.errorMessage && toggleExpanded(execution.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {execution.errorMessage && (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {expandedIds.has(execution.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <StatusBadge status={execution.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {execution.executionTime}ms
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {execution.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {expandedIds.has(execution.id) && execution.errorMessage && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Error:</span> {execution.errorMessage}
                  </div>
                  {execution.stackTrace && (
                    <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{execution.stackTrace}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
