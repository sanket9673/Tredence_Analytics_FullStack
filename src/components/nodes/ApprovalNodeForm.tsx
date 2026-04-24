import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { approvalNodeSchema, ApprovalNodeFormData } from '../../types/schemas'
import { useWorkflowStore } from '../../store/workflowStore'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { WorkflowNode } from '../../types'

interface ApprovalNodeFormProps {
  node: WorkflowNode
}

export const ApprovalNodeForm: React.FC<ApprovalNodeFormProps> = ({ node }) => {
  const { updateNodeData } = useWorkflowStore()
  const data = node.data as any

  const {
    register,
    watch,
    formState: { errors }
  } = useForm<ApprovalNodeFormData>({
    resolver: zodResolver(approvalNodeSchema) as any,
    defaultValues: {
      label: data.label,
      approverRole: data.approverRole || 'Manager',
      autoApproveThreshold: data.autoApproveThreshold ?? 80
    }
  })

  const thresholdValue = watch('autoApproveThreshold')

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = approvalNodeSchema.safeParse(values)
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
