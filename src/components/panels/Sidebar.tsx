import React from 'react'
import { PlayCircle, CheckSquare, UserCheck, Zap, Flag, GripVertical } from 'lucide-react'
import type { NodeType } from '../../types'
import { useWorkflowStore } from '../../store/workflowStore'
import { useUiStore } from '../../store/uiStore'
import { WORKFLOW_TEMPLATES } from '../../mocks/templates'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const nodeItems = [
  { type: 'start' as NodeType, label: 'Start', icon: PlayCircle, color: 'text-green-500' },
  { type: 'task' as NodeType, label: 'Task', icon: CheckSquare, color: 'text-blue-500' },
  { type: 'approval' as NodeType, label: 'Approval', icon: UserCheck, color: 'text-amber-500' },
  { type: 'automated' as NodeType, label: 'Automated', icon: Zap, color: 'text-violet-500' },
  { type: 'end' as NodeType, label: 'End', icon: Flag, color: 'text-rose-500' },
]

export const Sidebar: React.FC = () => {
  const { nodes, edges, loadTemplate, validationErrors, lastSaved } = useWorkflowStore()
  const { isSidebarCollapsed } = useUiStore()
  const errorCount = validationErrors.filter(e => e.severity === 'error').length

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('nodeType', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleLoadTemplate = (templateId: string) => {
    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    if (nodes.length > 0) {
      if (!window.confirm(`Replace current workflow with "${template.name}"? This cannot be undone.`)) return
    }
    loadTemplate(template.nodes, template.edges)
    toast.success(`Loaded template: ${template.name}`)
  }

  if (isSidebarCollapsed) return null

  return (
    <div className="w-[220px] h-full bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Node Palette</h2>
        <p className="text-xs text-slate-400 mt-1">Drag to canvas</p>
      </div>
      
      <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {nodeItems.map(({ type, label, icon: Icon, color }) => (
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

        <div className="mt-6 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h2>
          <div className="space-y-2">
            {WORKFLOW_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template.id)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 cursor-pointer transition-all"
              >
                <div className="text-sm font-medium text-slate-800">{template.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {template.nodes.length} nodes
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 shrink-0">
        <div className="flex justify-between mb-1">
          <span>Nodes:</span>
          <span className="font-medium text-slate-700">{nodes.length}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Edges:</span>
          <span className="font-medium text-slate-700">{edges.length}</span>
        </div>
        <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 ${errorCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${errorCount === 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{errorCount === 0 ? 'Valid workflow' : `${errorCount} error${errorCount > 1 ? 's' : ''}`}</span>
        </div>
        {lastSaved && (
          <div className="mt-2 text-slate-500">
            Saved {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  )
}
