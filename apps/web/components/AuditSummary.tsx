'use client';

import type { Node } from '@xyflow/react';
import type { UrlNodeData } from './UrlNode';

interface AuditSummaryProps {
  nodes: Node<UrlNodeData>[];
}

export default function AuditSummary({ nodes }: AuditSummaryProps) {
  const critical   = nodes.filter(n => n.data.health === 'critical').length;
  const leaking    = nodes.filter(n => n.data.health === 'leaking').length;
  const opportunity = nodes.filter(n => n.data.health === 'opportunity').length;
  const sessionsAtRisk = nodes
    .filter(n => n.data.health === 'critical' || n.data.health === 'leaking')
    .reduce((sum, n) => sum + (n.data.ga4Sessions ?? 0), 0);

  const stats = [
    { label: 'URLs Audited',       value: nodes.length,               color: 'text-slate-300' },
    { label: 'Critical',           value: critical,                   color: 'text-red-400' },
    { label: 'Leaking',            value: leaking,                    color: 'text-yellow-400' },
    { label: 'Opportunities',      value: opportunity,                color: 'text-blue-400' },
    { label: 'Sessions at Risk',   value: sessionsAtRisk.toLocaleString(), color: 'text-orange-400' },
  ];

  return (
    <div className="flex-shrink-0 border-b border-slate-800 bg-slate-950 flex items-center px-5 gap-8 h-10">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <span className={`text-sm font-semibold tabular-nums ${color}`}>{value}</span>
          <span className="text-xs text-slate-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
