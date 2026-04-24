import React, { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Connection,
  addEdge as rfAddEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { useWorkflowStore } from '../../store/workflowStore'
import { StartNode } from '../nodes/StartNode'
import { TaskNode } from '../nodes/TaskNode'
import { ApprovalNode } from '../nodes/ApprovalNode'
import { AutomatedNode } from '../nodes/AutomatedNode'
import { EndNode } from '../nodes/EndNode'
import { CustomEdge } from './CustomEdge'
import type { NodeType, WorkflowNode, WorkflowEdge } from '../../types'
import { nanoid } from 'nanoid'

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
  const { nodes, edges, setNodes, setEdges, addNode, setSelectedNodeId, selectedNodeId, deleteNode } = useWorkflowStore()
  const reactFlowInstance = useReactFlow()

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds: WorkflowNode[]) => applyNodeChanges(changes, nds) as WorkflowNode[]),
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds: WorkflowEdge[]) => applyEdgeChanges(changes, eds) as WorkflowEdge[]),
    [setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source === params.target) return
      const newEdge: WorkflowEdge = {
        id: `e-${params.source}-${params.target}-${nanoid(4)}`,
        source: params.source!,
        target: params.target!,
      }
      setEdges((eds: WorkflowEdge[]) => rfAddEdge(newEdge, eds) as WorkflowEdge[])
    },
    [setEdges]
  )

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

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNodeId(node.id)
  }, [setSelectedNodeId])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNodeId) {
        deleteNode(selectedNodeId)
      }
    }
  }, [selectedNodeId, deleteNode])

  return (
    <div className="flex-1 w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect}
        onNodeClick={onNodeClick as any}
        onPaneClick={onPaneClick}
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
