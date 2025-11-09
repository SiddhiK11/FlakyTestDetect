import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Layout, Zap, Network } from "lucide-react";
import { ProgressIndicator } from "./progress-indicator";

export interface RootCauseItem {
  type: "timing" | "dom" | "concurrency" | "resource";
  confidence: number;
  description: string;
  location?: string;
}

interface RootCausePanelProps {
  rootCauses: RootCauseItem[];
}

const iconMap = {
  timing: Clock,
  dom: Layout,
  concurrency: Zap,
  resource: Network,
};

const typeLabels = {
  timing: "Async Timing Issue",
  dom: "DOM Instability",
  concurrency: "Concurrency Problem",
  resource: "Resource Dependency",
};

export function RootCausePanel({ rootCauses }: RootCausePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Root Cause Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rootCauses.map((cause, index) => {
          const Icon = iconMap[cause.type];
          return (
            <div
              key={index}
              className="space-y-2 p-4 rounded-md border hover-elevate"
              data-testid={`root-cause-${cause.type}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-medium">{typeLabels[cause.type]}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cause.description}
                    </p>
                    {cause.location && (
                      <code className="text-xs font-mono text-muted-foreground mt-1 block">
                        {cause.location}
                      </code>
                    )}
                  </div>
                  <ProgressIndicator
                    value={cause.confidence}
                    label="Confidence"
                    variant={
                      cause.confidence > 75
                        ? "success"
                        : cause.confidence > 50
                        ? "warning"
                        : "default"
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
