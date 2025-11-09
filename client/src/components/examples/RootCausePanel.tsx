import { RootCausePanel } from '../root-cause-panel'

const mockRootCauses = [
  {
    type: "timing" as const,
    confidence: 85,
    description: "Wait conditions failing due to variable API response times",
    location: "Line 45: waitForElement('#login-button')",
  },
  {
    type: "dom" as const,
    confidence: 72,
    description: "Element selector inconsistent across page loads",
    location: "Line 78: querySelector('.user-menu')",
  },
]

export default function RootCausePanelExample() {
  return (
    <div className="p-6">
      <RootCausePanel rootCauses={mockRootCauses} />
    </div>
  )
}
