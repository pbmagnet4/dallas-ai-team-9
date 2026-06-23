'use client';

import { useState } from 'react';
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
    <div className="absolute top-4 left-4 z-10">
      {/* Collapsed: 5-dot strip + toggle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 hover:border-slate-500 transition-colors"
        >
          <span className="text-slate-500 text-xs mr-1">Patterns</span>
          {PATTERN_ORDER.map(p => (
            <span
              key={p}
              style={{ width: 8, height: 8, borderRadius: '50%', background: PATTERN_META[p].color, flexShrink: 0 }}
            />
          ))}
          <span className="text-slate-600 ml-1">↗</span>
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg w-72 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Issue Patterns</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1"
            >
              ×
            </button>
          </div>
          <div className="p-3 space-y-1">
            {PATTERN_ORDER.map(p => {
              const meta = PATTERN_META[p];
              return (
                <div
                  key={p}
                  className="flex items-start gap-3 px-2 py-2 rounded-lg"
                  style={{ background: meta.bg }}
                >
                  <span
                    style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 4 }}
                  />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{meta.description}</p>
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
