export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

export interface MetaField { key: string; value: string }

export interface BaseNodeData extends Record<string, unknown> {
  id: string
  label: string
  validationErrors?: string[]
  simulationStatus?: 'idle' | 'running' | 'completed' | 'failed' | 'pending'
}

export interface StartNodeData extends BaseNodeData {
  metadata: MetaField[]
}

export interface TaskNodeData extends BaseNodeData {
  description: string
  assignee: string
  dueDate: string
  customFields: MetaField[]
}

export interface ApprovalNodeData extends BaseNodeData {
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO'
  autoApproveThreshold: number
}

export interface AutomatedNodeData extends BaseNodeData {
  actionId: string
  actionParams: Record<string, string>
}

export interface EndNodeData extends BaseNodeData {
  endMessage: string
  summaryFlag: boolean
}

export type AnyNodeData =
  | StartNodeData | TaskNodeData | ApprovalNodeData
  | AutomatedNodeData | EndNodeData

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: AnyNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
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
  errors?: string[]
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
