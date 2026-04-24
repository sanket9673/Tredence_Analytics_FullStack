import React, { useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react'
import { X } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}) => {
  const { deleteEdge } = useWorkflowStore()
  const [isHovered, setIsHovered] = useState(false)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); deleteEdge(id) }}
            className={`pointer-events-auto w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50 transition-all duration-150 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
            title="Delete connection"
          >
            <X className="w-3 h-3" />
          </button>
          {label && (
            <div className="mt-2 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-medium text-slate-500 shadow-sm">
              {String(label)}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
