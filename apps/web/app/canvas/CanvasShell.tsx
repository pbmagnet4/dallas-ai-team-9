'use client';

import { useState, useEffect, useMemo } from 'react';
import { ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import JourneyCanvas, { type LayoutMode } from '@/components/JourneyCanvas';
import AuditSummary from '@/components/AuditSummary';
import IssuePatternLegend from '@/components/IssuePatternLegend';
import type { UrlNodeData } from '@/components/UrlNode';
import { useHistory } from '@/hooks/useHistory';
import { computeEdgeMetrics } from '@/lib/variableEngine';
import NodeSidebar from './NodeSidebar';
import ToolStrip from './ToolStrip';
import AIPanel from './AIPanel';

type HealthFilter = 'all' | 'critical' | 'leaking' | 'opportunity' | 'healthy';
type CanvasTool = 'select' | 'pan';

interface CanvasState {
  layoutMode: LayoutMode;
  filter: HealthFilter;
}

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

// flowWeight = estimated sessions traversing this edge path
const BASE_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', data: { flowWeight: 180 } },
  { id: 'e1-3', source: '1', target: '3', data: { flowWeight: 320 } },
  { id: 'e3-4', source: '3', target: '4', data: { flowWeight: 45  } },
  { id: 'e2-4', source: '2', target: '4', data: { flowWeight: 95  } },
  { id: 'e2-5', source: '2', target: '5', data: { flowWeight: 60  } },
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

// ── Layout engines ────────────────────────────────────────────────────────────

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

async function applyDagreLayout(nodes: Node<UrlNodeData>[], edges: Edge[]): Promise<Node<UrlNodeData>[]> {
  const dagre = await import('@dagrejs/dagre');
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 90 });
  nodes.forEach(n => g.setNode(n.id, { width: 220, height: 88 }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const placed = g.node(n.id);
    return placed
      ? { ...n, position: { x: placed.x - 110, y: placed.y - 44 } }
      : n;
  });
}

async function applyForceLayout(nodes: Node<UrlNodeData>[], edges: Edge[]): Promise<Node<UrlNodeData>[]> {
  const d3 = await import('d3-force');

  type SimNode = { id: string; sessions: number; x: number; y: number; vx: number; vy: number };
  type SimLink = { source: SimNode; target: SimNode; weight: number };

  const cx = 500, cy = 380;
  const simNodes: SimNode[] = nodes.map((n, i) => ({
    id: n.id,
    sessions: (n.data as UrlNodeData).ga4Sessions ?? 100,
    x: cx + Math.cos((i / nodes.length) * Math.PI * 2) * 200,
    y: cy + Math.sin((i / nodes.length) * Math.PI * 2) * 200,
    vx: 0,
    vy: 0,
  }));
  const nodeById = Object.fromEntries(simNodes.map(n => [n.id, n]));

  const simLinks: SimLink[] = edges
    .filter(e => nodeById[e.source] && nodeById[e.target])
    .map(e => ({
      source: nodeById[e.source],
      target: nodeById[e.target],
      weight: (e.data as { flowWeight?: number })?.flowWeight ?? 100,
    }));

  const maxWeight = Math.max(...simLinks.map(l => l.weight), 1);

  const sim = d3.forceSimulation(simNodes)
    .force('link', d3.forceLink<SimNode, SimLink>(simLinks)
      .id(n => n.id)
      .distance(l => 280 - (l.weight / maxWeight) * 120)
      .strength(0.7))
    .force('charge', d3.forceManyBody().strength(-700))
    .force('center', d3.forceCenter(cx, cy))
    .force('collide', d3.forceCollide<SimNode>()
      .radius(n => Math.sqrt(n.sessions) * 3.2 + 50)
      .strength(0.85))
    .stop();

  for (let i = 0; i < 400; i++) sim.tick();

  return nodes.map(n => {
    const sn = nodeById[n.id];
    return { ...n, position: { x: sn.x - 110, y: sn.y - 44 } };
  });
}

// ── Cascade computation (DoubleLoop) ──────────────────────────────────────────

function withCascadeAndScale(
  nodes: Node<UrlNodeData>[],
  edges: Edge[],
): { nodes: Node<UrlNodeData>[]; edges: Edge[] } {
  const maxSessions = Math.max(...nodes.map(n => (n.data as UrlNodeData).ga4Sessions ?? 0), 1);

  const depth: Record<string, number> = {};
  const queue: { id: string; d: number }[] = [];

  nodes.forEach(n => {
    const nd = n.data as UrlNodeData;
    if (nd.health === 'critical' || nd.health === 'leaking') {
      depth[n.id] = 0;
      queue.push({ id: n.id, d: 0 });
    }
  });

  while (queue.length) {
    const { id, d } = queue.shift()!;
    edges.forEach(e => {
      if (e.source === id) {
        if (depth[e.target] === undefined || depth[e.target] > d + 1) {
          depth[e.target] = d + 1;
          queue.push({ id: e.target, d: d + 1 });
        }
      }
    });
  }

  const enrichedNodes = nodes.map(n => {
    const nd = n.data as UrlNodeData;
    const isSource = nd.health === 'critical' || nd.health === 'leaking';
    return {
      ...n,
      data: { ...nd, maxSessions, cascadeDepth: isSource ? 0 : depth[n.id] },
    };
  });

  const sourcedIds = new Set(
    nodes
      .filter(n => {
        const nd = n.data as UrlNodeData;
        return nd.health === 'critical' || nd.health === 'leaking';
      })
      .map(n => n.id),
  );

  const enrichedEdges = edges.map(e => ({
    ...e,
    data: { ...((e.data as object) ?? {}), cascade: sourcedIds.has(e.source) },
  }));

  return { nodes: enrichedNodes, edges: enrichedEdges };
}

