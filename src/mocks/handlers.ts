import { http, HttpResponse, delay } from 'msw'
import { simulateExecution } from './simulationEngine'
import { validateWorkflowGraph } from '../utils/graphValidation'

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
    const workflow = await request.json() as { nodes: any[], edges: any[] }
    const errors = validateWorkflowGraph(workflow)
    if (errors.filter(e => e.severity === 'error').length > 0) {
      return HttpResponse.json({ success: false, errors }, { status: 422 })
    }
    const steps = simulateExecution(workflow)
    return HttpResponse.json({ success: true, steps })
  }),

  http.get('/workflows', async () => {
    await delay(300)
    return HttpResponse.json([
      { id: 'onboarding-v1', name: 'Employee Onboarding', nodeCount: 7, updatedAt: '2025-01-15' },
      { id: 'leave-approval', name: 'Leave Approval', nodeCount: 4, updatedAt: '2025-01-10' },
      { id: 'doc-verification', name: 'Document Verification', nodeCount: 5, updatedAt: '2025-01-08' },
    ])
  }),

  http.post('/workflows', async ({ request }) => {
    await delay(400)
    const body = await request.json() as any
    return HttpResponse.json({ id: `workflow-${Date.now()}`, ...body }, { status: 201 })
  }),
]
