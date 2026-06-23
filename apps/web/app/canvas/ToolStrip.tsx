'use client';

import { MousePointer2, Hand, Maximize2, Camera } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

type CanvasTool = 'select' | 'pan';

interface ToolStripProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
}

const TOOLS: { id: CanvasTool | 'fitview' | 'screenshot'; icon: React.ElementType; label: string }[] = [
  { id: 'select',     icon: MousePointer2, label: 'Select (V)' },
  { id: 'pan',        icon: Hand,          label: 'Pan (H)' },
  { id: 'fitview',    icon: Maximize2,     label: 'Fit View (F)' },
  { id: 'screenshot', icon: Camera,        label: 'Screenshot' },
];

export default function ToolStrip({ activeTool, onToolChange }: ToolStripProps) {
  const { fitView } = useReactFlow();

  function handleClick(id: string) {
    if (id === 'select' || id === 'pan') {
      onToolChange(id as CanvasTool);
    } else if (id === 'fitview') {
      fitView({ duration: 300 });
    }
    // screenshot: placeholder for v1
  }

  return (
    <div
      style={{
        width: 44,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: 2,
      }}
    >
      {TOOLS.map(({ id, icon: Icon, label }, i) => {
        const active = id === activeTool;
        const isSeparated = id === 'fitview';
        return (
          <div key={id} style={isSeparated ? { marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)', width: '100%', display: 'flex', justifyContent: 'center' } : {}}>
            <button
              title={label}
              onClick={() => handleClick(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--ink-dim)',
                cursor: 'pointer',
                transition: 'color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--ink-muted)';
                  e.currentTarget.style.background = 'var(--surface-raised)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--ink-dim)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={15} strokeWidth={1.75} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
