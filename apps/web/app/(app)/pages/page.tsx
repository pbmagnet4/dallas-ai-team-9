import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata = { title: 'NavFlow — URL Inventory' };

const HEALTH_COLORS: Record<string, string> = {
  healthy:     '#16a34a',
  leaking:     '#ca8a04',
  critical:    '#dc2626',
  opportunity: '#2563eb',
};

const HEALTH_LABELS: Record<string, string> = {
  healthy: 'Healthy', leaking: 'Leaking', critical: 'Critical', opportunity: 'Opportunity',
};

import { PATTERN_META } from '@/types/navflow';

const PAGES = [
  {
    url: '/home', health: 'healthy', patterns: [], clicks: 820, sessions: 740,
    audited: 'Jun 2026', impactScore: null,
  },
  {
    url: '/services/hvac-installation', health: 'critical',
    patterns: ['LEAKY_FUNNEL_ENTRY', 'SERP_TRAP'], clicks: 340, sessions: 290,
    audited: 'Jun 2026', impactScore: 'P0',
  },
  {
    url: '/blog/what-is-hvac', health: 'leaking',
    patterns: ['SERP_TRAP'], clicks: 510, sessions: 480,
    audited: 'Jun 2026', impactScore: 'P1',
  },
  {
    url: '/contact', health: 'opportunity',
    patterns: ['INVISIBLE_CONVERTER'], clicks: 90, sessions: 85,
    audited: 'Jun 2026', impactScore: 'P1',
  },
  {
    url: '/services/ac-repair', health: 'healthy', patterns: [], clicks: 210, sessions: 195,
    audited: 'Jun 2026', impactScore: null,
  },
];

export default function PagesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Page header */}
      <div style={{
        padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
            URL Inventory
          </h1>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
            {PAGES.length} pages audited · Demo Site Co. · Jun 2026
          </p>
        </div>
        <Link
          href="/canvas"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 6, fontSize: 12,
            border: '1px solid var(--border)', background: 'var(--surface-raised)',
            color: 'var(--ink-muted)', textDecoration: 'none',
          }}
        >
          View canvas <ArrowUpRight size={12} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['URL', 'Health', 'Patterns', 'GSC Clicks', 'Sessions', 'Audited', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 500, color: 'var(--ink-dim)', background: 'var(--surface)',
                    position: 'sticky', top: 0, borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAGES.map((page, i) => {
              const hc = HEALTH_COLORS[page.health];
              return (
                <tr
                  key={page.url}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink)',
                    }}>
                      {page.url}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: hc, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: hc }}>{HEALTH_LABELS[page.health]}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {page.patterns.length === 0 ? (
                        <span style={{ fontSize: 11, color: 'var(--ink-dim)' }}>—</span>
                      ) : page.patterns.map(p => {
                        const meta = PATTERN_META[p as keyof typeof PATTERN_META];
                        return (
                          <span
                            key={p}
                            style={{
                              fontSize: 10, padding: '1px 6px', borderRadius: 3,
                              color: meta.color,
                              background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${meta.color} 25%, transparent)`,
                            }}
                          >
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {page.clicks.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {page.sessions.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ink-dim)' }}>
                    {page.audited}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href="/canvas"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
                        color: 'var(--accent)', textDecoration: 'none',
                      }}
                    >
                      View <ArrowUpRight size={11} strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
