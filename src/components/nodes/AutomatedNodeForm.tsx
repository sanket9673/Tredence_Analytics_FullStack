import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { automatedNodeSchema, AutomatedNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { useActions } from '../../hooks/useActions'
import type { WorkflowNode } from '../../types'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { isAutomatedNode } from '../../types'

interface AutomatedNodeFormProps {
  node: WorkflowNode
  onUpdate: (id: string, data: Partial<AutomatedNodeFormData>) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const AutomatedNodeForm: React.FC<AutomatedNodeFormProps> = ({ node, onUpdate, onDirtyChange }) => {
  const { pushNodeHistory } = useWorkflowStore()
  const data = isAutomatedNode(node.data)
    ? node.data
    : { type: 'automated' as const, id: node.id, label: node.data.label, actionId: '', actionParams: {} }
  const { actions, isLoading } = useActions()
  const [lastActionId, setLastActionId] = useState<string>(data.actionId)

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AutomatedNodeFormData>({
    resolver: zodResolver(automatedNodeSchema),
    defaultValues: {
      label: data.label,
      actionId: data.actionId ?? '',
      actionParams: data.actionParams ?? {},
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const watchedValues = watch()
  const watchedActionId = watch('actionId')
  const selectedAction = actions.find(a => a.id === watchedActionId)

  useEffect(() => {
    if (selectedAction && selectedAction.id !== lastActionId) {
      const emptyParams = Object.fromEntries(selectedAction.params.map(p => [p, '']))
      setValue('actionParams', emptyParams, { shouldDirty: true })
      setLastActionId(selectedAction.id)
    }
  }, [watchedActionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = automatedNodeSchema.safeParse(watchedValues)
      if (result.success) {
        pushNodeHistory(node.id, node.data)
        onUpdate(node.id, result.data)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

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
