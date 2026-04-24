import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { approvalNodeSchema, ApprovalNodeFormData } from '../../types/schemas'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { WorkflowNode, isApprovalNode } from '../../types'

interface ApprovalNodeFormProps {
  node: WorkflowNode
  onUpdate: (id: string, data: Partial<ApprovalNodeFormData>) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const ApprovalNodeForm: React.FC<ApprovalNodeFormProps> = ({ node, onUpdate, onDirtyChange }) => {
  const data = isApprovalNode(node.data)
    ? node.data
    : { type: 'approval' as const, id: node.id, label: node.data.label, approverRole: 'Manager' as const, autoApproveThreshold: 80 }

  const {
    register,
    watch,
    formState: { errors, isDirty },
  } = useForm<ApprovalNodeFormData>({
    resolver: zodResolver(approvalNodeSchema),
    defaultValues: {
      label: data.label,
      approverRole: data.approverRole ?? 'Manager',
      autoApproveThreshold: data.autoApproveThreshold ?? 80,
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const watchedValues = watch()
  const thresholdValue = watch('autoApproveThreshold')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = approvalNodeSchema.safeParse(watchedValues)
      if (result.success) {
        onUpdate(node.id, result.data)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Approval Step Name</label>
        <Input {...register('label')} error={errors.label?.message} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Approver Role</label>
        <Select
          {...register('approverRole')}
          error={errors.approverRole?.message}
          options={[
            { value: 'Manager', label: 'Manager' },
            { value: 'HRBP', label: 'HRBP' },
            { value: 'Director', label: 'Director' },
            { value: 'CEO', label: 'CEO' }
          ]}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Auto-Approve Threshold</label>
          <span className="text-sm font-bold text-amber-600">{thresholdValue}%</span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          {...register('autoApproveThreshold', { valueAsNumber: true })}
        />
        
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${thresholdValue}%` }}
          />
        </div>
        
        <p className="text-xs text-slate-500">
          Requests below this score auto-approve. Requires AI evaluation to be active.
        </p>
      </div>
    </div>
  )
}
