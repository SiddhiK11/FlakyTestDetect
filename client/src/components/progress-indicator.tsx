import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

export function ProgressIndicator({
  value,
  label,
  showPercentage = true,
  variant = "default",
}: ProgressIndicatorProps) {
  const getColor = () => {
    if (variant === "success") return "bg-green-600";
    if (variant === "warning") return "bg-amber-600";
    if (variant === "danger") return "bg-red-600";
    return "bg-primary";
  };

  return (
    <div className="space-y-2" data-testid="progress-indicator">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium" data-testid="text-progress-value">
              {value}%
            </span>
          )}
        </div>
      )}
      <Progress value={value} className="h-2">
        <div
          className={`h-full ${getColor()} transition-all rounded-full`}
          style={{ width: `${value}%` }}
        />
      </Progress>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>
      <span className="absolute text-lg font-bold">{value}%</span>
    </div>
  );
}
