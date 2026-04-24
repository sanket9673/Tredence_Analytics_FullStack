import { http, HttpResponse, delay } from 'msw'
import type { WorkflowNode, WorkflowEdge } from '../types'
import { simulateExecution } from './simulationEngine'
import { validateWorkflowGraph } from '../utils/graphValidation'

interface SimulateRequestBody {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export const handlers = [
  http.get('/automations', async () => {
    await delay(400)
    return HttpResponse.json([
      { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
      { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
      { id: 'slack_notify', label: 'Slack Notification', params: ['channel', 'message'] },
      { id: 'create_ticket', label: 'Create Jira Ticket', params: ['project', 'summary', 'assignee'] },
      { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'title', 'datetime'] },
      { id: 'send_offer', label: 'Send Offer Letter', params: ['candidate_email', 'position', 'salary'] },
      { id: 'update_hris', label: 'Update HRIS Record', params: ['employee_id', 'field', 'value'] },
    ])
  }),

  http.post('/simulate', async ({ request }) => {
    await delay(600)
    const body = await request.json() as SimulateRequestBody
    const errors = validateWorkflowGraph(body)
    const criticalErrors = errors.filter(e => e.severity === 'error')
    if (criticalErrors.length > 0) {
      return HttpResponse.json({ success: false, errors }, { status: 422 })
    }
    const steps = simulateExecution(body)
    return HttpResponse.json({ success: true, steps })
  }),

  http.get('/workflows', async () => {
    await delay(300)
    return HttpResponse.json([
      { id: 'onboarding-v1', name: 'Employee Onboarding', nodeCount: 6, updatedAt: '2025-01-15' },
      { id: 'leave-approval', name: 'Leave Approval', nodeCount: 4, updatedAt: '2025-01-10' },
    ])
  }),

  http.post('/workflows', async ({ request }) => {
    await delay(400)
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: `workflow-${Date.now()}`, ...body }, { status: 201 })
  }),
]
