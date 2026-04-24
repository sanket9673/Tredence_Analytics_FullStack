import React, { useCallback, KeyboardEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Connection,
  Edge,
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
import { NodeType, WorkflowNode } from '../../types'
import { v4 as uuidv4 } from 'uuid'

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
  const { nodes, edges, setNodes, setEdges, addNode, addEdge, setSelectedNodeId, selectedNodeId, deleteNode, deleteEdge } = useWorkflowStore()
  const reactFlowInstance = useReactFlow()

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Validate connection (no cycles, no self-loops) - simplified here, full in utils
      if (params.source === params.target) return
      
      const newEdge = { ...params, id: `e-${params.source}-${params.target}`, type: 'custom' }
      setEdges((eds) => rfAddEdge(newEdge, eds))
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

      const newNode: WorkflowNode = {
        id: uuidv4(),
        type,
        position,
        data: { id: uuidv4(), label: `New ${type} node` } as any, // Initialize with defaults based on type later
      }

      // Add basic defaults
      if (type === 'start') {
        newNode.data = { ...newNode.data, metadata: [] }
      } else if (type === 'task') {
        newNode.data = { ...newNode.data, description: '', assignee: '', dueDate: '', customFields: [] }
      } else if (type === 'approval') {
        newNode.data = { ...newNode.data, approverRole: 'Manager', autoApproveThreshold: 80 }
      } else if (type === 'automated') {
        newNode.data = { ...newNode.data, actionId: '', actionParams: {} }
      } else if (type === 'end') {
        newNode.data = { ...newNode.data, endMessage: '', summaryFlag: false }
      }

      addNode(newNode)
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
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={() => {}}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={true}
        snapGrid={[16, 16]}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap zoomable pannable nodeClassName={(n) => `node-${n.type}`} />
      </ReactFlow>
    </div>
  )
}
