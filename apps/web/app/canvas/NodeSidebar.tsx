'use client';

import type { Node } from '@xyflow/react';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, Droplets, Zap, ArrowRight, X } from 'lucide-react';
import type { UrlNodeData } from '@/components/UrlNode';
import { HEALTH_COLORS } from '@/components/JourneyCanvas';
import { PATTERN_META, SOURCE_META } from '@/types/navflow';
import { getPortKind, type PortKind } from '@/lib/variableEngine';
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

const HEALTH_ICONS = {
  critical:    AlertTriangle,
  leaking:     TrendingDown,
  opportunity: TrendingUp,
  healthy:     CheckCircle2,
};

const PORT_KIND_META: Record<PortKind, { label: string; color: string; desc: string; icon: React.ElementType }> = {
  leak:        { label: 'Traffic Leak',    color: '#dc2626', desc: 'Sessions entering here have high exit risk. Fix this before scaling traffic.', icon: Droplets },
  amplifier:   { label: 'Conv. Amplifier', color: '#2563eb', desc: 'This page boosts conversion probability. Protect it and add internal links to it.', icon: Zap },
  passthrough: { label: 'Passthrough',     color: '#6b7280', desc: 'Sessions flow through without issue. No immediate action required.', icon: ArrowRight },
  entry:       { label: 'Entry Point',     color: '#16a34a', desc: 'Primary traffic entry into the funnel.', icon: ArrowRight },
  sink:        { label: 'Terminal Node',   color: '#7c3aed', desc: 'Sessions end here — conversion or exit. Monitor exit rate closely.', icon: CheckCircle2 },
};

const CONFIDENCE_META = {
  high:   { color: '#16a34a', bg: 'color-mix(in srgb, #16a34a 10%, transparent)', border: 'color-mix(in srgb, #16a34a 30%, transparent)' },
  medium: { color: '#ca8a04', bg: 'color-mix(in srgb, #ca8a04 10%, transparent)', border: 'color-mix(in srgb, #ca8a04 30%, transparent)' },
  low:    { color: 'var(--ink-dim)', bg: 'var(--surface-raised)', border: 'var(--border)' },
};

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
    action: 'Add a "How much does HVAC installation cost?" section with a CTA to the service page.',
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
    action: 'Add a /contact link or inline CTA to the 5 highest-traffic service pages.',
    estimatedImpact: '20–35% increase in contact form submissions',
    confidence: 'medium',
    sources: ['gsc', 'ga4', 'crawl4ai'],
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const,
      color: 'var(--ink-dim)', marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0' }} />;
}

