import React from 'react'
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react'
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
  label
}) => {
  const { deleteEdge } = useWorkflowStore()
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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* Invisible thicker path for easier hover/interaction */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="peer cursor-pointer"
      />
      
      <div
        className="absolute w-6 h-6 flex items-center justify-center opacity-0 peer-hover:opacity-100 hover:opacity-100 transition-opacity z-50 cursor-pointer pointer-events-auto"
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        }}
        onClick={(e) => {
          e.stopPropagation()
          deleteEdge(id)
        }}
      >
        <div className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-red-500 hover:text-red-600 hover:bg-red-50">
          <X className="w-3 h-3" />
        </div>
      </div>

      {label && (
        <div
          className="absolute pointer-events-none z-40"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <div className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-medium text-slate-500 shadow-sm mt-8">
            {label}
          </div>
        </div>
      )}
    </>
  )
}
