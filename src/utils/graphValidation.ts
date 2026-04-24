import type { ValidationError } from '../types'

interface WorkflowGraph {
  nodes: Array<{ id: string; type: string; data: { label: string } }>
  edges: Array<{ id: string; source: string; target: string }>
}

export function validateWorkflowGraph(workflow: WorkflowGraph): ValidationError[] {
  const errors: ValidationError[] = []
  const { nodes, edges } = workflow

  const startNodes = nodes.filter(n => n.type === 'start')
  if (startNodes.length === 0) {
    errors.push({ message: 'Workflow must have a Start node', severity: 'error' })
  } else if (startNodes.length > 1) {
    startNodes.forEach(n => errors.push({ nodeId: n.id, message: 'Only one Start node allowed', severity: 'error' }))
  }

  const endNodes = nodes.filter(n => n.type === 'end')
  if (endNodes.length === 0) {
    errors.push({ message: 'Workflow must have at least one End node', severity: 'error' })
  }

  const adj = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  nodes.forEach(n => { adj.set(n.id, []); inDegree.set(n.id, 0) })
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  })

  const connectedNodes = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)])
  nodes.forEach(n => {
    if (!connectedNodes.has(n.id) && n.type !== 'start' && nodes.length > 1) {
      errors.push({ nodeId: n.id, message: `"${n.data.label}" is not connected`, severity: 'error' })
    }
  })

  startNodes.forEach(n => {
    if ((adj.get(n.id)?.length ?? 0) === 0) {
      errors.push({ nodeId: n.id, message: 'Start node has no outgoing connections', severity: 'error' })
    }
  })

  endNodes.forEach(n => {
    if ((adj.get(n.id)?.length ?? 0) > 0) {
      errors.push({ nodeId: n.id, message: 'End node cannot have outgoing connections', severity: 'warning' })
    }
  })

  const visited = new Set<string>()
  const recStack = new Set<string>()

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId)
    recStack.add(nodeId)
    for (const neighbor of (adj.get(nodeId) ?? [])) {
      if (!visited.has(neighbor) && hasCycleDFS(neighbor)) return true
      if (recStack.has(neighbor)) return true
    }
    recStack.delete(nodeId)
    return false
  }

  nodes.forEach(n => {
    if (!visited.has(n.id) && hasCycleDFS(n.id)) {
      errors.push({ nodeId: n.id, message: 'Workflow contains a cycle', severity: 'error' })
    }
  })

  return errors
}

export function topologicalSort(workflow: WorkflowGraph): string[] {
  const { nodes, edges } = workflow
  const adj = new Map<string, string[]>()
  const inDeg = new Map<string, number>()
  nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0) })
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target)
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1)
  })

  const queue: string[] = []
  inDeg.forEach((deg, id) => { if (deg === 0) queue.push(id) })
  const order: string[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    order.push(nodeId)
    for (const neighbor of (adj.get(nodeId) ?? [])) {
      const newDeg = (inDeg.get(neighbor) ?? 0) - 1
      inDeg.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  return order
}
