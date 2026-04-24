import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Toaster } from 'react-hot-toast'
import { TopBar } from './components/panels/TopBar'
import { Sidebar } from './components/panels/Sidebar'
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas'
import { NodeEditPanel } from './components/panels/NodeEditPanel'
import { SandboxPanel } from './components/panels/SandboxPanel'
import { useWorkflowStore } from './store/workflowStore'

function App() {
  const { isSandboxOpen } = useWorkflowStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        useWorkflowStore.temporal.getState().undo()
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault()
        useWorkflowStore.temporal.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      <TopBar />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />

        <main className={`flex-1 relative overflow-hidden transition-all duration-300 ${isSandboxOpen ? 'pb-[408px]' : ''}`}>
          <ReactFlowProvider>
            <WorkflowCanvas />
          </ReactFlowProvider>
        </main>

        <NodeEditPanel />
      </div>

      <SandboxPanel />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }
        }}
      />
    </div>
  )
}

export default App
