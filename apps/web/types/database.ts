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

export interface UrlSignal {
  id: string;
  audit_id: string;
  url: string;

  // GSC
  gsc_clicks: number | null;
  gsc_impressions: number | null;
  gsc_ctr: number | null;
  gsc_position: number | null;
  gsc_top_keywords: { keyword: string; clicks: number; impressions: number; position: number }[] | null;

  // GA4 (BigQuery Export)
  ga4_sessions: number | null;
  ga4_bounce_rate: number | null;
  ga4_engagement_rate: number | null;
  ga4_conversion_rate: number | null;
  ga4_entry_rate: number | null;
  ga4_session_duration: number | null;
  ga4_conversion_count: number | null;

  // DataForSEO
  dseo_keyword_count: number | null;
  dseo_top_keyword: string | null;
  dseo_top_position: number | null;
  dseo_competing_urls: { url: string; position: number }[] | null;
  dseo_keyword_positions: { keyword: string; position: number; volume: number }[] | null;
  dseo_top_ranking_terms: { term: string; volume: number }[] | null;

  // Crawl4AI
  crawl_internal_inlinks: number | null;
  crawl_internal_outlinks: number | null;
  crawl_has_cta: boolean | null;
  crawl_title: string | null;
  crawl_meta_description: string | null;
  crawl_content_length: number | null;
  crawl_page_depth: number | null;
  crawl_click_depth: number | null;

  // Scoring
  issue_patterns: IssuePattern[] | null;
  impact_score: 'P0' | 'P1' | 'P2' | 'P3' | null;
  health: 'critical' | 'leaking' | 'opportunity' | 'healthy' | null;

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

export interface ActionBrief {
  id: string;
  audit_id: string;
  url: string;
  issue_pattern: IssuePattern;
  evidence: [string, string, string];
  recommended_action: string;
  estimated_impact: string;
  confidence: Confidence;
  sources: DataSource[];
  created_at: string;
}
