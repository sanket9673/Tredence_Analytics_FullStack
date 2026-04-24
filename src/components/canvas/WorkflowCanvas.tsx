import React, { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import toast from 'react-hot-toast'
import { useWorkflowStore } from '../../store/workflowStore'
import { StartNode } from '../nodes/StartNode'
import { TaskNode } from '../nodes/TaskNode'
import { ApprovalNode } from '../nodes/ApprovalNode'
import { AutomatedNode } from '../nodes/AutomatedNode'
import { EndNode } from '../nodes/EndNode'
import { CustomEdge } from './CustomEdge'
import type { NodeType, WorkflowNode, WorkflowEdge } from '../../types'
import { validateWorkflowGraph } from '../../utils/graphValidation'

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
  style: { strokeWidth: 2 },
}

export const WorkflowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    addEdge,
    setSelectedNode,
    selectedNodeId,
    removeNode,
    deleteEdge,
  } = useWorkflowStore()
  const reactFlowInstance = useReactFlow()

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextNodes = applyNodeChanges(changes, nodes as unknown as Node[])
      setNodes(nextNodes as unknown as WorkflowNode[])
    },
    [nodes, setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const nextEdges = applyEdgeChanges(changes, edges as Edge[])
      setEdges(nextEdges as WorkflowEdge[])
    },
    [edges, setEdges],
  )

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return
    if (params.source === params.target) {
      toast.error('Cannot connect a node to itself')
      return
    }
    const testEdges: WorkflowEdge[] = [
      ...edges,
      { id: 'test-edge', source: params.source, target: params.target },
    ]
    const errors = validateWorkflowGraph({ nodes, edges: testEdges })
    if (errors.some((e) => e.message.toLowerCase().includes('cycle'))) {
      toast.error('Cannot connect: would create a cycle in the workflow')
      return
    }
    addEdge({ source: params.source, target: params.target })
  }, [nodes, edges, addEdge])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('nodeType') as NodeType
      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)
    },
    [reactFlowInstance, addNode]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [setSelectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNodeId) {
        removeNode(selectedNodeId)
      }
    }
  }, [selectedNodeId, removeNode])

  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
    deletedNodes.forEach((n) => removeNode(n.id))
  }, [removeNode])

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach((e) => deleteEdge(e.id))
  }, [deleteEdge])

  return (
    <div className="flex-1 w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes as unknown as Node[]}
        edges={edges as Edge[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={true}
        snapGrid={[16, 16]}
        fitView
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
        <MiniMap
          zoomable
          pannable
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              start: '#22c55e',
              task: '#3b82f6',
              approval: '#f59e0b',
              automated: '#8b5cf6',
              end: '#f43f5e',
            }
            return colors[node.type as string] ?? '#94a3b8'
          }}
          nodeStrokeWidth={2}
          className="rounded-lg border border-slate-200"
        />
      </ReactFlow>
    </div>
  )
}
