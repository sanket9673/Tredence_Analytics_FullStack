import { useState, useEffect } from 'react'
import { getAutomations } from '../api/workflowApi'
import type { AutomationAction } from '../types'

export function useActions() {
  const [actions, setActions] = useState<AutomationAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAutomations()
      .then(setActions)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { actions, isLoading, error }
}
