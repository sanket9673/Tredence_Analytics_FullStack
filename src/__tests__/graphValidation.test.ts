import { describe, it, expect } from 'vitest'
import { validateWorkflowGraph } from '../utils/graphValidation'

describe('validateWorkflowGraph', () => {
  it('returns error when no Start node', () => {
    const result = validateWorkflowGraph({ nodes: [{ id:'n1', type:'end', data:{label:'End'} }], edges: [] } as any)
    expect(result.some(e => e.message.includes('Start node'))).toBe(true)
  })

  it('detects cycles', () => {
    const nodes = [
      { id:'a', type:'task', data:{label:'A'} },
      { id:'b', type:'task', data:{label:'B'} },
    ]
    const edges = [{ id:'e1', source:'a', target:'b' }, { id:'e2', source:'b', target:'a' }]
    const result = validateWorkflowGraph({ nodes, edges } as any)
    expect(result.some(e => e.message.includes('cycle'))).toBe(true)
  })

  it('returns no errors for valid linear workflow', () => {
    const nodes = [
      { id:'s', type:'start', data:{label:'Start'} },
      { id:'e', type:'end', data:{label:'End'} },
    ]
    const edges = [{ id:'se', source:'s', target:'e' }]
    const result = validateWorkflowGraph({ nodes, edges } as any)
    expect(result.filter(e => e.severity === 'error')).toHaveLength(0)
  })
})
