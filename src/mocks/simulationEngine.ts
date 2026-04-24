import { topologicalSort } from '../utils/graphValidation'
import type { SimulationStep, WorkflowNode, WorkflowEdge, NodeType } from '../types'

interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export function simulateExecution(workflow: WorkflowGraph): SimulationStep[] {
  const order = topologicalSort(workflow)
  const nodeMap = new Map(workflow.nodes.map(n => [n.id, n]))

  return order.map((nodeId, index) => {
    const node = nodeMap.get(nodeId)
    if (!node) return null

    const baseTime = new Date()
    baseTime.setSeconds(baseTime.getSeconds() + index * 3)
    const timestamp = baseTime.toTimeString().slice(0, 8)

    type StepInfo = Pick<SimulationStep, 'status' | 'message'>
    const stepsByType: Record<NodeType, StepInfo> = {
      start: { status: 'completed', message: `Workflow initiated: "${node.data.label}"` },
      task: {
        status: 'pending',
        message: `Awaiting action from ${'assignee' in node.data ? node.data.assignee || 'assignee' : 'assignee'}`
      },
      approval: {
        status: 'pending',
        message: `Pending ${'approverRole' in node.data ? node.data.approverRole : 'Manager'} approval`
      },
      automated: {
        status: 'executing',
        message: `Executing: ${'actionId' in node.data ? node.data.actionId || 'automated action' : 'automated action'}`
      },
      end: {
        status: 'completed',
        message: 'endMessage' in node.data && node.data.endMessage
          ? node.data.endMessage
          : 'Workflow completed successfully'
      },
    }

    return {
      stepIndex: index + 1,
      nodeId,
      nodeLabel: node.data.label,
      nodeType: node.type,
      ...stepsByType[node.type],
      timestamp,
    } satisfies SimulationStep
  }).filter((s): s is SimulationStep => s !== null)
}
