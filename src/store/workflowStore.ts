import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import type { WorkflowNode, WorkflowEdge, ValidationError, SimulationStep, NodeType, AnyNodeData } from '../types'
import { validateWorkflowGraph } from '../utils/graphValidation'
import { nanoid } from 'nanoid'

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null
  validationErrors: ValidationError[]
  simulationSteps: SimulationStep[]
  isSandboxOpen: boolean
  lastSaved: Date | null
  nodeHistory: Record<string, { data: AnyNodeData; savedAt: string }[]>

  setNodes: (nodes: WorkflowNode[] | ((nodes: WorkflowNode[]) => WorkflowNode[])) => void
  setEdges: (edges: WorkflowEdge[] | ((edges: WorkflowEdge[]) => WorkflowEdge[])) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<AnyNodeData>) => void
  deleteNode: (nodeId: string) => void
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => void
  deleteEdge: (edgeId: string) => void
  setSelectedNodeId: (id: string | null) => void
  setSimulationSteps: (steps: SimulationStep[]) => void
  setIsSandboxOpen: (open: boolean) => void
  loadTemplate: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void
  importWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void
  runValidation: () => ValidationError[]
  pushNodeHistory: (nodeId: string, data: AnyNodeData) => void
}

const defaultDataByType: Record<string, any> = {
  start: { label: 'Start', metadata: [] },
  task: { label: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approval: { label: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 80 },
  automated: { label: 'Automated Step', actionId: '', actionParams: {} },
  end: { label: 'End', endMessage: '', summaryFlag: false },
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        validationErrors: [],
        simulationSteps: [],
        isSandboxOpen: false,
        lastSaved: null,
        nodeHistory: {},

        setNodes: (nodes) => set((state) => ({
          nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
        })),

        setEdges: (edges) => set((state) => ({
          edges: typeof edges === 'function' ? edges(state.edges) : edges
        })),

        addNode: (type, position) => {
          const id = nanoid()
          const newNode: WorkflowNode = {
            id, type, position,
            data: { id, ...defaultDataByType[type] },
          }
          set(state => ({ nodes: [...state.nodes, newNode] }))
        },

        updateNodeData: (nodeId, data) => {
          set(state => {
            const updatedNodes = state.nodes.map(n =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...data } as AnyNodeData } : n
            )
            return { nodes: updatedNodes, lastSaved: new Date() }
          })
          const errors = get().runValidation()
          set({ validationErrors: errors })
        },

        pushNodeHistory: (nodeId, data) => {
          set(state => {
            const existing = state.nodeHistory[nodeId] ?? []
            const last5 = [...existing, { data, savedAt: new Date().toISOString() }].slice(-5)
            return { nodeHistory: { ...state.nodeHistory, [nodeId]: last5 } }
          })
        },

        deleteNode: (nodeId) => set(state => ({
          nodes: state.nodes.filter(n => n.id !== nodeId),
          edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        })),

        addEdge: (edge) => {
          const id = `e-${edge.source}-${edge.target}`
          const exists = get().edges.some(e => e.source === edge.source && e.target === edge.target)
          if (!exists) {
            set(state => ({ edges: [...state.edges, { id, ...edge }] }))
          }
        },

        deleteEdge: (edgeId) => set(state => ({
          edges: state.edges.filter(e => e.id !== edgeId),
        })),

        setSelectedNodeId: (id) => set({ selectedNodeId: id }),

        setSimulationSteps: (steps) => set({ simulationSteps: steps }),

        setIsSandboxOpen: (open) => set({ isSandboxOpen: open }),

        loadTemplate: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, validationErrors: [] }),

        importWorkflow: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, validationErrors: [] }),

        runValidation: () => {
          const { nodes, edges } = get()
          const errors = validateWorkflowGraph({ nodes: nodes as any, edges })
          set(state => ({
            nodes: state.nodes.map(n => ({
              ...n,
              data: {
                ...n.data,
                validationErrors: errors.filter(e => e.nodeId === n.id).map(e => e.message),
              },
            })),
            validationErrors: errors,
          }))
          return errors
        },
      }),
      { name: 'hr-workflow-storage', partialize: (s) => ({ nodes: s.nodes, edges: s.edges }) }
    ),
    { limit: 50 }
  )
)

export const useTemporalStore = (selector: (s: any) => any) => useWorkflowStore.temporal(selector)
