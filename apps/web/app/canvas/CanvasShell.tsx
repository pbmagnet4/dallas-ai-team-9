'use client';

import { useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import JourneyCanvas from '@/components/JourneyCanvas';
import type { UrlNodeData } from '@/components/UrlNode';
import NodeSidebar from './NodeSidebar';

// Mock data — replaced by real Supabase query in Week 2
const MOCK_NODES: Node<UrlNodeData>[] = [
  { id: '1', type: 'url', position: { x: 0, y: 0 }, data: { label: '/home', health: 'healthy', issueCount: 0, impactScore: null, gscClicks: 820, ga4Sessions: 740 } },
  { id: '2', type: 'url', position: { x: 280, y: -100 }, data: { label: '/services/hvac-installation', health: 'critical', issueCount: 2, impactScore: 'P0', gscClicks: 340, ga4Sessions: 290 } },
  { id: '3', type: 'url', position: { x: 280, y: 100 }, data: { label: '/blog/what-is-hvac', health: 'leaking', issueCount: 1, impactScore: 'P1', gscClicks: 510, ga4Sessions: 480 } },
  { id: '4', type: 'url', position: { x: 560, y: -100 }, data: { label: '/contact', health: 'opportunity', issueCount: 1, impactScore: 'P1', gscClicks: 90, ga4Sessions: 85 } },
  { id: '5', type: 'url', position: { x: 560, y: 100 }, data: { label: '/services/ac-repair', health: 'healthy', issueCount: 0, impactScore: null, gscClicks: 210, ga4Sessions: 195 } },
];

// Edge weight proportional to session flow volume
const MOCK_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { strokeWidth: 3 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', style: { strokeWidth: 1 } },
  { id: 'e2-4', source: '2', target: '4', style: { strokeWidth: 2 } },
  { id: 'e2-5', source: '2', target: '5', style: { strokeWidth: 1 } },
];

export default function CanvasShell() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
          <span className="text-xs text-slate-400 font-mono">NavFlow</span>
          <span className="text-xs text-slate-600 font-mono ml-2">— demo data</span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400">
          {[
            { color: '#22c55e', label: 'Healthy' },
            { color: '#eab308', label: 'Leaking' },
            { color: '#ef4444', label: 'Critical' },
            { color: '#3b82f6', label: 'Opportunity' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>

        <JourneyCanvas
          nodes={MOCK_NODES}
          edges={MOCK_EDGES}
          onNodeClick={(node) => setSelectedNode(node)}
        />
      </div>

      {selectedNode && (
        <NodeSidebar node={selectedNode as Node<UrlNodeData>} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
