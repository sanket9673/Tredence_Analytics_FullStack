import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Zap, AlertCircle } from 'lucide-react'
import { AutomatedNodeData } from '../../types'
import { useWorkflowStore } from '../../store/workflowStore'

export const AutomatedNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const typedData = data as unknown as AutomatedNodeData
  const { highlightedNodeId } = useWorkflowStore()
  const isHighlighted = highlightedNodeId === id
  return (
    <div className={`custom-node node-automated ${selected ? 'selected' : ''} ${isHighlighted ? 'ring-4 ring-offset-2 ring-violet-400 animate-pulse' : ''}`}>
      <div className="custom-node-header">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Automated</span>
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
          {typedData.actionId ? `Action: ${typedData.actionId}` : 'No action selected'}
        </div>
      </div>
      <div className={`status-dot status-${typedData.simulationStatus || 'idle'}`} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-300 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-300 border-2 border-white" />
    </div>
  )
}