export default function NodeSidebar({ node, onClose }: NodeSidebarProps) {
  const data = node.data as unknown as UrlNodeData;
  const healthColor = HEALTH_COLORS[data.health];
  const healthLabel = HEALTH_LABELS[data.health];
  const HealthIcon = HEALTH_ICONS[data.health as keyof typeof HEALTH_ICONS] ?? CheckCircle2;
  const brief: ActionBrief | undefined = data.brief ?? MOCK_BRIEFS[data.label];
  const patterns = data.patterns ?? (brief ? [brief.pattern] : []);
  const sources = data.sources ?? brief?.sources ?? [];

  const portKind = getPortKind(data.health);
  const portMeta = PORT_KIND_META[portKind];
  const PortIcon = portMeta.icon;

  return (
    <aside
      className="animate-slide-in-right"
      style={{
        width: 320, flexShrink: 0, height: '100%',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header band — matches node visual language */}
      <div style={{
        padding: '10px 14px',
        background: `color-mix(in srgb, ${healthColor} 8%, var(--surface))`,
        borderBottom: `1px solid color-mix(in srgb, ${healthColor} 18%, var(--border))`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <HealthIcon size={14} strokeWidth={2} style={{ color: healthColor, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: healthColor, flex: 1 }}>
          {healthLabel}
        </span>
        {data.impactScore && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            color: healthColor,
            background: `color-mix(in srgb, ${healthColor} 12%, transparent)`,
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
          }}>
            {data.impactScore}
          </span>
        )}
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 5, border: 'none',
            background: 'transparent', color: 'var(--ink-dim)', cursor: 'pointer',
            marginLeft: 4, flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--ink)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-dim)'; }}
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* URL */}
        <div style={{ padding: '12px 14px' }}>
          <SectionLabel>URL</SectionLabel>
          <code style={{
            fontSize: 11, color: 'var(--ink)', lineHeight: 1.5,
            wordBreak: 'break-all', display: 'block',
            fontFamily: 'var(--font-mono)',
          }}>
            {data.label}
          </code>
        </div>

        <Divider />

        {/* Metrics */}
        <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
              GSC Clicks / mo
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {data.gscClicks?.toLocaleString() ?? '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 4 }}>
              GA4 Sessions
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {data.ga4Sessions?.toLocaleString() ?? '—'}
            </div>
          </div>
        </div>

        <Divider />

        {/* Port Kind (variable engine) */}
        <div style={{ padding: '12px 14px' }}>
          <SectionLabel>Traffic Role</SectionLabel>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '8px 10px', borderRadius: 6,
            background: `color-mix(in srgb, ${portMeta.color} 6%, var(--bg-subtle))`,
            border: `1px solid color-mix(in srgb, ${portMeta.color} 20%, var(--border))`,
          }}>
            <PortIcon size={13} style={{ color: portMeta.color, flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: portMeta.color, marginBottom: 2 }}>
                {portMeta.label}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                {portMeta.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Issue patterns */}
        {patterns.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '12px 14px' }}>
              <SectionLabel>Issue Patterns</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {patterns.map(p => {
                  const meta = PATTERN_META[p];
                  return (
                    <span
                      key={p}
                      title={meta.description}
                      style={{
                        fontSize: 10.5, padding: '3px 8px', borderRadius: 20,
                        color: meta.color,
                        background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
                        fontWeight: 500,
                      }}
                    >
                      {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Action brief */}
        {brief && (
          <>
            <Divider />
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionLabel>Action Brief</SectionLabel>

              {/* Issue */}
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  Issue
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                  {brief.issue}
                </p>
              </div>

              {/* Evidence */}
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 7, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  Evidence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {brief.evidence.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--border)', flexShrink: 0, marginTop: 2 }}>▸</span>
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended action */}
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  Action
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                  {brief.action}
                </p>
              </div>

              {/* Impact + confidence */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                    Est. Impact
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                    {brief.estimatedImpact}
                  </div>
                </div>
                <span style={{
                  fontSize: 9.5, padding: '3px 8px', borderRadius: 4,
                  fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, flexShrink: 0,
                  color: CONFIDENCE_META[brief.confidence].color,
                  background: CONFIDENCE_META[brief.confidence].bg,
                  border: `1px solid ${CONFIDENCE_META[brief.confidence].border}`,
                }}>
                  {brief.confidence} confidence
                </span>
              </div>

              {/* Data sources */}
              {sources.length > 0 && (
                <div>
                  <div style={{ fontSize: 9.5, color: 'var(--ink-dim)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                    Data Sources
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(['gsc', 'ga4', 'dataforseo', 'crawl4ai'] as const).map(s => {
                      const active = sources.includes(s);
                      const meta = SOURCE_META[s];
                      return (
                        <span
                          key={s}
                          style={{
                            fontSize: 9.5, padding: '2px 7px', borderRadius: 4,
                            fontFamily: 'var(--font-mono)', fontWeight: 500,
                            ...(active
                              ? { color: meta.color, border: `1px solid color-mix(in srgb, ${meta.color} 40%, transparent)`, background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }
                              : { color: 'var(--border)', border: '1px solid var(--border-subtle)', background: 'transparent' }
                            ),
                          }}
                        >
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!brief && (
          <>
            <Divider />
            <div style={{ padding: '16px 14px' }}>
              <p style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic', margin: 0 }}>
                No issues detected — this page is performing as expected.
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
