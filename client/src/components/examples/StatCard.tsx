import { StatCard } from '../stat-card'
import { FileText } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <StatCard
        title="Total Tests"
        value="1,234"
        subtitle="Last 30 days"
        icon={FileText}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Flaky Tests"
        value="23"
        subtitle="2% of total"
        icon={FileText}
      />
    </div>
  )
}
