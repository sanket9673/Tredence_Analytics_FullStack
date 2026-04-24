import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { UserCheck, AlertCircle } from 'lucide-react'
import { ApprovalNodeData } from '../../types'
import { useWorkflowStore } from '../../store/workflowStore'

export const ApprovalNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const typedData = data as unknown as ApprovalNodeData
  const { highlightedNodeId } = useWorkflowStore()
  const isHighlighted = highlightedNodeId === id
  return (
    <div className={`custom-node node-approval ${selected ? 'selected' : ''} ${isHighlighted ? 'ring-4 ring-offset-2 ring-violet-400 animate-pulse' : ''}`}>
      <div className="custom-node-header">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approval</span>
        </div>
        {typedData.validationErrors && typedData.validationErrors.length > 0 && (
          <div className="relative group cursor-help">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <div className="absolute hidden group-hover:block bottom-full mb-2 right-0 w-48 bg-slate-800 text-white text-xs rounded p-2 z-50">
              {typedData.validationErrors.join(', ')}
            </div>
          </div>
        )}
      </div>
      <div className="custom-node-body">
        <div className="custom-node-title">{typedData.label}</div>
        <div className="custom-node-meta">
          {typedData.approverRole || 'Unassigned'} · {typedData.autoApproveThreshold ?? 0}% auto
        </div>
      </div>
      <div className={`status-dot status-${typedData.simulationStatus || 'idle'}`} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-300 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-300 border-2 border-white" />
    </div>
  )
}
