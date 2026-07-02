export type IssuePattern =
  | 'BURIED_PAGE'
  | 'RANKING_OPPORTUNITY'
  | 'ENGAGEMENT_DRAIN'
  | 'ORPHAN_PAGE'
  | 'KEYWORD_CANNIBALIZATION';

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
  BURIED_PAGE: {
    label: 'Buried Page',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
    description: 'High-traffic entry point with poor internal path to conversion — users land but have nowhere to go.',
  },
  RANKING_OPPORTUNITY: {
    label: 'Ranking Opportunity',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    description: 'High impressions, low CTR — the page appears in search but the title or meta doesn\'t earn the click.',
  },
  ENGAGEMENT_DRAIN: {
    label: 'Engagement Drain',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    description: 'Informational page ranking for transactional queries, or vice versa — intent mismatch kills engagement.',
  },
  ORPHAN_PAGE: {
    label: 'Orphan Page',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    description: 'High-converting page with near-zero internal links pointing to it — invisible to users navigating the site.',
  },
  KEYWORD_CANNIBALIZATION: {
    label: 'Keyword Cannibalization',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    description: 'Two or more pages splitting authority on the same query — neither ranks as well as one consolidated page would.',
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
