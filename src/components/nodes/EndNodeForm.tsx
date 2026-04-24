import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { endNodeSchema, EndNodeFormData } from '../../types/schemas'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { WorkflowNode, isEndNode } from '../../types'

interface EndNodeFormProps {
  node: WorkflowNode
  onUpdate: (id: string, data: Partial<EndNodeFormData>) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const EndNodeForm: React.FC<EndNodeFormProps> = ({ node, onUpdate, onDirtyChange }) => {
  const data = isEndNode(node.data)
    ? node.data
    : { type: 'end' as const, id: node.id, label: node.data.label, endMessage: '', summaryFlag: false }

  const {
    register,
    watch,
    formState: { errors, isDirty },
  } = useForm<EndNodeFormData>({
    resolver: zodResolver(endNodeSchema),
    defaultValues: {
      label: data.label,
      endMessage: data.endMessage ?? '',
      summaryFlag: data.summaryFlag ?? false,
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const watchedValues = watch()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = endNodeSchema.safeParse(watchedValues)
      if (result.success) {
        onUpdate(node.id, result.data)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

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
