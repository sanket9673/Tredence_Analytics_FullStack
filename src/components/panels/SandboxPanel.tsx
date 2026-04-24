import React, { useEffect } from 'react'
import { Play, AlertCircle, CheckCircle2, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import { useSimulation } from '../../hooks/useSimulation'
import { Button } from '../ui/Button'

export const SandboxPanel: React.FC = () => {
  const { isSandboxOpen, setIsSandboxOpen } = useWorkflowStore()
  const { state, steps, totalSteps, errors, run, reset } = useSimulation()

  useEffect(() => {
    if (isSandboxOpen && state === 'idle') run()
  }, [isSandboxOpen])

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30 ${isSandboxOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
      <div 
        className="h-12 flex items-center justify-between px-6 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsSandboxOpen(!isSandboxOpen)}
      >
        <div className="flex items-center gap-3">
          <Play className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-slate-800">Simulation Sandbox</h3>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md">
          {isSandboxOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      <div className="h-[360px] flex">
        <div className="w-[300px] border-r border-slate-100 p-6 flex flex-col justify-between bg-white shrink-0">
          <div>
            <h4 className="text-sm font-medium text-slate-800 mb-2">Controls</h4>
            <p className="text-xs text-slate-500 mb-6">Test your workflow logic and transitions before publishing.</p>
            
            {state === 'validating' && (
              <div className="text-xs font-medium text-slate-500 animate-pulse mb-4">Validating graph...</div>
            )}
            
            {state === 'error' && errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <ul className="list-disc pl-3">
                  {errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
              </div>
            )}

            {state === 'idle' && (
              <Button onClick={run} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                <Play className="w-4 h-4" /> Run Simulation
              </Button>
            )}
            
            {(state === 'running' || state === 'complete' || state === 'error') && (
              <Button onClick={reset} variant="outline" className="w-full gap-2">
                <RefreshCw className="w-4 h-4" /> Reset Sandbox
              </Button>
            )}
          </div>
          
          {(state === 'running' || state === 'complete') && (
            <div className={`p-4 rounded-lg border ${state === 'complete' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                {state === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                )}
                <span className={`font-semibold ${state === 'complete' ? 'text-green-800' : 'text-blue-800'}`}>
                  {state === 'complete' ? 'Simulation Passed' : 'Running...'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {steps.length} / {totalSteps} steps executed
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto custom-scrollbar">
          <h4 className="text-sm font-medium text-slate-800 mb-4">Execution Log</h4>
          
          {state === 'idle' && (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Run a simulation to see execution steps.
            </div>
          )}

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white
                  ${step.status === 'completed' ? 'bg-green-500' : 
                    step.status === 'failed' ? 'bg-red-500' : 
                    step.status === 'executing' ? 'bg-blue-500 animate-pulse' : 'bg-amber-400'}`}
                >
                  {step.stepIndex}
                </div>
                <div className="flex-1 pb-4 border-b border-slate-200 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800">{step.nodeLabel}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-600">{step.message}</div>
                  <div className="mt-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Type: {step.nodeType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
