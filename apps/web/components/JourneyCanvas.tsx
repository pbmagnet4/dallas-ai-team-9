'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
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
import type { UrlNodeData } from './UrlNode';

const nodeTypes: NodeTypes = { url: UrlNode };

export const HEALTH_COLORS: Record<string, string> = {
  healthy:     '#16a34a',
  leaking:     '#ca8a04',
  critical:    '#dc2626',
  opportunity: '#2563eb',
};

type CanvasTool = 'select' | 'pan';

interface JourneyCanvasProps {
  nodes: Node[];
  edges: Edge[];
  activeTool?: CanvasTool;
  onNodeClick?: (node: Node) => void;
}

export default function JourneyCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  activeTool = 'select',
  onNodeClick,
}: JourneyCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
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
        maxZoom={2.5}
        panOnDrag={activeTool === 'pan'}
        selectionOnDrag={activeTool === 'select'}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        style={{ background: 'transparent' }}
      >
        <MiniMap
          nodeColor={(node) => HEALTH_COLORS[(node.data as UrlNodeData)?.health] ?? 'var(--border)'}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
          maskColor="color-mix(in srgb, var(--bg) 75%, transparent)"
        />
      </ReactFlow>
    </div>
  );
}
