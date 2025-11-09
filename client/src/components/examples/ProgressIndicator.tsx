import { ProgressIndicator, CircularProgress } from '../progress-indicator'

export default function ProgressIndicatorExample() {
  return (
    <div className="p-6 space-y-6">
      <ProgressIndicator value={75} label="Confidence Score" variant="success" />
      <ProgressIndicator value={45} label="DOM Stability" variant="warning" />
      <div className="flex gap-6">
        <CircularProgress value={85} />
        <CircularProgress value={60} />
      </div>
    </div>
  )
}
