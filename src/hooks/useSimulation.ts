import { useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { postSimulate } from '../api/workflowApi'
import { validateWorkflowGraph } from '../utils/graphValidation'
import type { SimulationStep, ValidationError } from '../types'

export function useSimulation() {
  const { nodes, edges, setSimulationSteps } = useWorkflowStore()
  const [state, setState] = useState<'idle'|'validating'|'running'|'complete'|'error'>('idle')
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [visibleSteps, setVisibleSteps] = useState<SimulationStep[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])

  const run = async () => {
    setState('validating')
    const validationErrors = validateWorkflowGraph({ nodes, edges } as any)
    const hasErrors = validationErrors.some(e => e.severity === 'error')
    setErrors(validationErrors)
    if (hasErrors) { setState('error'); return }

    setState('running')
    setSteps([]); setVisibleSteps([])
    try {
      const result = await postSimulate({ nodes, edges })
      setSteps(result.steps)
      setSimulationSteps(result.steps) // Sync to global store if needed
      
      result.steps.forEach((step, i) => {
        setTimeout(() => {
          setVisibleSteps(prev => [...prev, step])
        }, i * 600)
      })
      setTimeout(() => setState('complete'), result.steps.length * 600 + 200)
    } catch (e: any) {
      setErrors([{ message: e.message || 'Simulation failed', severity: 'error' }])
      setState('error')
    }
  }

  const reset = () => { setState('idle'); setSteps([]); setVisibleSteps([]); setErrors([]) }

  return { state, steps: visibleSteps, totalSteps: steps.length, errors, run, reset }
}
