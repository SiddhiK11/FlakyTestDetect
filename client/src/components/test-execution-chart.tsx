import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExecutionData {
  date: string;
  passed: number;
  failed: number;
  flaky: number;
}

interface TestExecutionChartProps {
  data: ExecutionData[];
}

export function TestExecutionChart({ data }: TestExecutionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Test Execution Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
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
            <Legend />
            <Bar dataKey="passed" fill="rgb(34, 197, 94)" name="Passed" />
            <Bar dataKey="failed" fill="rgb(239, 68, 68)" name="Failed" />
            <Bar dataKey="flaky" fill="rgb(245, 158, 11)" name="Flaky" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
