import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export interface FlakyTestRow {
  id: string;
  name: string;
  flakinessScore: number;
  failureRate: number;
  lastFailed: string;
  rootCause: string;
  totalRuns: number;
  failedRuns: number;
}

interface FlakyTestTableProps {
  tests: FlakyTestRow[];
  title?: string;
}

export function FlakyTestTable({ tests, title = "Flaky Tests" }: FlakyTestTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium w-8"></th>
                <th className="pb-3 font-medium">Test Name</th>
                <th className="pb-3 font-medium text-right">Flakiness</th>
                <th className="pb-3 font-medium text-right">Failure Rate</th>
                <th className="pb-3 font-medium">Last Failed</th>
                <th className="pb-3 font-medium">Root Cause</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <>
                  <tr
                    key={test.id}
                    className="border-b hover-elevate cursor-pointer"
                    onClick={() => toggleRow(test.id)}
                    data-testid={`row-test-${test.id}`}
                  >
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        data-testid={`button-expand-${test.id}`}
                      >
                        {expandedRows.has(test.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="py-3">
                      <code className="text-xs font-mono" data-testid={`text-test-name-${test.id}`}>
                        {test.name}
                      </code>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${test.flakinessScore > 75 ? 'text-red-600 dark:text-red-400' : test.flakinessScore > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                        {test.flakinessScore}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm">
                        {test.failedRuns}/{test.totalRuns}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {test.lastFailed}
                    </td>
                    <td className="py-3">
                      <StatusBadge status="flaky" />
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/test/${test.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${test.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                  {expandedRows.has(test.id) && (
                    <tr>
                      <td colSpan={7} className="py-3 px-4 bg-muted/30">
                        <div className="text-sm space-y-2">
                          <p>
                            <span className="font-medium">Root Cause:</span> {test.rootCause}
                          </p>
                          <p>
                            <span className="font-medium">Statistics:</span> {test.failedRuns} failures out of {test.totalRuns} runs ({test.failureRate}% failure rate)
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
