import type { IssuePattern, DataSource, Confidence } from './navflow';

export interface Audit {
  id: string;
  domain: string;
  demo_mode: boolean;
  gsc_status: 'pending' | 'running' | 'done' | 'error';
  ga4_status: 'pending' | 'running' | 'done' | 'error';
  dseo_status: 'pending' | 'running' | 'done' | 'error';
  crawl_status: 'pending' | 'running' | 'done' | 'error';
  created_at: string;
}

// Phase 1 raw staging tables — written in parallel by each collector

export interface Page {
  id: string;
  audit_id: string;
  url: string;
  title: string | null;
  meta_description: string | null;
  content_length: number | null;
  internal_inlinks: number | null;
  internal_outlinks: number | null;
  has_cta: boolean | null;
  page_depth: number | null;
  click_depth: number | null;
  created_at: string;
}

export interface GscSignal {
  id: string;
  audit_id: string;
  url: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  avg_position: number | null;
  top_keywords: { keyword: string; clicks: number; impressions: number; position: number }[] | null;
  created_at: string;
}

export interface Ga4Signal {
  id: string;
  audit_id: string;
  url: string;
  sessions: number | null;
  bounce_rate: number | null;
  engagement_rate: number | null;
  conversion_rate: number | null;
  entry_rate: number | null;
  session_duration: number | null;
  conversion_count: number | null;
  created_at: string;
}

export interface SeoSignal {
  id: string;
  audit_id: string;
  url: string;
  keyword_count: number | null;
  top_keyword: string | null;
  top_position: number | null;
  competing_urls: { url: string; position: number }[] | null;
  keyword_positions: { keyword: string; position: number; volume: number }[] | null;
  top_ranking_terms: { term: string; volume: number }[] | null;
  created_at: string;
}

// Phase 2 output — all sources joined on canonical URL

export interface UrlSignal {
  id: string;
  audit_id: string;
  url: string;

  nav_depth: number | null;

  // GSC
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  avg_position: number | null;

  // GA4
  page_views: number | null;
  bounce_rate: number | null;
  engagement_rate: number | null;
  conversion_rate: number | null;
  entry_rate: number | null;
  session_duration: number | null;
  conversion_count: number | null;

  // DataForSEO
  search_volume: number | null;
  keyword_count: number | null;
  top_keyword: string | null;
  top_position: number | null;
  keyword_positions: { keyword: string; position: number; volume: number }[] | null;

  // Crawl4AI
  internal_inlinks: number | null;
  internal_outlinks: number | null;
  has_cta: boolean | null;
  content_length: number | null;
  page_depth: number | null;
  click_depth: number | null;

  impact_score: 'P0' | 'P1' | 'P2' | 'P3' | null;
  health: 'critical' | 'leaking' | 'opportunity' | 'healthy' | null;

  created_at: string;
}

// Phase 3 output — pattern detection results

export interface Issue {
  id: string;
  audit_id: string;
  url: string;
  type: IssuePattern;
  score: number;
  signals: Record<string, unknown>;
  created_at: string;
}

// Phase 4 output — OpenRouter LLM cached briefs

export interface ActionBrief {
  id: string;
  audit_id: string;
  url: string;
  issue_pattern: IssuePattern;
  summary: string;
  findings: string[];
  recommended_action: string;
  estimated_impact: string;
  confidence: Confidence;
  sources: DataSource[];
  created_at: string;
}

export interface PageFlow {
  id: string;
  audit_id: string;
  from_url: string;
  to_url: string;
  session_count: number;
  transition_rate: number | null;
  avg_time_between: number | null;
  created_at: string;
}
