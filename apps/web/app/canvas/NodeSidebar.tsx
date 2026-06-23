'use client';

import type { Node } from '@xyflow/react';
import type { UrlNodeData } from '@/components/UrlNode';
import { HEALTH_COLORS } from '@/components/JourneyCanvas';
import { PATTERN_META, SOURCE_META } from '@/types/navflow';
import type { ActionBrief } from '@/types/navflow';

interface NodeSidebarProps {
  node: Node<UrlNodeData>;
  onClose: () => void;
}

const HEALTH_LABELS: Record<string, string> = {
  healthy:     'Healthy',
  leaking:     'Leaking',
  critical:    'Critical',
  opportunity: 'Opportunity',
};

const CONFIDENCE_STYLES = {
  high:   'text-green-400 bg-green-950 border-green-800',
  medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  low:    'text-slate-400 bg-slate-800 border-slate-700',
};

// Structured mock briefs — replaced by real LLM output (FastAPI + OpenRouter) in Week 4
const MOCK_BRIEFS: Record<string, ActionBrief> = {
  '/services/hvac-installation': {
    pattern: 'LEAKY_FUNNEL_ENTRY',
    issue: 'Strong keyword ranking driving traffic, but 72% of sessions exit before reaching a conversion event.',
    evidence: [
      '340 GSC clicks/month at avg. position 4.2 for "hvac installation dallas"',
      'GA4: 72% exit rate, 0 conversion events attributed to this page',
      'Crawl4AI: no internal links to /contact found on this page',
    ],
    action: 'Add a conversion CTA above the fold and one internal link to /contact. Consider a sticky "Get a Free Quote" button.',
    estimatedImpact: '15–25% conversion rate lift on this URL',
    confidence: 'high',
    sources: ['gsc', 'ga4', 'crawl4ai'],
  },
  '/blog/what-is-hvac': {
    pattern: 'SERP_TRAP',
    issue: 'High-impression informational page attracting users who exit immediately — page intent does not match visitor need.',
    evidence: [
      '510 GSC clicks/month at avg. position 6.8 — solid visibility',
      'GA4: 480 sessions, 68% single-page sessions (no deeper navigation)',
      'DataForSEO: top-ranking query is "hvac installation cost" (transactional) — informational page cannot convert it',
    ],
    action: 'Add a "How much does HVAC installation cost?" section with a CTA to the service page. Alternatively, create a dedicated cost-calculator page to capture the transactional intent.',
    estimatedImpact: '10–18% increase in service page visits from this entry point',
    confidence: 'high',
    sources: ['gsc', 'ga4', 'dataforseo'],
  },
  '/contact': {
    pattern: 'INVISIBLE_CONVERTER',
    issue: 'Top-performing conversion page with near-zero keyword visibility — entirely dependent on direct navigation.',
    evidence: [
      'GA4: highest conversion rate in the site (top quartile)',
      'GSC: only 90 clicks/month — mostly branded/navigational queries',
      'Crawl4AI: only 2 pages link internally to /contact',
    ],
    action: 'Add a /contact link or inline CTA to the 5 highest-traffic service pages. Protect this page in any future URL restructuring.',
    estimatedImpact: '20–35% increase in contact form submissions',
    confidence: 'medium',
    sources: ['gsc', 'ga4', 'crawl4ai'],
  },
};

export default function NodeSidebar({ node, onClose }: NodeSidebarProps) {
  const data = node.data as unknown as UrlNodeData;
  const healthColor = HEALTH_COLORS[data.health];
  const brief: ActionBrief | undefined = data.brief ?? MOCK_BRIEFS[data.label];
  const patterns = data.patterns ?? (brief ? [brief.pattern] : []);
  const sources = data.sources ?? brief?.sources ?? [];

  return (
    <aside className="w-96 h-full bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: healthColor, flexShrink: 0 }} />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {HEALTH_LABELS[data.health]}
          </span>
          {data.impactScore && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ color: healthColor, background: healthColor + '22' }}
            >
              {data.impactScore}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1">
          ×
        </button>
      </div>

      {/* URL */}
      <div className="px-5 py-3 border-b border-slate-700">
        <p className="font-mono text-xs text-slate-400 mb-0.5">URL</p>
        <p className="font-mono text-sm text-slate-100 break-all">{data.label}</p>
      </div>

      {/* Metrics */}
      <div className="px-5 py-3 border-b border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">GSC Clicks</p>
          <p className="text-lg font-semibold text-slate-100 tabular-nums">
            {data.gscClicks?.toLocaleString() ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">GA4 Sessions</p>
          <p className="text-lg font-semibold text-slate-100 tabular-nums">
            {data.ga4Sessions?.toLocaleString() ?? '—'}
          </p>
        </div>
      </div>

      {/* Issue pattern badges */}
      {patterns.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Issue Patterns</p>
          <div className="flex flex-wrap gap-2">
            {patterns.map(p => {
              const meta = PATTERN_META[p];
              return (
                <span
                  key={p}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{ color: meta.color, background: meta.bg, borderColor: meta.color + '44' }}
                  title={meta.description}
                >
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Action brief */}
      <div className="px-5 py-3 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Action Brief</p>

        {brief ? (
          <div className="space-y-4">
            {/* Issue */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Issue</p>
              <p className="text-sm text-slate-200 leading-relaxed">{brief.issue}</p>
            </div>

            {/* Evidence */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Evidence</p>
              <ul className="space-y-1.5">
                {brief.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-600 flex-shrink-0 mt-0.5">·</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Recommended Action</p>
              <p className="text-sm text-slate-200 leading-relaxed">{brief.action}</p>
            </div>

            {/* Impact + confidence */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <p className="text-xs text-slate-500 mb-1">Est. Impact</p>
                <p className="text-sm font-medium text-green-400">{brief.estimatedImpact}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded border uppercase font-semibold tracking-wider flex-shrink-0 ${CONFIDENCE_STYLES[brief.confidence]}`}
              >
                {brief.confidence}
              </span>
            </div>

            {/* Data source attribution */}
            {sources.length > 0 && (
              <div className="pt-1 border-t border-slate-800">
                <p className="text-xs text-slate-600 mb-2">Data sources</p>
                <div className="flex gap-1.5">
                  {(['gsc', 'ga4', 'dataforseo', 'crawl4ai'] as const).map(s => {
                    const active = sources.includes(s);
                    const meta = SOURCE_META[s];
                    return (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 rounded border font-mono"
                        style={
                          active
                            ? { color: meta.color, borderColor: meta.color + '66', background: meta.color + '18' }
                            : { color: '#334155', borderColor: '#1e293b', background: 'transparent' }
                        }
                      >
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600 italic">
            No issues detected — this page is performing as expected.
          </p>
        )}
      </div>
    </aside>
  );
}
