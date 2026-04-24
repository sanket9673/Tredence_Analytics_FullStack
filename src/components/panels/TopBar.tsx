import React, { useRef } from 'react'
import { LayoutDashboard, ShieldCheck, Upload, Download, Play, Undo2, Redo2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useWorkflowStore, useTemporalStore } from '../../store/workflowStore'
import { useAutoSave } from '../../hooks/useAutoSave'
import { getLayoutedElements } from '../../utils/layoutHelpers'
import toast from 'react-hot-toast'
import { WorkflowNode, WorkflowEdge } from '../../types'

export const TopBar: React.FC = () => {
  const { workflowName, setWorkflowName } = useUIStore()
  const { nodes, edges, setNodes, setIsSandboxOpen, runValidation, importWorkflow } = useWorkflowStore()
  const { lastSaved } = useAutoSave()
  const undo = useTemporalStore((state) => state.undo)
  const redo = useTemporalStore((state) => state.redo)
  const pastStates = useTemporalStore((state) => state.pastStates)
  const futureStates = useTemporalStore((state) => state.futureStates)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleValidate = () => {
    const errors = runValidation()
    if (errors.length === 0) {
      toast.success('Workflow is valid!')
    } else {
      const errorCount = errors.filter(e => e.severity === 'error').length
      toast.error(`Found ${errorCount} error(s)`)
    }
  }

  const handleLayout = () => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, 'TB')
    setNodes(layoutedNodes)
  }

  const handleExport = () => {
    const data = {
      version: '1.0',
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '_')}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.nodes && data.edges) {
          importWorkflow(data.nodes, data.edges)
          toast.success(`Imported: ${data.name || 'Workflow'}`)
        } else {
          toast.error('Invalid workflow file format')
        }
      } catch {
        toast.error('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">HR</div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Flow</h1>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <input
            className="text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          {lastSaved && (
            <span className="text-xs text-slate-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={pastStates.length === 0}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={futureStates.length === 0}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
        <button
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ShieldCheck className="w-4 h-4" /> Validate
        </button>
        <button
          onClick={handleLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" /> Auto Layout
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Import JSON"
        >
          <Upload className="w-5 h-5" />
        </button>
        <button
          onClick={handleExport}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Export JSON"
        >
          <Download className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={() => setIsSandboxOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors shadow-sm ml-2"
        >
          <Play className="w-4 h-4" /> Run Workflow
        </button>
      </div>
    </div>
  )
}
