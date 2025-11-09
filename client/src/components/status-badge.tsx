import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "passed" | "failed" | "flaky" | "analyzing";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  passed: {
    label: "Passed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  flaky: {
    label: "Flaky",
    icon: AlertCircle,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  analyzing: {
    label: "Analyzing",
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ""}`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className={`h-3 w-3 mr-1 ${status === "analyzing" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
