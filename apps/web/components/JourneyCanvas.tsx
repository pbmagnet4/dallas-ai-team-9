'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import UrlNode from './UrlNode';

const nodeTypes: NodeTypes = { url: UrlNode };

// Health score → node color
export const HEALTH_COLORS: Record<string, string> = {
  healthy: '#22c55e',   // green
  leaking: '#eab308',   // yellow
  critical: '#ef4444',  // red
  opportunity: '#3b82f6', // blue
};

interface JourneyCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
}

export default function JourneyCanvas({ nodes: initialNodes, edges: initialEdges, onNodeClick }: JourneyCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick?.(node)}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => HEALTH_COLORS[node.data?.health as string] ?? '#94a3b8'}
        />
      </ReactFlow>
    </div>
  );
}
