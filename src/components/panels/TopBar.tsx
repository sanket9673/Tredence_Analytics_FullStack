import React, { useRef } from 'react'
import { LayoutDashboard, ShieldCheck, Upload, Download, Play, Undo2, Redo2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useWorkflowStore } from '../../store/workflowStore'
import { useAutoSave } from '../../hooks/useAutoSave'
import { getLayoutedElements } from '../../utils/layoutHelpers'
import toast from 'react-hot-toast'

export const TopBar: React.FC = () => {
  const { workflowName, setWorkflowName } = useUIStore()
  const { nodes, edges, setNodes, setIsSandboxOpen, runValidation, importWorkflow } = useWorkflowStore()
  const { lastSaved } = useAutoSave()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUndo = () => useWorkflowStore.temporal.getState().undo()
  const handleRedo = () => useWorkflowStore.temporal.getState().redo()

  const canUndo = useWorkflowStore.temporal.getState().pastStates.length > 0
  const canRedo = useWorkflowStore.temporal.getState().futureStates.length > 0

  const handleValidate = () => {
    const errors = runValidation()
    const errorCount = errors.filter(e => e.severity === 'error').length
    const warnCount = errors.filter(e => e.severity === 'warning').length
    if (errors.length === 0) {
      toast.success('✓ Workflow is valid!')
    } else {
      toast.error(`${errorCount} error(s), ${warnCount} warning(s) found`)
    }
  }

  const handleLayout = () => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, 'TB')
    setNodes(layoutedNodes)
    toast.success('Layout applied')
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
    toast.success('Workflow exported!')
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
          if (data.name) setWorkflowName(data.name)
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

  const formatSaveTime = () => {
    if (!lastSaved) return null
    const diff = Math.round((Date.now() - lastSaved.getTime()) / 1000)
    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    return `${Math.round(diff / 60)}m ago`
  }

  return (
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            HR
          </div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">Flow</h1>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <input
            className="text-sm font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none rounded px-2 py-1 transition-colors max-w-[200px]"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          {lastSaved && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Saved {formatSaveTime()}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (⌘Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
        >
          <ShieldCheck className="w-4 h-4" /> Validate
        </button>
        <button
          onClick={handleLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" /> Auto Layout
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Import JSON"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          onClick={handleExport}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Export JSON"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={() => { setIsSandboxOpen(true) }}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" /> Run Workflow
        </button>
      </div>
    </div>
  )
}
