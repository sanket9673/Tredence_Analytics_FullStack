import { WorkflowNode, WorkflowEdge } from '../types'

export const exportWorkflow = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const data = JSON.stringify({ nodes, edges }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workflow-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const parseImport = (content: string): { nodes: WorkflowNode[], edges: WorkflowEdge[] } => {
  try {
    const data = JSON.parse(content)
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Invalid format')
    }
    return { nodes: data.nodes, edges: data.edges }
  } catch (e) {
    throw new Error('Failed to parse workflow file')
  }
}
