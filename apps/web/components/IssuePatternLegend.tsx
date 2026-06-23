'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PATTERN_META } from '@/types/navflow';
import type { IssuePattern } from '@/types/navflow';

const PATTERN_ORDER: IssuePattern[] = [
  'SERP_TRAP',
  'INTENT_COLLISION',
  'INVISIBLE_CONVERTER',
  'LEAKY_FUNNEL_ENTRY',
  'KEYWORD_CANNIBALIZATION_DRAIN',
];

export default function IssuePatternLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }} className="animate-fade-in">

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--ink-dim)', fontSize: 11, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.12s, color 0.12s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-dim)'; e.currentTarget.style.color = 'var(--ink-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-dim)'; }}
        >
          <span style={{ fontSize: 10, color: 'var(--ink-dim)' }}>patterns</span>
          {PATTERN_ORDER.map(p => (
            <span
              key={p}
              title={PATTERN_META[p].label}
              style={{ width: 7, height: 7, borderRadius: '50%', background: PATTERN_META[p].color, flexShrink: 0 }}
            />
          ))}
        </button>
      )}

      {open && (
        <div
          className="animate-fade-up"
          style={{
            width: 268, borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            boxShadow: 'var(--shadow-panel)', overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)' }}>
              Issue Patterns
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 4, border: 'none',
                background: 'transparent', color: 'var(--ink-dim)', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-dim)'; }}
            >
              <X size={12} />
            </button>
          </div>
          <div style={{ padding: '6px 8px' }}>
            {PATTERN_ORDER.map(p => {
              const meta = PATTERN_META[p];
              return (
                <div
                  key={p}
                  style={{
                    display: 'flex', gap: 10, padding: '7px 8px', borderRadius: 6,
                    background: `color-mix(in srgb, ${meta.color} 6%, transparent)`,
                    marginBottom: 2,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 3 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: meta.color, lineHeight: 1.2 }}>
                      {meta.label}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--ink-dim)', lineHeight: 1.5, marginTop: 2 }}>
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
