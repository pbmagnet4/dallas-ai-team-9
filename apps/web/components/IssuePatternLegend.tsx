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
    <div className="absolute top-4 left-4 z-10 animate-fade-in">

      {/* Collapsed: 5-dot strip */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="text-slate-600 text-xs font-mono mr-0.5">patterns</span>
          {PATTERN_ORDER.map(p => (
            <span
              key={p}
              title={PATTERN_META[p].label}
              style={{ width: 8, height: 8, borderRadius: '50%', background: PATTERN_META[p].color, flexShrink: 0 }}
            />
          ))}
          <span className="text-slate-700 ml-0.5">↗</span>
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg w-72 shadow-xl animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">Issue Patterns</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-600 hover:text-slate-300 transition-colors w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800"
            >
              ×
            </button>
          </div>
          <div className="p-2">
            {PATTERN_ORDER.map(p => {
              const meta = PATTERN_META[p];
              return (
                <div
                  key={p}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: meta.bg }}
                >
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: meta.color, flexShrink: 0, marginTop: 5,
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold leading-none" style={{ color: meta.color }}>
                      {meta.label}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{meta.description}</p>
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