// ── Skeleton / empty states ───────────────────────────────────────────────────

function CanvasSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'center', opacity: 0.3 }}>
        {[80, 120, 80].map((h, col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Array.from({ length: col === 1 ? 2 : 1 }).map((_, i) => (
              <div key={i} style={{ width: 180, height: h, borderRadius: 8, background: 'var(--surface-raised)' }} className="animate-pulse" />
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

// ── Main canvas ───────────────────────────────────────────────────────────────

function CanvasInner() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTool, setActiveTool]     = useState<CanvasTool>('select');
  const [aiPanelOpen, setAiPanelOpen]   = useState(false);

  // History tracks layout mode + filter as unified canvas state
  const history = useHistory<CanvasState>({ layoutMode: 'elk', filter: 'all' });
  const { layoutMode, filter } = history.current;

  const [elkNodes,   setElkNodes]   = useState<Node<UrlNodeData>[]>([]);
  const [dagreNodes, setDagreNodes] = useState<Node<UrlNodeData>[]>([]);
  const [forceNodes, setForceNodes] = useState<Node<UrlNodeData>[]>([]);
  const [enrichedEdges, setEnrichedEdges] = useState<Edge[]>(BASE_EDGES);
  const [enrichedNodes, setEnrichedNodes] = useState<Node<UrlNodeData>[]>(BASE_NODES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { nodes: cn, edges: ce } = withCascadeAndScale(BASE_NODES, BASE_EDGES);
    setEnrichedEdges(ce);
    setEnrichedNodes(cn);

    Promise.all([
      applyElkLayout(cn, ce),
      applyDagreLayout(cn, ce),
      applyForceLayout(cn, ce),
    ]).then(([elk, dagre, force]) => {
      setElkNodes(elk);
      setDagreNodes(dagre);
      setForceNodes(force);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); history.undo(); }
      if (e.key === 'z' &&  e.shiftKey) { e.preventDefault(); history.redo(); }
      if (e.key === 'Z') { e.preventDefault(); history.redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history.undo, history.redo]);

  const layoutNodes =
    layoutMode === 'elk'   ? elkNodes
    : layoutMode === 'dagre' ? dagreNodes
    : forceNodes;

  const visibleNodes = filter === 'all'
    ? layoutNodes
    : layoutNodes.filter(n => (n.data as UrlNodeData).health === filter);

  const visibleEdges = filter === 'all'
    ? enrichedEdges
    : enrichedEdges.filter(e =>
        visibleNodes.some(n => n.id === e.source) &&
        visibleNodes.some(n => n.id === e.target),
      );

  // Variable engine: compute typed edge metrics from current visible graph
  const edgeMetrics = useMemo(
    () => computeEdgeMetrics(enrichedNodes, enrichedEdges),
    [enrichedNodes, enrichedEdges],
  );

  const isEmpty = ready && visibleNodes.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AuditSummary
        nodes={layoutNodes}
        onAIToggle={() => setAiPanelOpen(v => !v)}
        aiPanelOpen={aiPanelOpen}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ToolStrip
          activeTool={activeTool}
          onToolChange={setActiveTool}
          layoutMode={layoutMode}
          onLayoutChange={mode => {
            history.push({ ...history.current, layoutMode: mode });
            setSelectedNode(null);
          }}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
        />

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="dot-grid">
          <IssuePatternLegend />

          {/* Filter bar */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 8px', boxShadow: 'var(--shadow-md)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--ink-dim)', padding: '0 6px' }}>Filter:</span>
            {FILTER_OPTIONS.map(opt => {
              const active = filter === opt.value;
              const count = opt.value === 'all' ? undefined : layoutNodes.filter(n => (n.data as UrlNodeData).health === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => history.push({ ...history.current, filter: opt.value })}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 14,
                    border: `1px solid ${active ? FILTER_COLORS[opt.value] : 'transparent'}`,
                    background: active ? `color-mix(in srgb, ${FILTER_COLORS[opt.value]} 10%, transparent)` : 'transparent',
                    color: active ? FILTER_COLORS[opt.value] : 'var(--ink-dim)',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                >
                  {opt.label}{count !== undefined && <span style={{ marginLeft: 4, opacity: 0.6 }}>({count})</span>}
                </button>
              );
            })}
          </div>

          {!ready ? (
            <CanvasSkeleton />
          ) : isEmpty ? (
            <EmptyFilterState filter={filter} onClear={() => history.push({ ...history.current, filter: 'all' })} />
          ) : (
            <div style={{ width: '100%', height: '100%' }} className="animate-fade-in">
              <JourneyCanvas
                key={`${layoutMode}-${ready}`}
                nodes={visibleNodes}
                edges={visibleEdges}
                activeTool={activeTool}
                layoutMode={layoutMode}
                edgeMetrics={edgeMetrics}
                onNodeClick={node => setSelectedNode(node)}
              />
            </div>
          )}
        </div>

        {aiPanelOpen && (
          <AIPanel
            onClose={() => setAiPanelOpen(false)}
            currentFilter={filter}
            onCommand={cmd => {
              if (cmd.type === 'filter') history.push({ ...history.current, filter: cmd.filter });
            }}
          />
        )}

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
