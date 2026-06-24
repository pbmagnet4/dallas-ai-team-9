'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
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
  maxSessions?: number;
  cascadeDepth?: number;
}

const HEALTH_COLORS: Record<string, string> = {
  healthy:     '#16a34a',
  leaking:     '#ca8a04',
  critical:    '#dc2626',
  opportunity: '#2563eb',
};

const HEALTH_LABELS: Record<string, string> = {
  healthy:     'Healthy',
  leaking:     'Leaking',
  critical:    'Critical',
  opportunity: 'Opportunity',
};

const HEALTH_ICONS = {
  critical:    AlertTriangle,
  leaking:     TrendingDown,
  opportunity: TrendingUp,
  healthy:     CheckCircle2,
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
  const healthLabel = HEALTH_LABELS[d.health] ?? d.health;
  const HealthIcon = HEALTH_ICONS[d.health as keyof typeof HEALTH_ICONS] ?? CheckCircle2;

  const isIssueSource = d.health === 'critical' || d.health === 'leaking';
  const cascadeOpacity = (d.cascadeDepth !== undefined && !isIssueSource)
    ? Math.max(0.45, 1 - d.cascadeDepth * 0.2)
    : 1;

  const sessionPct = (d.ga4Sessions && d.maxSessions)
    ? Math.max(4, (d.ga4Sessions / d.maxSessions) * 100)
    : 0;

  const cascadeTint = (d.cascadeDepth && d.cascadeDepth > 0 && !isIssueSource)
    ? `color-mix(in srgb, #dc2626 ${d.cascadeDepth * 2}%, var(--surface))`
    : 'var(--surface)';

  return (
    <div
      style={{
        width: 220,
        background: cascadeTint,
        border: `1px solid ${
          selected
            ? 'var(--accent)'
            : `color-mix(in srgb, ${healthColor} 22%, var(--border))`
        }`,
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
        style={{ background: healthColor, opacity: 0.5, border: '2px solid var(--surface)', width: 8, height: 8 }}
      />

      {/* Health header band */}
      <div style={{
        padding: '6px 8px',
        background: `color-mix(in srgb, ${healthColor} 10%, var(--surface))`,
        borderBottom: `1px solid color-mix(in srgb, ${healthColor} 20%, var(--border))`,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <HealthIcon
          size={11}
          strokeWidth={2.5}
          style={{ color: healthColor, flexShrink: 0 }}
        />
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase' as const, color: healthColor, flex: 1,
        }}>
          {healthLabel}
        </span>
        {d.impactScore && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em',
            color: IMPACT_COLORS[d.impactScore],
            background: `color-mix(in srgb, ${IMPACT_COLORS[d.impactScore]} 12%, transparent)`,
            padding: '1px 5px', borderRadius: 3, flexShrink: 0,
          }}>
            {d.impactScore}
          </span>
        )}
      </div>

      {/* Node body */}
      <div style={{ padding: '7px 8px 8px' }}>
        {/* URL */}
        <span style={{
          display: 'block', fontSize: 10, color: 'var(--ink)',
          fontFamily: 'var(--font-mono)', lineHeight: 1.4,
          wordBreak: 'break-all', marginBottom: d.patterns?.length ? 5 : 4,
        }}>
          {d.label}
        </span>

        {/* Pattern chips */}
        {d.patterns && d.patterns.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 5 }}>
            {d.patterns.map(p => {
              const meta = PATTERN_META[p];
              return (
                <span
                  key={p}
                  style={{
                    fontSize: 8.5, padding: '1px 5px', borderRadius: 3,
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

        {/* Traffic bar + metrics */}
        {d.ga4Sessions !== undefined && (
          <>
            {sessionPct > 0 && (
              <div style={{
                height: 2, borderRadius: 1,
                background: 'var(--border-subtle)', marginBottom: 4, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 1,
                  width: `${sessionPct}%`,
                  background: healthColor, opacity: 0.55,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
            <div style={{
              display: 'flex', gap: 6, fontSize: 9.5,
              color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums',
            }}>
              <span>{d.gscClicks?.toLocaleString()} clicks</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{d.ga4Sessions.toLocaleString()} sessions</span>
            </div>
          </>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: healthColor, opacity: 0.5, border: '2px solid var(--surface)', width: 8, height: 8 }}
      />
    </div>
  );
}
