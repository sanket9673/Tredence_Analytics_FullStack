import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  AnyNodeData,
  ValidationError,
  SimulationStep,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types'
import { validateWorkflowGraph } from '../utils/graphValidation'
import { workflowFileSchema } from '../types/schemas'

type NodeDefaults = {
  start: Omit<StartNodeData, 'id' | 'validationErrors' | 'simulationStatus'>
  task: Omit<TaskNodeData, 'id' | 'validationErrors' | 'simulationStatus'>
  approval: Omit<ApprovalNodeData, 'id' | 'validationErrors' | 'simulationStatus'>
  automated: Omit<AutomatedNodeData, 'id' | 'validationErrors' | 'simulationStatus'>
  end: Omit<EndNodeData, 'id' | 'validationErrors' | 'simulationStatus'>
}

const defaultDataByType: NodeDefaults = {
  start: { type: 'start', label: 'Start', metadata: [] },
  task: { type: 'task', label: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approval: { type: 'approval', label: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 80 },
  automated: { type: 'automated', label: 'Automated Step', actionId: '', actionParams: {} },
  end: { type: 'end', label: 'End', endMessage: '', summaryFlag: false },
}

interface HistoryEntry {
  data: AnyNodeData
  savedAt: string
}

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null
  highlightedNodeId: string | null
  validationErrors: ValidationError[]
  simulationSteps: SimulationStep[]
  nodeHistory: Record<string, HistoryEntry[]>
  lastSaved: string | null

  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: WorkflowEdge[]) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<AnyNodeData>) => void
  removeNode: (nodeId: string) => void
  deleteEdge: (edgeId: string) => void
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => void
  setSelectedNode: (id: string | null) => void
  setHighlightedNodeId: (id: string | null) => void
  setSimulationSteps: (steps: SimulationStep[]) => void
  loadTemplate: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void
  importWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void
  runValidation: () => ValidationError[]
  pushNodeHistory: (nodeId: string, data: AnyNodeData) => void
  clearHighlight: () => void
}

function mergeNodeData(existing: AnyNodeData, patch: Partial<AnyNodeData>): AnyNodeData {
  const merged = { ...existing, ...patch }
  return merged as AnyNodeData
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        highlightedNodeId: null,
        validationErrors: [],
        simulationSteps: [],
        nodeHistory: {},
        lastSaved: null,

        setNodes: (nodes) => set({ nodes }),
        setEdges: (edges) => set({ edges }),

        addNode: (type, position) => {
          const id = nanoid()
          const defaults = defaultDataByType[type]
          const newNode: WorkflowNode = {
            id,
            type,
            position,
            data: { ...defaults, id },
          }
          set((state) => ({ nodes: [...state.nodes, newNode] }))
          get().runValidation()
        },

        updateNodeData: (nodeId, data) => {
          const currentNode = get().nodes.find((n) => n.id === nodeId)
          if (currentNode) {
            get().pushNodeHistory(nodeId, currentNode.data)
          }
          set((state) => ({
            nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, data: mergeNodeData(n.data, data) } : n)),
            lastSaved: new Date().toISOString(),
          }))
          get().runValidation()
        },

        removeNode: (nodeId) =>
          set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            highlightedNodeId: state.highlightedNodeId === nodeId ? null : state.highlightedNodeId,
          })),

        deleteEdge: (edgeId) =>
          set((state) => ({
            edges: state.edges.filter((e) => e.id !== edgeId),
          })),

        addEdge: (edge) => {
          const id = `e-${edge.source}-${edge.target}-${nanoid(4)}`
          const exists = get().edges.some((e) => e.source === edge.source && e.target === edge.target)
          if (!exists) {
            set((state) => ({ edges: [...state.edges, { id, ...edge }] }))
            get().runValidation()
          }
        },

        setSelectedNode: (id) => set({ selectedNodeId: id }),
        setHighlightedNodeId: (id) => set({ highlightedNodeId: id }),
        clearHighlight: () => set({ highlightedNodeId: null }),
        setSimulationSteps: (steps) => set({ simulationSteps: steps }),

        loadTemplate: (nodes, edges) =>
          set({
            nodes,
            edges,
            selectedNodeId: null,
            highlightedNodeId: null,
            validationErrors: [],
            nodeHistory: {},
          }),

        importWorkflow: (nodes, edges) => {
          const parsed = workflowFileSchema.safeParse({
            version: '1.0',
            name: 'Imported Workflow',
            exportedAt: new Date().toISOString(),
            nodes,
            edges,
          })
          if (!parsed.success) {
            return
          }
          set({
            nodes,
            edges,
            selectedNodeId: null,
            highlightedNodeId: null,
            validationErrors: [],
            nodeHistory: {},
          })
        },

        runValidation: () => {
          const { nodes, edges } = get()
          const errors = validateWorkflowGraph({ nodes, edges })
          const errorsByNode = errors.reduce<Record<string, string[]>>((acc, e) => {
            if (e.nodeId) {
              acc[e.nodeId] = [...(acc[e.nodeId] ?? []), e.message]
            }
            return acc
          }, {})

          set((state) => ({
            nodes: state.nodes.map((n) => ({
              ...n,
              data: { ...n.data, validationErrors: errorsByNode[n.id] ?? [] },
            })),
            validationErrors: errors,
          }))

          return errors
        },

        pushNodeHistory: (nodeId, data) => {
          set((state) => {
            const existing = state.nodeHistory[nodeId] ?? []
            const updated = [...existing, { data, savedAt: new Date().toISOString() }].slice(-5)
            return { nodeHistory: { ...state.nodeHistory, [nodeId]: updated } }
          })
        },
      }),
      {
        name: 'hr-workflow-storage',
        partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
      },
    ),
    { limit: 50 },
  ),
)
