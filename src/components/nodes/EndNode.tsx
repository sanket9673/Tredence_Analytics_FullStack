import React from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Flag, AlertCircle } from 'lucide-react'
import { EndNodeData } from '../../types'

export const EndNode: React.FC<NodeProps<Node<EndNodeData>>> = ({ data, selected }) => {
  return (
    <div className={`custom-node node-end ${selected ? 'selected' : ''}`}>
      <div className="custom-node-header">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">End</span>
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
          Summary: {data.summaryFlag ? 'On' : 'Off'}
        </div>
      </div>
      <div className={`status-dot status-${data.simulationStatus || 'idle'}`} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-300 border-2 border-white" />
    </div>
  )
}
