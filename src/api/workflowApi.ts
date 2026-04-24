import type { AutomationAction, SimulationResult } from '../types'

export async function getAutomations(): Promise<AutomationAction[]> {
  const res = await fetch('/automations')
  if (!res.ok) throw new Error('Failed to fetch automations')
  return res.json()
}

export async function postSimulate(workflow: { nodes: any[], edges: any[] }): Promise<SimulationResult> {
  const res = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.errors?.[0]?.message ?? 'Simulation failed')
  }
  return res.json()
}
