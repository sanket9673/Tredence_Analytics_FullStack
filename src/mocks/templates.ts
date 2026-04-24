import type { WorkflowTemplate } from '../types'

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: '6-step onboarding workflow',
    nodes: [
      { id: 'n1', type: 'start', position: { x: 300, y: 50 }, data: { id:'n1', type: 'start', label: 'Start Onboarding', metadata: [{ key: 'department', value: 'Engineering' }] } },
      { id: 'n2', type: 'task', position: { x: 300, y: 170 }, data: { id:'n2', type: 'task', label: 'Collect Documents', assignee: 'HR Team', description: 'ID, offer letter, bank details', dueDate: '', customFields: [] } },
      { id: 'n3', type: 'approval', position: { x: 300, y: 290 }, data: { id:'n3', type: 'approval', label: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 90 } },
      { id: 'n4', type: 'automated', position: { x: 300, y: 410 }, data: { id:'n4', type: 'automated', label: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'new_employee@company.com', subject: 'Welcome!', body: 'Welcome to the team.' } } },
      { id: 'n5', type: 'task', position: { x: 300, y: 530 }, data: { id:'n5', type: 'task', label: 'Equipment Setup', assignee: 'IT Team', description: 'Laptop, access cards, accounts', dueDate: '', customFields: [] } },
      { id: 'n6', type: 'end', position: { x: 300, y: 650 }, data: { id:'n6', type: 'end', label: 'Onboarding Complete', endMessage: 'Employee is fully onboarded.', summaryFlag: true } },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' },
      { id: 'e2-3', source: 'n2', target: 'n3' },
      { id: 'e3-4', source: 'n3', target: 'n4' },
      { id: 'e4-5', source: 'n4', target: 'n5' },
      { id: 'e5-6', source: 'n5', target: 'n6' },
    ],
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    description: '4-step leave request flow',
    nodes: [
      { id: 'l1', type: 'start', position: { x: 300, y: 50 }, data: { id:'l1', type: 'start', label: 'Leave Request', metadata: [] } },
      { id: 'l2', type: 'approval', position: { x: 300, y: 170 }, data: { id:'l2', type: 'approval', label: 'Manager Review', approverRole: 'Manager', autoApproveThreshold: 70 } },
      { id: 'l3', type: 'automated', position: { x: 300, y: 290 }, data: { id:'l3', type: 'automated', label: 'Update HRIS', actionId: 'update_hris', actionParams: { employee_id: '', field: 'leave_balance', value: '' } } },
      { id: 'l4', type: 'end', position: { x: 300, y: 410 }, data: { id:'l4', type: 'end', label: 'Leave Approved', endMessage: 'Leave updated in system.', summaryFlag: false } },
    ],
    edges: [
      { id: 'el1', source: 'l1', target: 'l2' },
      { id: 'el2', source: 'l2', target: 'l3' },
      { id: 'el3', source: 'l3', target: 'l4' },
    ],
  },
  {
    id: 'doc-verification',
    name: 'Document Verification',
    description: '5-step document check flow',
    nodes: [
      { id: 'd1', type: 'start', position: { x: 300, y: 50 }, data: { id:'d1', type: 'start', label: 'Document Submission', metadata: [] } },
      { id: 'd2', type: 'task', position: { x: 300, y: 170 }, data: { id:'d2', type: 'task', label: 'Initial Review', assignee: 'Compliance Officer', description: 'Review submitted documents', dueDate: '', customFields: [] } },
      { id: 'd3', type: 'automated', position: { x: 300, y: 290 }, data: { id:'d3', type: 'automated', label: 'Generate Report', actionId: 'generate_doc', actionParams: { template: 'verification_report', recipient: 'hr@company.com' } } },
      { id: 'd4', type: 'approval', position: { x: 300, y: 410 }, data: { id:'d4', type: 'approval', label: 'HRBP Sign-off', approverRole: 'HRBP', autoApproveThreshold: 85 } },
      { id: 'd5', type: 'end', position: { x: 300, y: 530 }, data: { id:'d5', type: 'end', label: 'Verification Complete', endMessage: 'Documents verified and filed.', summaryFlag: true } },
    ],
    edges: [
      { id: 'ed1', source: 'd1', target: 'd2' },
      { id: 'ed2', source: 'd2', target: 'd3' },
      { id: 'ed3', source: 'd3', target: 'd4' },
      { id: 'ed4', source: 'd4', target: 'd5' },
    ],
  },
]
