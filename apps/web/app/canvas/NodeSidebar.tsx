'use client';

import type { Node } from '@xyflow/react';
import type { UrlNodeData } from '@/components/UrlNode';
// UrlNodeData extends Record<string, unknown> to satisfy React Flow's Node constraint
import { HEALTH_COLORS } from '@/components/JourneyCanvas';

interface NodeSidebarProps {
  node: Node<UrlNodeData>;
  onClose: () => void;
}

const HEALTH_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  leaking: 'Leaking',
  critical: 'Critical',
  opportunity: 'Opportunity',
};

// Placeholder briefs — replaced by real LLM output in Week 4
const MOCK_BRIEFS: Record<string, string> = {
  '/services/hvac-installation':
    'This page ranks for "hvac installation dallas" (pos 4, 340 GSC clicks) but GA4 shows 72% exit rate with 0 conversion events. Crawl4AI found no CTA links to /contact. Pattern: SERP Trap. Fix: add a conversion CTA above the fold and an internal link to the contact page. Estimated lift: 15–25% conversion rate.',
  '/blog/what-is-hvac':
    'High-traffic entry page (480 sessions/month) with dominant exit path off-site. No internal links to service pages found in crawl. Pattern: Leaky Funnel Entry. Fix: add contextual CTAs to /services/hvac-installation and /services/ac-repair. Estimated lift: 10–18% service page visits.',
  '/contact':
    'Top conversion page (conversion rate top quartile) but receives only 2 inbound internal links. Pattern: Invisible Converter. Fix: add contact link to the 5 highest-traffic service pages. Protect this page in any future restructuring.',
};

export default function NodeSidebar({ node, onClose }: NodeSidebarProps) {
  const data = node.data as unknown as UrlNodeData;
  const color = HEALTH_COLORS[data.health];
  const brief = MOCK_BRIEFS[data.label];

  return (
    <aside className="w-96 h-full bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            {HEALTH_LABELS[data.health]}
            {data.impactScore && <span className="ml-2 text-slate-500">· {data.impactScore}</span>}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
      </div>

      <div className="px-5 py-4 border-b border-slate-700">
        <p className="font-mono text-sm text-slate-200 break-all">{data.label}</p>
      </div>

      <div className="px-5 py-4 border-b border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">GSC Clicks</p>
          <p className="text-lg font-semibold text-slate-100">{data.gscClicks?.toLocaleString() ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">GA4 Sessions</p>
          <p className="text-lg font-semibold text-slate-100">{data.ga4Sessions?.toLocaleString() ?? '—'}</p>
        </div>
      </div>

      <div className="px-5 py-4 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Action Brief</p>
        {brief ? (
          <p className="text-sm text-slate-300 leading-relaxed">{brief}</p>
        ) : (
          <p className="text-sm text-slate-600 italic">No issues detected — this page is performing as expected.</p>
        )}
      </div>
    </aside>
  );
}
