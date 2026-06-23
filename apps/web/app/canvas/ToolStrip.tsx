'use client';

import { MousePointer2, Hand, Maximize2, Camera, GitBranch, Network, Layers, Undo2, Redo2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { LayoutMode } from '@/components/JourneyCanvas';

type CanvasTool = 'select' | 'pan';

interface ToolStripProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

function ToolBtn({
  icon: Icon, label, active, disabled, onClick,
}: {
  icon: React.ElementType; label: string; active?: boolean; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 6, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        color: disabled ? 'var(--border)' : active ? 'var(--accent)' : 'var(--ink-dim)',
        transition: 'color 0.12s, background 0.12s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (!active && !disabled) {
          e.currentTarget.style.color = 'var(--ink-muted)';
          e.currentTarget.style.background = 'var(--surface-raised)';
        }
      }}
      onMouseLeave={e => {
        if (!active && !disabled) {
          e.currentTarget.style.color = 'var(--ink-dim)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={15} strokeWidth={1.75} />
    </button>
  );
}

function Divider() {
  return (
    <div style={{
      width: 24, height: 1, background: 'var(--border-subtle)',
      margin: '4px auto',
    }} />
  );
}

export default function ToolStrip({
  activeTool, onToolChange,
  layoutMode, onLayoutChange,
  canUndo, canRedo, onUndo, onRedo,
}: ToolStripProps) {
  const { fitView } = useReactFlow();

  return (
    <div style={{
      width: 44, flexShrink: 0,
      borderRight: '1px solid var(--border)', background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 2,
    }}>
      {/* Navigation */}
      <ToolBtn icon={MousePointer2} label="Select (V)" active={activeTool === 'select'} onClick={() => onToolChange('select')} />
      <ToolBtn icon={Hand}          label="Pan (H)"    active={activeTool === 'pan'}    onClick={() => onToolChange('pan')} />

      <Divider />

      {/* Layout mode */}
      <ToolBtn icon={GitBranch} label="Hierarchy (ELK)"      active={layoutMode === 'elk'}   onClick={() => onLayoutChange('elk')} />
      <ToolBtn icon={Layers}    label="Tree (Dagre)"          active={layoutMode === 'dagre'} onClick={() => onLayoutChange('dagre')} />
      <ToolBtn icon={Network}   label="Force (d3)"            active={layoutMode === 'force'} onClick={() => onLayoutChange('force')} />

      <Divider />

      {/* Canvas actions */}
      <ToolBtn icon={Maximize2} label="Fit view (F)" onClick={() => fitView({ duration: 300 })} />
      <ToolBtn icon={Camera}    label="Screenshot"   onClick={() => {}} />

      <Divider />

      {/* History */}
      <ToolBtn icon={Undo2} label="Undo (⌘Z)"       disabled={!canUndo} onClick={onUndo} />
      <ToolBtn icon={Redo2} label="Redo (⌘⇧Z)"      disabled={!canRedo} onClick={onRedo} />
    </div>
  );
}
