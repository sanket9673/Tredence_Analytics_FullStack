import { topologicalSort } from '../utils/graphValidation'
import type { SimulationStep } from '../types'

export function simulateExecution(workflow: { nodes: any[], edges: any[] }): SimulationStep[] {
  const order = topologicalSort(workflow)
  const nodeMap = new Map(workflow.nodes.map(n => [n.id, n]))

  return order.map((nodeId, index) => {
    const node = nodeMap.get(nodeId)
    if (!node) return null

    const baseTime = new Date()
    baseTime.setSeconds(baseTime.getSeconds() + index * 3)
    const timestamp = baseTime.toTimeString().slice(0, 8)

    const stepsByType: Record<string, { status: string; message: string }> = {
      start: { status: 'completed', message: `Workflow initiated: "${node.data.label}"` },
      task: { status: 'pending', message: `Awaiting action from ${node.data.assignee || 'assignee'}` },
      approval: { status: 'pending', message: `Pending ${node.data.approverRole || 'Manager'} approval` },
      automated: { status: 'executing', message: `Executing: ${node.data.actionId || 'automated action'}` },
      end: { status: 'completed', message: node.data.endMessage || 'Workflow completed successfully' },
    }

    const typeData = stepsByType[node.type] ?? { status: 'completed', message: 'Step completed' }

    return {
      stepIndex: index + 1,
      nodeId,
      nodeLabel: node.data.label,
      nodeType: node.type,
      ...typeData,
      timestamp,
    } as SimulationStep
  }).filter(Boolean) as SimulationStep[]
}
