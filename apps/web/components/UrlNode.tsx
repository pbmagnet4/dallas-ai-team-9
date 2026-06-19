'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { HEALTH_COLORS } from './JourneyCanvas';

export interface UrlNodeData extends Record<string, unknown> {
  label: string;
  health: 'healthy' | 'leaking' | 'critical' | 'opportunity';
  issueCount: number;
  impactScore: 'P0' | 'P1' | 'P2' | 'P3' | null;
  gscClicks?: number;
  ga4Sessions?: number;
}

export default function UrlNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as UrlNodeData;
  const color = HEALTH_COLORS[nodeData.health] ?? '#94a3b8';

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: '8px 12px',
        background: selected ? '#1e293b' : '#0f172a',
        minWidth: 160,
        maxWidth: 220,
        boxShadow: selected ? `0 0 0 2px ${color}` : 'none',
      }}
    >
      <Handle type="target" position={Position.Left} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        {nodeData.impactScore && (
          <span style={{ fontSize: 10, fontWeight: 700, color, lineHeight: 1 }}>
            {nodeData.impactScore}
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#e2e8f0', wordBreak: 'break-all', lineHeight: 1.3 }}>
        {nodeData.label}
      </div>

      {nodeData.issueCount > 0 && (
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
          {nodeData.issueCount} issue{nodeData.issueCount > 1 ? 's' : ''}
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
