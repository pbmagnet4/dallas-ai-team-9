-- NavFlow Supabase Schema
-- Source of truth for all tables. Run in order.

-- ── audits ────────────────────────────────────────────────────────────────────
-- One row per domain audit. Tracks pipeline status per source.
CREATE TABLE audits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain      TEXT NOT NULL,
  demo_mode   BOOLEAN NOT NULL DEFAULT FALSE,
  gsc_status  TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | error
  ga4_status  TEXT NOT NULL DEFAULT 'pending',
  dseo_status TEXT NOT NULL DEFAULT 'pending',
  crawl_status TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── url_signals ───────────────────────────────────────────────────────────────
-- Per-URL canonical record. All four sources merged on canonical URL.
CREATE TABLE url_signals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,

  -- GSC
  gsc_clicks          INTEGER,
  gsc_impressions     INTEGER,
  gsc_ctr             FLOAT,
  gsc_position        FLOAT,
  gsc_top_keywords    JSONB,   -- [{ keyword, clicks, impressions, position }]

  -- GA4 (BigQuery Export)
  ga4_sessions          INTEGER,
  ga4_bounce_rate       FLOAT,
  ga4_engagement_rate   FLOAT,
  ga4_conversion_rate   FLOAT,
  ga4_entry_rate        FLOAT,
  ga4_session_duration  FLOAT,  -- avg seconds on page
  ga4_conversion_count  INTEGER,

  -- DataForSEO
  dseo_keyword_count      INTEGER,
  dseo_top_keyword        TEXT,
  dseo_top_position       INTEGER,
  dseo_competing_urls     JSONB,  -- [{ url, position }]
  dseo_keyword_positions  JSONB,  -- [{ keyword, position, volume }]
  dseo_top_ranking_terms  JSONB,  -- [{ term, volume }]

  -- Crawl4AI
  crawl_internal_inlinks  INTEGER,
  crawl_internal_outlinks INTEGER,
  crawl_has_cta           BOOLEAN,
  crawl_title             TEXT,
  crawl_meta_description  TEXT,
  crawl_content_length    INTEGER, -- word count
  crawl_page_depth        INTEGER, -- pages from homepage in sitemap graph
  crawl_click_depth       INTEGER, -- min clicks from homepage via internal links

  -- Scoring (computed by correlation pipeline)
  issue_patterns  JSONB,  -- IssuePattern[]
  impact_score    TEXT,   -- P0 | P1 | P2 | P3
  health          TEXT,   -- critical | leaking | opportunity | healthy

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (audit_id, url)
);

-- ── page_flows ────────────────────────────────────────────────────────────────
-- Page-to-page transition edges from GA4 BigQuery LEAD() window function.
CREATE TABLE page_flows (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id       UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  from_url       TEXT NOT NULL,
  to_url         TEXT NOT NULL,
  session_count  INTEGER NOT NULL,
  transition_rate FLOAT,   -- proportion of from_url sessions that went to to_url
  avg_time_between FLOAT,  -- avg seconds between page A and page B
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── action_briefs ─────────────────────────────────────────────────────────────
-- Cached LLM output per URL, pre-generated via OpenRouter for demo mode.
CREATE TABLE action_briefs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  issue_pattern    TEXT NOT NULL,  -- IssuePattern
  evidence         JSONB NOT NULL, -- string[3] — data citations
  recommended_action TEXT NOT NULL,
  estimated_impact TEXT NOT NULL,
  confidence       TEXT NOT NULL,  -- high | medium | low
  sources          JSONB NOT NULL, -- DataSource[]
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (audit_id, url)
);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX ON url_signals (audit_id);
CREATE INDEX ON url_signals (audit_id, impact_score);
CREATE INDEX ON page_flows  (audit_id);
CREATE INDEX ON page_flows  (audit_id, from_url);
CREATE INDEX ON action_briefs (audit_id);
