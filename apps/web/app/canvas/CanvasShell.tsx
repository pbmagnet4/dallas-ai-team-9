'use client';

import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import JourneyCanvas from '@/components/JourneyCanvas';
import AuditSummary from '@/components/AuditSummary';
import type { UrlNodeData } from '@/components/UrlNode';
import NodeSidebar from './NodeSidebar';

type HealthFilter = 'all' | 'critical' | 'leaking' | 'opportunity' | 'healthy';

// Mock data — replaced by live Supabase query in Week 2
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
  { id: 'e1-2', source: '1', target: '2', animated: true,  style: { strokeWidth: 3 } },
  { id: 'e1-3', source: '1', target: '3', animated: true,  style: { strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4',                  style: { strokeWidth: 1 } },
  { id: 'e2-4', source: '2', target: '4',                  style: { strokeWidth: 2 } },
  { id: 'e2-5', source: '2', target: '5',                  style: { strokeWidth: 1 } },
];

const FILTER_OPTIONS: { value: HealthFilter; label: string; color: string }[] = [
  { value: 'all',         label: 'All',         color: 'border-slate-600 text-slate-300' },
  { value: 'critical',    label: 'Critical',    color: 'border-red-500 text-red-400' },
  { value: 'leaking',     label: 'Leaking',     color: 'border-yellow-500 text-yellow-400' },
  { value: 'opportunity', label: 'Opportunity', color: 'border-blue-500 text-blue-400' },
  { value: 'healthy',     label: 'Healthy',     color: 'border-green-500 text-green-400' },
];

const HEALTH_COLORS: Record<string, string> = {
  healthy:     '#22c55e',
  leaking:     '#eab308',
  critical:    '#ef4444',
  opportunity: '#3b82f6',
};

async function applyElkLayout(nodes: Node<UrlNodeData>[], edges: Edge[]): Promise<Node<UrlNodeData>[]> {
  const ELK = (await import('elkjs')).default;
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
    children: nodes.map(n => ({ id: n.id, width: 240, height: 90 })),
    edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  });
  return nodes.map(n => {
    const placed = graph.children?.find(c => c.id === n.id);
    return placed ? { ...n, position: { x: placed.x ?? 0, y: placed.y ?? 0 } } : n;
  });
}

function CanvasSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="flex gap-16 items-center opacity-40">
        {[80, 120, 80].map((h, col) => (
          <div key={col} className="flex flex-col gap-6">
            {Array.from({ length: col === 1 ? 2 : 1 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg animate-pulse bg-slate-800"
                style={{ width: 180, height: h }}
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
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-slate-500 text-xl">∅</span>
      </div>
      <p className="text-sm text-slate-400">No <span className="font-medium text-slate-300">{filter}</span> pages found</p>
      <button
        onClick={onClear}
        className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
      >
        Clear filter
      </button>
    </div>
  );
}

export default function CanvasShell() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<HealthFilter>('all');
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
    <div className="flex flex-col flex-1 overflow-hidden">
      <AuditSummary nodes={layoutNodes} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {/* Legend */}
          <div className="absolute top-4 right-4 z-10 flex gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400">
            {Object.entries(HEALTH_COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5 capitalize">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {key}
              </span>
            ))}
          </div>

          {/* Filter pill bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-4 py-2">
            <span className="text-xs text-slate-500 mr-1">Filter:</span>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filter === opt.value
                    ? `${opt.color} bg-slate-800`
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt.label}
                {opt.value !== 'all' && (
                  <span className="ml-1 text-slate-600">
                    ({layoutNodes.filter(n => (n.data as UrlNodeData).health === opt.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {!elkReady ? (
            <CanvasSkeleton />
          ) : isEmpty ? (
            <EmptyFilterState filter={filter} onClear={() => setFilter('all')} />
          ) : (
            <JourneyCanvas
              key={elkReady ? 'elk' : 'initial'}
              nodes={visibleNodes}
              edges={visibleEdges}
              onNodeClick={(node) => setSelectedNode(node)}
            />
          )}
        </div>

        {selectedNode && (
          <NodeSidebar
            node={selectedNode as Node<UrlNodeData>}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
