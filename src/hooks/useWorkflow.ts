import { useCallback } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { NodeType, WorkflowNode } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const useWorkflow = () => {
  const { addNode, deleteNode } = useWorkflowStore()

  const createNode = useCallback((type: NodeType, position: { x: number, y: number }): WorkflowNode => {
    return {
      id: uuidv4(),
      type,
      position,
      data: { id: uuidv4(), label: `New ${type} node` } as any
    }
  }, [])

  return { createNode, addNode, deleteNode }
}
