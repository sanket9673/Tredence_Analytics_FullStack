import dagre from 'dagre'
import { WorkflowNode, WorkflowEdge } from '../types'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

export const getLayoutedElements = (nodes: WorkflowNode[], edges: WorkflowEdge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 }) // approximate dimensions
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100, // adjust to center
        y: nodeWithPosition.y - 50,
      },
    }
  })

  return { nodes: newNodes, edges }
}
