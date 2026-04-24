import { useState, useCallback } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { validateWorkflowGraph } from '../utils/graphValidation'
import { postSimulate } from '../api/workflowApi'
import type { SimulationStep, ValidationError } from '../types'

type SimState = 'idle' | 'validating' | 'running' | 'complete' | 'error'

export function useSimulation() {
  const { nodes, edges, setSimulationSteps, setHighlightedNodeId, clearHighlight } = useWorkflowStore()
  const [state, setState] = useState<SimState>('idle')
  const [visibleSteps, setVisibleSteps] = useState<SimulationStep[]>([])
  const [totalSteps, setTotalSteps] = useState(0)
  const [errors, setErrors] = useState<ValidationError[]>([])

  const highlightNode = useCallback((nodeId: string) => {
    setHighlightedNodeId(nodeId)
    setTimeout(() => clearHighlight(), 500)
  }, [setHighlightedNodeId, clearHighlight])

  const run = useCallback(async () => {
    setState('validating')
    setVisibleSteps([])
    setErrors([])

    const validationErrors = validateWorkflowGraph({ nodes, edges })
    const criticalErrors = validationErrors.filter(e => e.severity === 'error')
    setErrors(validationErrors)
    if (criticalErrors.length > 0) {
      setState('error')
      return
    }

    setState('running')
    try {
      const result = await postSimulate({ nodes, edges })
      setTotalSteps(result.steps.length)
      setSimulationSteps(result.steps)

      result.steps.forEach((step, i) => {
        setTimeout(() => {
          setVisibleSteps(prev => [...prev, step])
          highlightNode(step.nodeId)
          setTimeout(() => {
            if (i === result.steps.length - 1) {
              clearHighlight()
              setState('complete')
            }
          }, 400)
        }, i * 700)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Simulation failed'
      setErrors([{ message, severity: 'error' }])
      setState('error')
      clearHighlight()
    }
  }, [nodes, edges, setSimulationSteps, highlightNode, clearHighlight])

  const reset = useCallback(() => {
    setState('idle')
    setVisibleSteps([])
    setErrors([])
    clearHighlight()
  }, [clearHighlight])

  return { state, steps: visibleSteps, totalSteps, errors, run, reset }
}
