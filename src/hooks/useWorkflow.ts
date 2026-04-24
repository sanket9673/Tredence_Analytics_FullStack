import { useCallback } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { NodeType, WorkflowNode, AnyNodeData } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const useWorkflow = () => {
  const { addNode, removeNode } = useWorkflowStore()

  const buildData = (type: NodeType, id: string): AnyNodeData => {
    if (type === 'start') return { id, type: 'start', label: 'New start node', metadata: [] }
    if (type === 'task') return { id, type: 'task', label: 'New task node', description: '', assignee: '', dueDate: '', customFields: [] }
    if (type === 'approval') return { id, type: 'approval', label: 'New approval node', approverRole: 'Manager', autoApproveThreshold: 80 }
    if (type === 'automated') return { id, type: 'automated', label: 'New automated node', actionId: '', actionParams: {} }
    return { id, type: 'end', label: 'New end node', endMessage: '', summaryFlag: false }
  }

  const createNode = useCallback((type: NodeType, position: { x: number, y: number }): WorkflowNode => {
    const id = uuidv4()
    return {
      id,
      type,
      position,
      data: buildData(type, id),
    }
  }, [])

  return { createNode, addNode, removeNode }
}
