import { useEffect, useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'

export function useAutoSave() {
  const { nodes, edges } = useWorkflowStore()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('hr-workflow-autosave', JSON.stringify({ nodes, edges, savedAt: new Date() }))
      setLastSaved(new Date())
    }, 2000)
    return () => clearTimeout(timer)
  }, [nodes, edges])

  return { lastSaved }
}
