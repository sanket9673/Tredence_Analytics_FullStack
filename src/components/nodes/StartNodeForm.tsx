import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { startNodeSchema, StartNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { Input } from '../ui/Input'
import { KeyValueEditor } from '../ui/KeyValueEditor'
import { WorkflowNode } from '../../types'

interface StartNodeFormProps {
  node: WorkflowNode
}

export const StartNodeForm: React.FC<StartNodeFormProps> = ({ node }) => {
  const { updateNodeData } = useWorkflowStore()
  const data = node.data as any

  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useForm<StartNodeFormData>({
    resolver: zodResolver(startNodeSchema) as any,
    defaultValues: {
      label: data.label,
      metadata: data.metadata || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'metadata'
  })

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = startNodeSchema.safeParse(values)
      if (parsed.success) {
        const timeoutId = setTimeout(() => {
          updateNodeData(node.id, parsed.data)
        }, 300)
        return () => clearTimeout(timeoutId)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, node.id, updateNodeData])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Node Label</label>
        <Input {...register('label')} error={errors.label?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Metadata Fields</label>
        <div className="text-xs text-slate-500 mb-2">Variables injected when the workflow starts</div>
        <KeyValueEditor
          fields={fields}
          onAdd={() => append({ key: '', value: '' })}
          onRemove={remove}
          register={register}
          name="metadata"
          errors={errors.metadata as any}
        />
      </div>
    </div>
  )
}
