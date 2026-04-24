import type { AutomationAction, SimulationResult, WorkflowNode, WorkflowEdge } from '../types'

interface WorkflowPayload {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export async function getAutomations(): Promise<AutomationAction[]> {
  const res = await fetch('/automations')
  if (!res.ok) throw new Error(`Failed to fetch automations: ${res.status}`)
  return res.json() as Promise<AutomationAction[]>
}

export async function postSimulate(workflow: WorkflowPayload): Promise<SimulationResult> {
  const res = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  })
  if (!res.ok) {
    const err = await res.json() as { errors?: Array<{ message: string }> }
    throw new Error(err.errors?.[0]?.message ?? `Simulation failed: ${res.status}`)
  }
  return res.json() as Promise<SimulationResult>
}

export async function getWorkflows(): Promise<Array<{ id: string; name: string; nodeCount: number; updatedAt: string }>> {
  const res = await fetch('/workflows')
  if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`)
  return res.json() as Promise<Array<{ id: string; name: string; nodeCount: number; updatedAt: string }>>
}

export async function saveWorkflow(workflow: WorkflowPayload & { name: string }): Promise<{ id: string }> {
  const res = await fetch('/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  })
  if (!res.ok) throw new Error(`Failed to save workflow: ${res.status}`)
  return res.json() as Promise<{ id: string }>
}
