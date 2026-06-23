import { CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export const metadata = { title: 'NavFlow — Data Sources' };

const SOURCES = [
  {
    id: 'gsc',
    name: 'Google Search Console',
    description: 'Clicks, impressions, CTR, and position data for every URL.',
    status: 'connected' as const,
    lastSync: '2 hours ago',
    dataPoints: '1,240 URLs',
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    description: 'Sessions, bounce rate, conversions, and user behavior per URL.',
    status: 'connected' as const,
    lastSync: '2 hours ago',
    dataPoints: '856 sessions tracked',
  },
  {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'Keyword rankings, SERP features, intent classification, and search volume.',
    status: 'pending' as const,
    lastSync: 'Not synced',
    dataPoints: 'Awaiting OAuth',
  },
  {
    id: 'crawl4ai',
    name: 'Crawl4AI',
    description: 'On-page content, internal link graph, heading structure, and CTA detection.',
    status: 'pending' as const,
    lastSync: 'Not synced',
    dataPoints: 'Awaiting setup',
  },
];

const STATUS_CONFIG = {
  connected: { label: 'Connected', color: '#16a34a', bg: 'color-mix(in srgb, #16a34a 10%, transparent)', icon: CheckCircle2 },
  pending:   { label: 'Not Connected', color: 'var(--ink-dim)', bg: 'var(--surface-raised)', icon: Clock },
  error:     { label: 'Auth Error', color: '#dc2626', bg: 'color-mix(in srgb, #dc2626 10%, transparent)', icon: AlertCircle },
};

const SOURCE_ICONS: Record<string, string> = {
  gsc: 'G',
  ga4: 'A',
  dataforseo: 'D',
  crawl4ai: 'C',
};

export default function SourcesPage() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, overflowY: 'auto', height: '100%' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
          Data Sources
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 480 }}>
          Connect your analytics and SEO tools. NavFlow correlates data across all sources to detect journey issues.
        </p>
      </div>

      {/* Source cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SOURCES.map(source => {
          const cfg = STATUS_CONFIG[source.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={source.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 18px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Logo placeholder */}
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                border: '1px solid var(--border)', background: 'var(--surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--ink-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {SOURCE_ICONS[source.id]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                    {source.name}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, padding: '1px 7px', borderRadius: 4,
                    color: cfg.color, background: cfg.bg,
                  }}>
                    <StatusIcon size={10} strokeWidth={2} />
                    {cfg.label}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-dim)', marginBottom: 4 }}>
                  {source.description}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ink-dim)' }}>
                  <span>Last sync: {source.lastSync}</span>
                  <span>{source.dataPoints}</span>
                </div>
              </div>

              <button
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12,
                  border: source.status === 'connected' ? '1px solid var(--border)' : '1px solid var(--accent)',
                  background: source.status === 'connected' ? 'transparent' : 'var(--accent)',
                  color: source.status === 'connected' ? 'var(--ink-muted)' : 'var(--accent-ink)',
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {source.status === 'connected' ? (
                  <><ExternalLink size={11} strokeWidth={1.5} /> Manage</>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div style={{
        marginTop: 24, padding: '12px 14px', borderRadius: 6,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)',
        fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--ink-muted)' }}>Demo mode.</strong> GSC and GA4 are pre-connected with cached audit data from Demo Site Co. Connecting real sources requires OAuth authorization and will trigger a fresh audit.
      </div>
    </div>
  );
}
