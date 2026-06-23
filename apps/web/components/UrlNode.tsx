'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { IssuePattern, DataSource, ActionBrief } from '@/types/navflow';
import { PATTERN_META } from '@/types/navflow';

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
  // DoubleLoop enhancements
  maxSessions?: number;    // injected by CanvasShell for bar scaling
  cascadeDepth?: number;   // 0 = issue source, 1+ = downstream, undefined = unaffected
}

const HEALTH_COLORS: Record<string, string> = {
  healthy:     '#16a34a',
  leaking:     '#ca8a04',
  critical:    '#dc2626',
  opportunity: '#2563eb',
};

const IMPACT_COLORS: Record<string, string> = {
  P0: '#dc2626',
  P1: '#ca8a04',
  P2: '#2563eb',
  P3: '#9ca3af',
};

export default function UrlNode({ data, selected }: NodeProps) {
  const d = data as unknown as UrlNodeData;
  const healthColor = HEALTH_COLORS[d.health] ?? '#9ca3af';

  // Cascade dimming: downstream nodes fade; issue sources stay vivid
  const isIssueSource = d.health === 'critical' || d.health === 'leaking';
  const cascadeOpacity = (d.cascadeDepth !== undefined && !isIssueSource)
    ? Math.max(0.45, 1 - d.cascadeDepth * 0.2)
    : 1;

  // Traffic bar: session volume relative to max
  const sessionPct = (d.ga4Sessions && d.maxSessions)
    ? Math.max(4, (d.ga4Sessions / d.maxSessions) * 100)
    : 0;

  // Cascade background tint on downstream nodes
  const cascadeTint = (d.cascadeDepth && d.cascadeDepth > 0 && !isIssueSource)
    ? `color-mix(in srgb, #dc2626 ${d.cascadeDepth * 2}%, var(--surface))`
    : 'var(--surface)';

  return (
    <div
      style={{
        width: 220,
        background: cascadeTint,
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8,
        boxShadow: selected
          ? `0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent), var(--shadow-node)`
          : 'var(--shadow-node)',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.3s',
        overflow: 'hidden',
        opacity: cascadeOpacity,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'var(--border)', border: '2px solid var(--surface)' }}
      />

      {/* Health strip — 2px top */}
      <div style={{ height: 2, background: healthColor, opacity: 0.85 }} />

      <div style={{ padding: '8px 10px 6px' }}>
        {/* Row 1: health dot + URL label + priority */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: healthColor, flexShrink: 0, marginTop: 3,
            }}
          />
          <span
            style={{
              flex: 1, fontSize: 11, color: 'var(--ink)', fontFamily: 'var(--font-mono)',
              lineHeight: 1.4, wordBreak: 'break-all',
            }}
          >
            {d.label}
          </span>
          {d.impactScore && (
            <span
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                color: IMPACT_COLORS[d.impactScore],
                background: `color-mix(in srgb, ${IMPACT_COLORS[d.impactScore]} 12%, transparent)`,
                padding: '1px 5px', borderRadius: 4, flexShrink: 0,
              }}
            >
              {d.impactScore}
            </span>
          )}
        </div>

        {/* Pattern chips */}
        {d.patterns && d.patterns.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6, marginLeft: 12 }}>
            {d.patterns.map(p => {
              const meta = PATTERN_META[p];
              return (
                <span
                  key={p}
                  style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 3,
                    color: meta.color,
                    background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
                    letterSpacing: '0.02em',
                  }}
                >
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Traffic volume bar + metrics */}
        {d.ga4Sessions !== undefined && (
          <div style={{ marginLeft: 12 }}>
            {/* Volume bar */}
            {sessionPct > 0 && (
              <div style={{
                height: 3, borderRadius: 2, background: 'var(--border-subtle)',
                marginBottom: 4, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${sessionPct}%`,
                  background: healthColor,
                  opacity: 0.6,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
            {/* Metric text */}
            <div style={{
              display: 'flex', gap: 8,
              fontSize: 10, color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums',
            }}>
              <span>{d.gscClicks?.toLocaleString()} clicks</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{d.ga4Sessions.toLocaleString()} sessions</span>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'var(--border)', border: '2px solid var(--surface)' }}
      />
    </div>
  );
}
