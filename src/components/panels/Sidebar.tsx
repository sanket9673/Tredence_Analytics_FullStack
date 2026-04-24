import React from 'react'
import { PlayCircle, CheckSquare, UserCheck, Zap, Flag, GripVertical } from 'lucide-react'
import { NodeType } from '../../types'
import { useWorkflowStore } from '../../store/workflowStore'
import { useUIStore } from '../../store/uiStore'

const nodeTypes = [
  { type: 'start' as NodeType, label: 'Start', icon: PlayCircle, color: 'text-green-500' },
  { type: 'task' as NodeType, label: 'Task', icon: CheckSquare, color: 'text-blue-500' },
  { type: 'approval' as NodeType, label: 'Approval', icon: UserCheck, color: 'text-amber-500' },
  { type: 'automated' as NodeType, label: 'Automated', icon: Zap, color: 'text-violet-500' },
  { type: 'end' as NodeType, label: 'End', icon: Flag, color: 'text-rose-500' },
]

export const Sidebar: React.FC = () => {
  const { nodes, edges } = useWorkflowStore()
  const { sidebarOpen } = useUIStore()

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('nodeType', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  if (!sidebarOpen) return null

  return (
    <div className="w-[220px] h-full bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Node Types</h2>
      </div>
      
      <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {nodeTypes.map(({ type, label, icon: Icon, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] group"
          >
            <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </div>
        ))}

        <div className="mt-8 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h2>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-all hover:bg-slate-50">
              <div className="text-sm font-medium text-slate-800">Employee Onboarding</div>
              <div className="text-xs text-slate-500 mt-1">7 nodes</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-all hover:bg-slate-50">
              <div className="text-sm font-medium text-slate-800">Leave Approval</div>
              <div className="text-xs text-slate-500 mt-1">4 nodes</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-all hover:bg-slate-50">
              <div className="text-sm font-medium text-slate-800">Document Verification</div>
              <div className="text-xs text-slate-500 mt-1">5 nodes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
        <div className="flex justify-between mb-1">
          <span>Nodes:</span>
          <span className="font-medium text-slate-700">{nodes.length}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Edges:</span>
          <span className="font-medium text-slate-700">{edges.length}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 mt-3 pt-3 border-t border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  )
}
