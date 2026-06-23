import type { Node, Edge } from '@xyflow/react';
import type { UrlNodeData } from '@/components/UrlNode';

export type PortKind = 'entry' | 'passthrough' | 'leak' | 'amplifier' | 'sink';

export interface EdgeMetrics {
  sessions: number;      // sessions traversing this edge (flowWeight)
  dropOffRate: number;   // 0–1: sessions lost between source and target
  conversionPotential: number; // 0–1: how likely this path leads to conversion
  flowShare: number;     // 0–1: this edge's sessions / source node total sessions
}

// What kind of node is this from a traffic flow perspective
export function getPortKind(health: UrlNodeData['health']): PortKind {
  if (health === 'critical') return 'leak';
  if (health === 'leaking')  return 'leak';
  if (health === 'opportunity') return 'amplifier';
  if (health === 'healthy') return 'passthrough';
  return 'passthrough';
}

export function computeEdgeMetrics(
  nodes: Node<UrlNodeData>[],
  edges: Edge[],
): Map<string, EdgeMetrics> {
  const nodeById = new Map(nodes.map(n => [n.id, n.data as UrlNodeData]));
  const result = new Map<string, EdgeMetrics>();

  for (const edge of edges) {
    const src = nodeById.get(edge.source);
    const tgt = nodeById.get(edge.target);
    if (!src || !tgt) continue;

    const srcSessions  = src.ga4Sessions ?? 0;
    const tgtSessions  = tgt.ga4Sessions ?? 0;
    const flowWeight   = (edge.data as { flowWeight?: number })?.flowWeight ?? 100;

    const dropOffRate = srcSessions > 0
      ? Math.max(0, Math.min(1, 1 - tgtSessions / srcSessions))
      : 0;

    const conversionPotential =
      tgt.health === 'opportunity' ? 0.8
      : tgt.health === 'healthy'   ? 0.5
      : tgt.health === 'leaking'   ? 0.2
      : 0.1;

    const flowShare = srcSessions > 0
      ? Math.min(1, flowWeight / srcSessions)
      : 0;

    result.set(edge.id, { sessions: flowWeight, dropOffRate, conversionPotential, flowShare });
  }

  return result;
}
