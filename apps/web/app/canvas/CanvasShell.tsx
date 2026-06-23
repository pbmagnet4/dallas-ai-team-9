'use client';

import { useState, useEffect } from 'react';
import { ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import JourneyCanvas from '@/components/JourneyCanvas';
import AuditSummary from '@/components/AuditSummary';
import IssuePatternLegend from '@/components/IssuePatternLegend';
import type { UrlNodeData } from '@/components/UrlNode';
import NodeSidebar from './NodeSidebar';
import ToolStrip from './ToolStrip';
import AIPanel from './AIPanel';

type HealthFilter = 'all' | 'critical' | 'leaking' | 'opportunity' | 'healthy';
type CanvasTool = 'select' | 'pan';

const BASE_NODES: Node<UrlNodeData>[] = [
  {
    id: '1', type: 'url', position: { x: 0, y: 0 },
    data: {
      label: '/home', health: 'healthy', issueCount: 0, impactScore: null,
      gscClicks: 820, ga4Sessions: 740,
      sources: ['gsc', 'ga4', 'crawl4ai'],
    },
  },
  {
    id: '2', type: 'url', position: { x: 0, y: 0 },
    data: {
      label: '/services/hvac-installation', health: 'critical', issueCount: 2, impactScore: 'P0',
      gscClicks: 340, ga4Sessions: 290,
      patterns: ['LEAKY_FUNNEL_ENTRY', 'SERP_TRAP'],
      sources: ['gsc', 'ga4', 'dataforseo', 'crawl4ai'],
    },
  },
  {
    id: '3', type: 'url', position: { x: 0, y: 0 },
    data: {
      label: '/blog/what-is-hvac', health: 'leaking', issueCount: 1, impactScore: 'P1',
      gscClicks: 510, ga4Sessions: 480,
      patterns: ['SERP_TRAP'],
      sources: ['gsc', 'ga4', 'dataforseo'],
    },
  },
  {
    id: '4', type: 'url', position: { x: 0, y: 0 },
    data: {
      label: '/contact', health: 'opportunity', issueCount: 1, impactScore: 'P1',
      gscClicks: 90, ga4Sessions: 85,
      patterns: ['INVISIBLE_CONVERTER'],
      sources: ['gsc', 'ga4', 'crawl4ai'],
    },
  },
  {
    id: '5', type: 'url', position: { x: 0, y: 0 },
    data: {
      label: '/services/ac-repair', health: 'healthy', issueCount: 0, impactScore: null,
      gscClicks: 210, ga4Sessions: 195,
      sources: ['gsc', 'ga4'],
    },
  },
];

const BASE_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true,  style: { strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true,  style: { strokeWidth: 1.5 } },
  { id: 'e3-4', source: '3', target: '4',                  style: { strokeWidth: 1 } },
  { id: 'e2-4', source: '2', target: '4',                  style: { strokeWidth: 1.5 } },
  { id: 'e2-5', source: '2', target: '5',                  style: { strokeWidth: 1 } },
];

const FILTER_OPTIONS: { value: HealthFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'critical',    label: 'Critical' },
  { value: 'leaking',     label: 'Leaking' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'healthy',     label: 'Healthy' },
];

const FILTER_COLORS: Record<HealthFilter, string> = {
  all:         'var(--ink-dim)',
  critical:    '#dc2626',
  leaking:     '#ca8a04',
  opportunity: 'var(--accent)',
  healthy:     '#16a34a',
};

async function applyElkLayout(nodes: Node<UrlNodeData>[], edges: Edge[]): Promise<Node<UrlNodeData>[]> {
  const ELK = (await import('elkjs/lib/elk.bundled.js')).default;
  const elk = new ELK();
  const graph = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    },
    children: nodes.map(n => ({ id: n.id, width: 220, height: 88 })),
    edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  });
  return nodes.map(n => {
    const placed = graph.children?.find(c => c.id === n.id);
    return placed ? { ...n, position: { x: placed.x ?? 0, y: placed.y ?? 0 } } : n;
  });
}

function CanvasSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'center', opacity: 0.3 }}>
        {[80, 120, 80].map((h, col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Array.from({ length: col === 1 ? 2 : 1 }).map((_, i) => (
              <div
                key={i}
                style={{ width: 180, height: h, borderRadius: 8, background: 'var(--surface-raised)' }}
                className="animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyFilterState({ filter, onClear }: { filter: string; onClear: () => void }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, color: 'var(--ink-dim)' }}>∅</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
        No <strong>{filter}</strong> pages found
      </p>
      <button
        onClick={onClear}
        style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        Clear filter
      </button>
    </div>
  );
}

function CanvasInner() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<HealthFilter>('all');
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [layoutNodes, setLayoutNodes] = useState<Node<UrlNodeData>[]>(BASE_NODES);
  const [elkReady, setElkReady] = useState(false);

  useEffect(() => {
    applyElkLayout(BASE_NODES, BASE_EDGES)
      .then(laid => { setLayoutNodes(laid); setElkReady(true); })
      .catch(() => { setElkReady(true); });
  }, []);

  const visibleNodes = filter === 'all'
    ? layoutNodes
    : layoutNodes.filter(n => (n.data as UrlNodeData).health === filter);

  const visibleEdges = filter === 'all'
    ? BASE_EDGES
    : BASE_EDGES.filter(e =>
        visibleNodes.some(n => n.id === e.source) &&
        visibleNodes.some(n => n.id === e.target)
      );

  const isEmpty = elkReady && visibleNodes.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AuditSummary
        nodes={layoutNodes}
        onAIToggle={() => setAiPanelOpen(v => !v)}
        aiPanelOpen={aiPanelOpen}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Tool strip */}
        <ToolStrip activeTool={activeTool} onToolChange={setActiveTool} />

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="dot-grid">
          <IssuePatternLegend />

          {/* Filter bar */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 8px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--ink-dim)', padding: '0 6px' }}>Filter:</span>
            {FILTER_OPTIONS.map(opt => {
              const active = filter === opt.value;
              const count = opt.value === 'all' ? undefined : layoutNodes.filter(n => (n.data as UrlNodeData).health === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 14,
                    border: `1px solid ${active ? FILTER_COLORS[opt.value] : 'transparent'}`,
                    background: active ? `color-mix(in srgb, ${FILTER_COLORS[opt.value]} 10%, transparent)` : 'transparent',
                    color: active ? FILTER_COLORS[opt.value] : 'var(--ink-dim)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.12s',
                  }}
                >
                  {opt.label}{count !== undefined && <span style={{ marginLeft: 4, opacity: 0.6 }}>({count})</span>}
                </button>
              );
            })}
          </div>

          {!elkReady ? (
            <CanvasSkeleton />
          ) : isEmpty ? (
            <EmptyFilterState filter={filter} onClear={() => setFilter('all')} />
          ) : (
            <div style={{ width: '100%', height: '100%' }} className="animate-fade-in">
              <JourneyCanvas
                key={elkReady ? 'elk' : 'initial'}
                nodes={visibleNodes}
                edges={visibleEdges}
                activeTool={activeTool}
                onNodeClick={node => setSelectedNode(node)}
              />
            </div>
          )}
        </div>

        {/* AI Panel */}
        {aiPanelOpen && (
          <AIPanel
            onClose={() => setAiPanelOpen(false)}
            currentFilter={filter}
            onCommand={cmd => {
              if (cmd.type === 'filter') setFilter(cmd.filter);
            }}
          />
        )}

        {/* Node sidebar — only when no AI panel, or alongside it */}
        {selectedNode && !aiPanelOpen && (
          <NodeSidebar
            node={selectedNode as Node<UrlNodeData>}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function CanvasShell() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
