import { StatusBadge } from '../status-badge'

export default function StatusBadgeExample() {
  return (
    <div className="p-6 flex gap-3">
      <StatusBadge status="passed" />
      <StatusBadge status="failed" />
      <StatusBadge status="flaky" />
      <StatusBadge status="analyzing" />
    </div>
  )
}
