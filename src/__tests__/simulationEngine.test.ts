import { describe, it, expect } from 'vitest'
import { topologicalSort } from '../utils/graphValidation'

describe('topologicalSort', () => {
  it('returns nodes in correct execution order', () => {
    const nodes = [
      { id:'s', type:'start', data:{label:'S'} },
      { id:'m', type:'task', data:{label:'M'} },
      { id:'e', type:'end', data:{label:'E'} },
    ]
    const edges = [{ id:'sm', source:'s', target:'m' }, { id:'me', source:'m', target:'e' }]
    const order = topologicalSort({ nodes, edges } as any)
    expect(order).toEqual(['s', 'm', 'e'])
  })
})
