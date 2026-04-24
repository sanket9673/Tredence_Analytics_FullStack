export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'
export type SimulationStatus = 'idle' | 'running' | 'completed' | 'failed' | 'pending'

export interface MetaField { key: string; value: string }

export interface BaseNodeData {
  id: string
  label: string
  validationErrors?: string[]
  simulationStatus?: SimulationStatus
}

export interface StartNodeData extends BaseNodeData {
  type: 'start'
  metadata: MetaField[]
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task'
  description: string
  assignee: string
  dueDate: string
  customFields: MetaField[]
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval'
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO'
  autoApproveThreshold: number
}

export interface AutomatedNodeData extends BaseNodeData {
  type: 'automated'
  actionId: string
  actionParams: Record<string, string>
}

export interface EndNodeData extends BaseNodeData {
  type: 'end'
  endMessage: string
  summaryFlag: boolean
}

export type AnyNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: AnyNodeData
  selected?: boolean
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
}

export interface AutomationAction {
  id: string
  label: string
  params: string[]
}

export interface SimulationStep {
  stepIndex: number
  nodeId: string
  nodeLabel: string
  nodeType: NodeType
  status: 'completed' | 'pending' | 'executing' | 'failed'
  message: string
  timestamp: string
}

export interface SimulationResult {
  success: boolean
  steps: SimulationStep[]
  errors?: ValidationError[]
}

export interface ValidationError {
  nodeId?: string
  message: string
  severity: 'error' | 'warning'
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowFile {
  version: string
  name: string
  exportedAt: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export function isStartNode(d: AnyNodeData): d is StartNodeData { return d.type === 'start' }
export function isTaskNode(d: AnyNodeData): d is TaskNodeData { return d.type === 'task' }
export function isApprovalNode(d: AnyNodeData): d is ApprovalNodeData { return d.type === 'approval' }
export function isAutomatedNode(d: AnyNodeData): d is AutomatedNodeData { return d.type === 'automated' }
export function isEndNode(d: AnyNodeData): d is EndNodeData { return d.type === 'end' }
