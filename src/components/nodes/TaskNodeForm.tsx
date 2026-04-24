import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskNodeSchema, TaskNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { Input } from '../ui/Input'
import { KeyValueEditor } from '../ui/KeyValueEditor'
import { WorkflowNode } from '../../types'

interface TaskNodeFormProps {
  node: WorkflowNode
}

export const TaskNodeForm: React.FC<TaskNodeFormProps> = ({ node }) => {
  const { updateNodeData } = useWorkflowStore()
  const data = node.data as any

  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useForm<TaskNodeFormData>({
    resolver: zodResolver(taskNodeSchema) as any,
    defaultValues: {
      label: data.label,
      description: data.description || '',
      assignee: data.assignee || '',
      dueDate: data.dueDate || '',
      customFields: data.customFields || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFields'
  })

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = taskNodeSchema.safeParse(values)
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
          register={register}
          name="customFields"
          errors={errors.customFields as any}
        />
      </div>
    </div>
  )
}
