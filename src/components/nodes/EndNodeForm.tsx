import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { endNodeSchema, EndNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { WorkflowNode } from '../../types'

interface EndNodeFormProps {
  node: WorkflowNode
}

export const EndNodeForm: React.FC<EndNodeFormProps> = ({ node }) => {
  const { updateNodeData } = useWorkflowStore()
  const data = node.data as any

  const {
    register,
    watch,
    formState: { errors }
  } = useForm<EndNodeFormData>({
    resolver: zodResolver(endNodeSchema) as any,
    defaultValues: {
      label: data.label,
      endMessage: data.endMessage || '',
      summaryFlag: data.summaryFlag || false
    }
  })

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = endNodeSchema.safeParse(values)
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
        <label className="text-sm font-medium text-slate-700">End State Label</label>
        <Input {...register('label')} error={errors.label?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Completion Message</label>
        <textarea
          {...register('endMessage')}
          className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Message to display when workflow finishes..."
        />
      </div>

      <div className="pt-2">
        <Toggle
          {...register('summaryFlag')}
          label="Generate execution summary report"
        />
      </div>
    </div>
  )
}
