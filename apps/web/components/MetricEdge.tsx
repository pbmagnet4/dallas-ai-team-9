'use client';

import { useState } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, type EdgeProps } from '@xyflow/react';
import type { EdgeMetrics } from '@/lib/variableEngine';

interface MetricEdgeData {
  flowWeight?: number;
  cascade?: boolean;
  metrics?: EdgeMetrics;
}

export default function MetricEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style, data, markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const d = data as MetricEdgeData | undefined;
  const metrics = d?.metrics;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {/* Wide transparent hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'default' }}
      />
      {hovered && metrics && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY - 8}px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 10px',
              boxShadow: 'var(--shadow-md)',
              fontSize: 10,
              lineHeight: 1.75,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
              minWidth: 140,
            }}>
              <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 3, fontVariantNumeric: 'tabular-nums' }}>
                {metrics.sessions.toLocaleString()} sessions
              </div>
              <MetricRow label="Drop-off" value={`${(metrics.dropOffRate * 100).toFixed(0)}%`} warn={metrics.dropOffRate > 0.4} />
              <MetricRow label="Conv. potential" value={`${(metrics.conversionPotential * 100).toFixed(0)}%`} good={metrics.conversionPotential >= 0.5} />
              <MetricRow label="Flow share" value={`${(metrics.flowShare * 100).toFixed(0)}%`} />
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function MetricRow({ label, value, warn, good }: { label: string; value: string; warn?: boolean; good?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 16,
      color: warn ? '#ca8a04' : good ? '#16a34a' : 'var(--ink-dim)',
    }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
