import React, { useState } from 'react'
import { X, Save, History, RotateCcw } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import { StartNodeForm } from '../nodes/StartNodeForm'
import { TaskNodeForm } from '../nodes/TaskNodeForm'
import { ApprovalNodeForm } from '../nodes/ApprovalNodeForm'
import { AutomatedNodeForm } from '../nodes/AutomatedNodeForm'
import { EndNodeForm } from '../nodes/EndNodeForm'
import { AnyNodeData } from '../../types'

export const NodeEditPanel: React.FC = () => {
  const { selectedNodeId, nodes, setSelectedNodeId, nodeHistory, updateNodeData } = useWorkflowStore()
  const selectedNode = nodes.find(n => n.id === selectedNodeId)
  
  const [showHistory, setShowHistory] = useState(false)

  const formMap: Record<string, React.FC<any>> = {
    start: StartNodeForm,
    task: TaskNodeForm,
    approval: ApprovalNodeForm,
    automated: AutomatedNodeForm,
    end: EndNodeForm,
  }

  const typeColors: Record<string, string> = {
    start: 'bg-green-100 text-green-700 border-green-200',
    task: 'bg-blue-100 text-blue-700 border-blue-200',
    approval: 'bg-amber-100 text-amber-700 border-amber-200',
    automated: 'bg-violet-100 text-violet-700 border-violet-200',
    end: 'bg-rose-100 text-rose-700 border-rose-200',
  }

  const isOpen = !!selectedNode
  const history = selectedNode ? nodeHistory[selectedNode.id] || [] : []

  const handleRestore = (data: AnyNodeData) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, data)
      setShowHistory(false)
    }
  }

  return (
    <div 
      className={`fixed top-14 right-0 h-[calc(100%-56px)] w-[320px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-200 ease-out z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {selectedNode && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md border ${typeColors[selectedNode.type]}`}>
                {selectedNode.type}
              </span>
              <span className="text-sm font-medium text-slate-800 truncate max-w-[100px]">
                Settings
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-xs text-slate-400 mr-2" title="Auto-saving enabled">
                <Save className="w-3 h-3" />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-md transition-colors ${showHistory ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                  title="Version History"
                >
                  <History className="w-4 h-4" />
                </button>
                {showHistory && history.length > 0 && (
                  <div className="absolute right-0 top-8 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
                      Recent Versions
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {history.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="flex flex-col px-3 py-2 border-b border-slate-50 hover:bg-slate-50">
                          <span className="text-[10px] text-slate-400 font-mono mb-1">
                            {new Date(entry.savedAt).toLocaleTimeString()}
                          </span>
                          <button 
                            onClick={() => handleRestore(entry.data)}
                            className="flex items-center justify-between text-xs font-medium text-blue-600 hover:text-blue-700 w-full text-left"
                          >
                            <span>Restore this version</span>
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {showHistory && history.length === 0 && (
                  <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 text-xs text-slate-500 text-center">
                    No history available yet.
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {React.createElement(formMap[selectedNode.type], { node: selectedNode })}
          </div>
        </div>
      )}
    </div>
  )
}
