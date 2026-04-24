import { z } from 'zod'

export const metaFieldSchema = z.object({
  key: z.string().min(1, 'Key required'),
  value: z.string(),
})

export const startNodeSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  metadata: z.array(metaFieldSchema).default([]),
})

export const taskNodeSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  assignee: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().default(''),
  customFields: z.array(metaFieldSchema).default([]),
})

export const approvalNodeSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  approverRole: z.enum(['Manager', 'HRBP', 'Director', 'CEO']),
  autoApproveThreshold: z.number().min(0).max(100).default(80),
})

export const automatedNodeSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  actionId: z.string().min(1, 'Please select an action'),
  actionParams: z.record(z.string(), z.string()).default({}),
})

export const endNodeSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  endMessage: z.string().default(''),
  summaryFlag: z.boolean().default(false),
})

const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'task', 'approval', 'automated', 'end']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({ id: z.string(), label: z.string() }).passthrough(),
})

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
})

export const workflowFileSchema = z.object({
  version: z.string(),
  name: z.string(),
  exportedAt: z.string(),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
})

export type StartNodeFormData = z.input<typeof startNodeSchema>
export type TaskNodeFormData = z.input<typeof taskNodeSchema>
export type ApprovalNodeFormData = z.input<typeof approvalNodeSchema>
export type AutomatedNodeFormData = z.input<typeof automatedNodeSchema>
export type EndNodeFormData = z.input<typeof endNodeSchema>
