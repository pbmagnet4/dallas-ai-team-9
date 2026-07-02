export const metadata = { title: 'NavFlow — Issues' };

import { PATTERN_META } from '@/types/navflow';

const ISSUES = [
  {
    id: '1',
    url: '/services/hvac-installation',
    pattern: 'BURIED_PAGE' as const,
    priority: 'P0',
    impact: '15–25% conversion lift',
    action: 'Add a conversion CTA above the fold and one internal link to /contact.',
    sessions: 290,
    dismissed: false,
  },
  {
    id: '2',
    url: '/services/hvac-installation',
    pattern: 'RANKING_OPPORTUNITY' as const,
    priority: 'P0',
    impact: '10–15% CTR improvement',
    action: 'Rewrite title tag to match transactional intent.',
    sessions: 290,
    dismissed: false,
  },
  {
    id: '3',
    url: '/blog/what-is-hvac',
    pattern: 'RANKING_OPPORTUNITY' as const,
    priority: 'P1',
    impact: '10–18% service page visits',
    action: 'Add HVAC cost section + CTA to service page.',
    sessions: 480,
    dismissed: false,
  },
  {
    id: '4',
    url: '/contact',
    pattern: 'ORPHAN_PAGE' as const,
    priority: 'P1',
    impact: '20–35% more form submissions',
    action: 'Add /contact links to 5 highest-traffic service pages.',
    sessions: 85,
    dismissed: false,
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  P0: '#dc2626', P1: '#ca8a04', P2: '#2563eb', P3: '#9ca3af',
};

export default function IssuesPage() {
  const open = ISSUES.filter(i => !i.dismissed);
  const critical = open.filter(i => i.priority === 'P0');
  const rest = open.filter(i => i.priority !== 'P0');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, overflowY: 'auto', height: '100%' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Detected Issues
          </h1>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
            {open.length} open issues · {critical.length} critical · 770 sessions at risk
          </p>
        </div>
        <span style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 4,
          background: 'color-mix(in srgb, #dc2626 10%, transparent)',
          color: '#dc2626', fontWeight: 500,
        }}>
          {critical.length} P0
        </span>
      </div>

      {/* Issue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...critical, ...rest].map(issue => {
          const meta = PATTERN_META[issue.pattern];
          const pc = PRIORITY_COLORS[issue.priority];
          return (
            <div
              key={issue.id}
              style={{
                padding: '14px 16px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Row 1: URL + priority + pattern */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  color: pc, background: `color-mix(in srgb, ${pc} 12%, transparent)`,
                  letterSpacing: '0.04em',
                }}>
                  {issue.priority}
                </span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink)', flex: 1 }}>
                  {issue.url}
                </span>
                <span style={{
                  fontSize: 10, padding: '1px 7px', borderRadius: 4,
                  color: meta.color,
                  background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${meta.color} 25%, transparent)`,
                }}>
                  {meta.label}
                </span>
              </div>

              {/* Row 2: action */}
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                {issue.action}
              </p>

              {/* Row 3: impact + sessions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 11, color: '#16a34a' }}>
                  ↑ {issue.impact}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-dim)' }}>
                  {issue.sessions.toLocaleString()} sessions/mo affected
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button
                    style={{
                      padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--ink-muted)', fontFamily: 'inherit',
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    style={{
                      padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
                      border: '1px solid var(--accent)', background: 'var(--accent)',
                      color: 'var(--accent-ink)', fontFamily: 'inherit',
                    }}
                  >
                    View on canvas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
