'use client';

import type { Node } from '@xyflow/react';
import type { UrlNodeData } from './UrlNode';
import { Sparkles } from 'lucide-react';

interface AuditSummaryProps {
  nodes: Node<UrlNodeData>[];
  onAIToggle?: () => void;
  aiPanelOpen?: boolean;
}

export default function AuditSummary({ nodes, onAIToggle, aiPanelOpen }: AuditSummaryProps) {
  const critical    = nodes.filter(n => n.data.health === 'critical').length;
  const leaking     = nodes.filter(n => n.data.health === 'leaking').length;
  const opportunity = nodes.filter(n => n.data.health === 'opportunity').length;
  const sessionsAtRisk = nodes
    .filter(n => n.data.health === 'critical' || n.data.health === 'leaking')
    .reduce((sum, n) => sum + (n.data.ga4Sessions ?? 0), 0);

  const stats = [
    { label: 'URLs Audited',     value: nodes.length,      color: 'var(--ink-muted)',  always: true },
    { label: 'Critical',         value: critical,          color: '#dc2626', },
    { label: 'Leaking',          value: leaking,           color: '#ca8a04', },
    { label: 'Opportunities',    value: opportunity,       color: 'var(--accent)', },
    { label: 'Sessions at Risk', value: sessionsAtRisk,    color: '#ea580c', },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        flexShrink: 0,
        height: 40,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 0,
      }}
    >
      {stats.map(({ label, value, color, always }, i) => {
        const dimmed = !always && value === 0;
        return (
          <div
            key={label}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 5,
              padding: '0 12px',
              borderRight: i < stats.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <span style={{
              fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              color: dimmed ? 'var(--border)' : color,
              transition: 'color 0.2s',
            }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span style={{
              fontSize: 11,
              color: dimmed ? 'var(--border-subtle)' : 'var(--ink-dim)',
              transition: 'color 0.2s',
            }}>
              {label}
            </span>
          </div>
        );
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          demo
        </span>
        {onAIToggle && (
          <button
            onClick={onAIToggle}
            title="AI Assistant"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', borderRadius: 5,
              border: `1px solid ${aiPanelOpen ? 'var(--accent)' : 'var(--border)'}`,
              background: aiPanelOpen ? 'var(--accent-subtle)' : 'transparent',
              color: aiPanelOpen ? 'var(--accent)' : 'var(--ink-dim)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}
          >
            <Sparkles size={12} strokeWidth={1.5} />
            <span>AI</span>
          </button>
        )}
      </div>
    </div>
  );
}
