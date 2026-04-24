import React, { useEffect } from 'react'
import { useForm, useFieldArray, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { startNodeSchema, StartNodeFormData } from '../../types/schemas'
import { Input } from '../ui/Input'
import { KeyValueEditor } from '../ui/KeyValueEditor'
import { WorkflowNode, isStartNode } from '../../types'

interface StartNodeFormProps {
  node: WorkflowNode
  onUpdate: (id: string, data: Partial<StartNodeFormData>) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const StartNodeForm: React.FC<StartNodeFormProps> = ({ node, onUpdate, onDirtyChange }) => {
  const data = isStartNode(node.data) ? node.data : { type: 'start' as const, id: node.id, label: node.data.label, metadata: [] }

  const {
    register,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<StartNodeFormData>({
    resolver: zodResolver(startNodeSchema),
    defaultValues: {
      label: data.label,
      metadata: data.metadata ?? [],
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'metadata',
  })

  const watchedValues = watch()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = startNodeSchema.safeParse(watchedValues)
      if (result.success) {
        onUpdate(node.id, result.data)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

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
          register={register as unknown as UseFormRegister<Record<string, unknown>>}
          name="metadata"
          errors={errors.metadata as unknown as FieldErrors<Record<string, unknown>>[string]}
        />
      </div>
    </div>
  )
}
