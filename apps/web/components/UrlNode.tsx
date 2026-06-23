'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { HEALTH_COLORS } from './JourneyCanvas';
import type { IssuePattern, DataSource, ActionBrief } from '@/types/navflow';

export interface UrlNodeData extends Record<string, unknown> {
  label: string;
  health: 'healthy' | 'leaking' | 'critical' | 'opportunity';
  issueCount: number;
  impactScore: 'P0' | 'P1' | 'P2' | 'P3' | null;
  gscClicks?: number;
  ga4Sessions?: number;
  patterns?: IssuePattern[];
  sources?: DataSource[];
  brief?: ActionBrief;
}

export default function UrlNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as UrlNodeData;
  const color = HEALTH_COLORS[nodeData.health] ?? '#94a3b8';

  return (
    <div
      style={{
        border: `2px solid ${selected ? color : color + '88'}`,
        borderRadius: 8,
        padding: '8px 12px',
        background: selected ? '#1e293b' : '#0f172a',
        minWidth: 160,
        maxWidth: 240,
        boxShadow: selected ? `0 0 0 2px ${color}44` : 'none',
        transition: 'box-shadow 0.15s, background 0.15s',
      }}
    >
      <Handle type="target" position={Position.Left} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        {nodeData.impactScore && (
          <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.05em' }}>
            {nodeData.impactScore}
          </span>
        )}
        {nodeData.issueCount > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b' }}>
            {nodeData.issueCount} issue{nodeData.issueCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, color: '#e2e8f0', wordBreak: 'break-all', lineHeight: 1.4 }}>
        {nodeData.label}
      </div>

      {nodeData.gscClicks !== undefined && (
        <div style={{ fontSize: 10, color: '#475569', marginTop: 4, display: 'flex', gap: 8 }}>
          <span>{nodeData.gscClicks.toLocaleString()} clicks</span>
          {nodeData.ga4Sessions !== undefined && (
            <span>{nodeData.ga4Sessions.toLocaleString()} sessions</span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
