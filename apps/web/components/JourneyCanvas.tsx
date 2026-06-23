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
export type LayoutMode = 'elk' | 'force';

interface JourneyCanvasProps {
  nodes: Node[];
  edges: Edge[];
  activeTool?: CanvasTool;
  layoutMode?: LayoutMode;
  onNodeClick?: (node: Node) => void;
}

function edgeStyle(edge: Edge, layoutMode: LayoutMode, maxWeight: number): React.CSSProperties {
  const weight = (edge.data as { flowWeight?: number })?.flowWeight ?? 100;
  const isIssueEdge = (edge.data as { cascade?: boolean })?.cascade;

  if (layoutMode === 'force') {
    const thickness = Math.max(1, (weight / maxWeight) * 4);
    return {
      stroke: isIssueEdge
        ? 'color-mix(in srgb, #dc2626 50%, var(--border))'
        : 'var(--border)',
      strokeWidth: thickness,
      opacity: 0.8,
    };
  }

  return {
    stroke: isIssueEdge
      ? 'color-mix(in srgb, #dc2626 40%, var(--border))'
      : 'var(--border)',
    strokeWidth: isIssueEdge ? 2 : (edge.style?.strokeWidth ?? 1),
    opacity: 0.9,
  };
}

export default function JourneyCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  activeTool = 'select',
  layoutMode = 'elk',
  onNodeClick,
}: JourneyCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
    [setEdges],
  );

  const maxWeight = Math.max(
    ...initialEdges.map(e => (e.data as { flowWeight?: number })?.flowWeight ?? 100),
    100,
  );

  const styledEdges = edges.map(e => ({
    ...e,
    style: edgeStyle(e, layoutMode, maxWeight),
    animated: layoutMode === 'elk' && !!e.animated,
  }));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
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
