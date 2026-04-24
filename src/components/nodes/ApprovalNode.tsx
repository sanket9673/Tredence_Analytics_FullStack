import React from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { UserCheck, AlertCircle } from 'lucide-react'
import { ApprovalNodeData } from '../../types'

export const ApprovalNode: React.FC<NodeProps<Node<ApprovalNodeData>>> = ({ data, selected }) => {
  return (
    <div className={`custom-node node-approval ${selected ? 'selected' : ''}`}>
      <div className="custom-node-header">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approval</span>
        </div>
        {data.validationErrors && data.validationErrors.length > 0 && (
          <div className="relative group cursor-help">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <div className="absolute hidden group-hover:block bottom-full mb-2 right-0 w-48 bg-slate-800 text-white text-xs rounded p-2 z-50">
              {data.validationErrors.join(', ')}
            </div>
          </div>
        )}
      </div>
      <div className="custom-node-body">
        <div className="custom-node-title">{data.label}</div>
        <div className="custom-node-meta">
          {data.approverRole || 'Unassigned'} · {data.autoApproveThreshold ?? 0}% auto
        </div>
      </div>
      <div className={`status-dot status-${data.simulationStatus || 'idle'}`} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-300 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-300 border-2 border-white" />
    </div>
  )
}
