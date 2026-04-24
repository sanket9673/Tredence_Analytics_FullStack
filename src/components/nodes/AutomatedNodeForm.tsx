import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { automatedNodeSchema, AutomatedNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { getAutomations } from '../../api/workflowApi'
import type { AutomationAction, WorkflowNode } from '../../types'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

interface AutomatedNodeFormProps {
  node: WorkflowNode
}

export const AutomatedNodeForm: React.FC<AutomatedNodeFormProps> = ({ node }) => {
  const { updateNodeData, pushNodeHistory } = useWorkflowStore()
  const data = node.data as any

  const [actions, setActions] = useState<AutomationAction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAutomations()
      .then(setActions)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AutomatedNodeFormData>({
    resolver: zodResolver(automatedNodeSchema) as any,
    defaultValues: {
      label: data.label,
      actionId: data.actionId || '',
      actionParams: data.actionParams || {}
    }
  })

  const watchedActionId = watch('actionId')
  const selectedAction = actions.find(a => a.id === watchedActionId)

  useEffect(() => {
    if (selectedAction && selectedAction.id !== data.actionId) {
      const emptyParams = Object.fromEntries(selectedAction.params.map(p => [p, '']))
      setValue('actionParams', emptyParams, { shouldDirty: true })
    }
  }, [selectedAction?.id, data.actionId, setValue])

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = automatedNodeSchema.safeParse(values)
      if (parsed.success) {
        const timeoutId = setTimeout(() => {
          pushNodeHistory(node.id, node.data)
          updateNodeData(node.id, parsed.data)
        }, 300)
        return () => clearTimeout(timeoutId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, node.id, updateNodeData, pushNodeHistory, node.data])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Automation Name</label>
        <Input {...register('label')} error={errors.label?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Action Type</label>
        {isLoading ? (
          <div className="h-10 bg-slate-100 rounded-md animate-pulse" />
        ) : (
          <Select
            {...register('actionId')}
            error={errors.actionId?.message}
            options={[
              { value: '', label: 'Select an action...' },
              ...actions.map(a => ({ value: a.id, label: a.label }))
            ]}
          />
        )}
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800">Action Parameters</h4>
          {selectedAction.params.map(param => (
            <div key={param} className="space-y-1">
              <label className="text-xs font-medium text-slate-600 capitalize">
                {param.replace(/_/g, ' ')}
              </label>
              <Controller
                name={`actionParams.${param}`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input {...field} placeholder={`Enter ${param.replace(/_/g, ' ')}`} />
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
