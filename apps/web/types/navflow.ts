export type IssuePattern =
  | 'SERP_TRAP'
  | 'INTENT_COLLISION'
  | 'INVISIBLE_CONVERTER'
  | 'LEAKY_FUNNEL_ENTRY'
  | 'KEYWORD_CANNIBALIZATION_DRAIN';

export type DataSource = 'gsc' | 'ga4' | 'dataforseo' | 'crawl4ai' | 'tracardi';

export type Confidence = 'high' | 'medium' | 'low';

export interface ActionBrief {
  pattern: IssuePattern;
  issue: string;
  evidence: string[];
  action: string;
  estimatedImpact: string;
  confidence: Confidence;
  sources: DataSource[];
}

export const PATTERN_META: Record<IssuePattern, { label: string; color: string; bg: string; description: string }> = {
  SERP_TRAP: {
    label: 'SERP Trap',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    description: 'High impressions, low CTR — title or meta doesn\'t match search intent.',
  },
  INTENT_COLLISION: {
    label: 'Intent Collision',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    description: 'Informational page ranking for transactional queries, or vice versa.',
  },
  INVISIBLE_CONVERTER: {
    label: 'Invisible Converter',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    description: 'High-converting page with near-zero keyword visibility.',
  },
  LEAKY_FUNNEL_ENTRY: {
    label: 'Leaky Funnel Entry',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
    description: 'Strong entry traffic but poor internal path to conversion.',
  },
  KEYWORD_CANNIBALIZATION_DRAIN: {
    label: 'Cannibalization',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    description: 'Two or more pages splitting authority on the same query.',
  },
};

export const SOURCE_META: Record<DataSource, { label: string; color: string }> = {
  gsc:        { label: 'GSC',         color: '#4ade80' },
  ga4:        { label: 'GA4',         color: '#60a5fa' },
  dataforseo: { label: 'DataForSEO',  color: '#f59e0b' },
  crawl4ai:   { label: 'Crawl4AI',    color: '#a78bfa' },
  tracardi:   { label: 'Tracardi',    color: '#f472b6' },
};

export type FixPlanStepKind = 'trigger' | 'action' | 'condition' | 'verify';

export interface FixPlanStep {
  kind: FixPlanStepKind;
  title: string;
  detail: string;
  branch?: { yes: string; no: string };
}

export interface FixPlan {
  pattern: IssuePattern;
  url: string;
  steps: FixPlanStep[];
}
