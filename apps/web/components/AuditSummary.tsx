'use client';

import type { Node } from '@xyflow/react';
import type { UrlNodeData } from './UrlNode';

interface AuditSummaryProps {
  nodes: Node<UrlNodeData>[];
}

export default function AuditSummary({ nodes }: AuditSummaryProps) {
  const critical    = nodes.filter(n => n.data.health === 'critical').length;
  const leaking     = nodes.filter(n => n.data.health === 'leaking').length;
  const opportunity = nodes.filter(n => n.data.health === 'opportunity').length;
  const sessionsAtRisk = nodes
    .filter(n => n.data.health === 'critical' || n.data.health === 'leaking')
    .reduce((sum, n) => sum + (n.data.ga4Sessions ?? 0), 0);

  const stats = [
    { label: 'URLs Audited',     value: String(nodes.length),               color: '#94a3b8', dimmed: false },
    { label: 'Critical',         value: String(critical),                   color: '#f87171', dimmed: critical === 0 },
    { label: 'Leaking',          value: String(leaking),                    color: '#facc15', dimmed: leaking === 0 },
    { label: 'Opportunities',    value: String(opportunity),                color: '#60a5fa', dimmed: opportunity === 0 },
    { label: 'Sessions at Risk', value: sessionsAtRisk.toLocaleString(),    color: '#fb923c', dimmed: sessionsAtRisk === 0 },
  ];

  return (
    <div className="flex-shrink-0 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center px-6 gap-8 h-11 animate-fade-in">
      {stats.map(({ label, value, color, dimmed }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <span
            className="text-sm font-bold tabular-nums transition-colors"
            style={{ color: dimmed ? '#334155' : color }}
          >
            {value}
          </span>
          <span className="text-xs" style={{ color: dimmed ? '#1e293b' : '#475569' }}>{label}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-slate-700 font-mono">demo mode</span>
      </div>
    </div>
  );
}
