import React, { useEffect } from 'react'
import { useForm, useFieldArray, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskNodeSchema, TaskNodeFormData } from '../../types/schemas'
import { Input } from '../ui/Input'
import { KeyValueEditor } from '../ui/KeyValueEditor'
import { WorkflowNode, isTaskNode } from '../../types'

interface TaskNodeFormProps {
  node: WorkflowNode
  onUpdate: (id: string, data: Partial<TaskNodeFormData>) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const TaskNodeForm: React.FC<TaskNodeFormProps> = ({ node, onUpdate, onDirtyChange }) => {
  const data = isTaskNode(node.data)
    ? node.data
    : { type: 'task' as const, id: node.id, label: node.data.label, description: '', assignee: '', dueDate: '', customFields: [] }

  const {
    register,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaskNodeFormData>({
    resolver: zodResolver(taskNodeSchema),
    defaultValues: {
      label: data.label,
      description: data.description ?? '',
      assignee: data.assignee ?? '',
      dueDate: data.dueDate ?? '',
      customFields: data.customFields ?? [],
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFields',
  })

  const watchedValues = watch()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = taskNodeSchema.safeParse(watchedValues)
      if (result.success) {
        onUpdate(node.id, result.data)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Task Title</label>
        <Input {...register('label')} error={errors.label?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          {...register('description')}
          className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task instructions..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Assignee</label>
        <Input {...register('assignee')} placeholder="e.g. John Smith" error={errors.assignee?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Due Date</label>
        <Input type="date" {...register('dueDate')} error={errors.dueDate?.message} />
      </div>

      <div className="space-y-1 pt-2">
        <label className="text-sm font-medium text-slate-700">Custom Fields</label>
        <KeyValueEditor
          fields={fields}
          onAdd={() => append({ key: '', value: '' })}
          onRemove={remove}
          register={register as unknown as UseFormRegister<Record<string, unknown>>}
          name="customFields"
          errors={errors.customFields as unknown as FieldErrors<Record<string, unknown>>[string]}
        />
      </div>
    </div>
  )
}
