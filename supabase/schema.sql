-- NavFlow Supabase Schema
-- Source of truth for all tables. Run in order.

-- ── audits ────────────────────────────────────────────────────────────────────
-- One row per domain audit. Tracks pipeline status per source.
CREATE TABLE audits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain       TEXT NOT NULL,
  demo_mode    BOOLEAN NOT NULL DEFAULT FALSE,
  gsc_status   TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | error
  ga4_status   TEXT NOT NULL DEFAULT 'pending',
  dseo_status  TEXT NOT NULL DEFAULT 'pending',
  crawl_status TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Raw staging tables (Phase 1 — written by each collector in parallel) ──────

-- Crawl4AI output: one row per discovered page
CREATE TABLE pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  title            TEXT,
  meta_description TEXT,
  content_length   INTEGER,  -- word count
  internal_inlinks INTEGER,
  internal_outlinks INTEGER,
  has_cta          BOOLEAN,
  page_depth       INTEGER,  -- pages from homepage in sitemap graph
  click_depth      INTEGER,  -- min clicks from homepage via internal links
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- Google Search Console: one row per URL
CREATE TABLE gsc_signals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  clicks      INTEGER,
  impressions INTEGER,
  ctr         FLOAT,
  avg_position FLOAT,
  top_keywords JSONB,  -- [{ keyword, clicks, impressions, position }]
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- GA4 BigQuery Export: one row per URL
CREATE TABLE ga4_signals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id          UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url               TEXT NOT NULL,
  sessions          INTEGER,
  bounce_rate       FLOAT,
  engagement_rate   FLOAT,
  conversion_rate   FLOAT,
  entry_rate        FLOAT,
  session_duration  FLOAT,   -- avg seconds on page
  conversion_count  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- DataForSEO: one row per URL
CREATE TABLE seo_signals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  keyword_count    INTEGER,
  top_keyword      TEXT,
  top_position     INTEGER,
  competing_urls   JSONB,  -- [{ url, position }]
  keyword_positions JSONB, -- [{ keyword, position, volume }]
  top_ranking_terms JSONB, -- [{ term, volume }]
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- ── page_flows ────────────────────────────────────────────────────────────────
-- Page-to-page transition edges from GA4 BigQuery LEAD() window function.
CREATE TABLE page_flows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  from_url         TEXT NOT NULL,
  to_url           TEXT NOT NULL,
  session_count    INTEGER NOT NULL,
  transition_rate  FLOAT,  -- proportion of from_url sessions that went to to_url
  avg_time_between FLOAT,  -- avg seconds between page A and page B
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── url_signals ───────────────────────────────────────────────────────────────
-- Phase 2 output: all four raw sources joined on canonical URL.
-- Correlation engine (Python) writes one row per page with ALL signals.
CREATE TABLE url_signals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,

  -- from pages (Crawl4AI)
  nav_depth         INTEGER,
  clicks            INTEGER,   -- from GSC
  avg_position      FLOAT,     -- from GSC
  impressions       INTEGER,   -- from GSC
  ctr               FLOAT,     -- from GSC
  page_views        INTEGER,   -- from GA4 (sessions)
  bounce_rate       FLOAT,     -- from GA4
  engagement_rate   FLOAT,     -- from GA4
  conversion_rate   FLOAT,     -- from GA4
  entry_rate        FLOAT,     -- from GA4
  session_duration  FLOAT,     -- from GA4
  conversion_count  INTEGER,   -- from GA4
  search_volume     INTEGER,   -- from DataForSEO (top keyword volume)
  keyword_count     INTEGER,   -- from DataForSEO
  top_keyword       TEXT,      -- from DataForSEO
  top_position      INTEGER,   -- from DataForSEO
  keyword_positions JSONB,     -- from DataForSEO
  internal_inlinks  INTEGER,   -- from Crawl4AI
  internal_outlinks INTEGER,   -- from Crawl4AI
  has_cta           BOOLEAN,   -- from Crawl4AI
  content_length    INTEGER,   -- from Crawl4AI
  page_depth        INTEGER,   -- from Crawl4AI
  click_depth       INTEGER,   -- from Crawl4AI

  -- Scoring (computed by correlation pipeline)
  impact_score TEXT,  -- P0 | P1 | P2 | P3
  health       TEXT,  -- critical | leaking | opportunity | healthy

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- ── issues ────────────────────────────────────────────────────────────────────
-- Phase 3 output: one row per page+pattern detected.
-- Pattern detection (Python) writes here; multiple rows per URL possible.
CREATE TABLE issues (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id   UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  type       TEXT NOT NULL,   -- IssuePattern: BURIED_PAGE | RANKING_OPPORTUNITY | ENGAGEMENT_DRAIN | ORPHAN_PAGE | KEYWORD_CANNIBALIZATION
  score      FLOAT NOT NULL,  -- severity 0-100
  signals    JSONB NOT NULL,  -- { field: value } — data that triggered this pattern
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── action_briefs ─────────────────────────────────────────────────────────────
-- Phase 4 output: cached LLM output (OpenRouter) per URL, sorted by impact score.
CREATE TABLE action_briefs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id           UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  url                TEXT NOT NULL,
  issue_pattern      TEXT NOT NULL,    -- IssuePattern
  summary            TEXT NOT NULL,    -- one-sentence plain-English summary
  findings           JSONB NOT NULL,   -- string[] — data citations (3 points)
  recommended_action TEXT NOT NULL,
  estimated_impact   TEXT NOT NULL,
  confidence         TEXT NOT NULL,    -- high | medium | low
  sources            JSONB NOT NULL,   -- DataSource[]
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (audit_id, url)
);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX ON pages         (audit_id);
CREATE INDEX ON gsc_signals   (audit_id);
CREATE INDEX ON ga4_signals   (audit_id);
CREATE INDEX ON seo_signals   (audit_id);
CREATE INDEX ON page_flows    (audit_id);
CREATE INDEX ON page_flows    (audit_id, from_url);
CREATE INDEX ON url_signals   (audit_id);
CREATE INDEX ON url_signals   (audit_id, impact_score);
CREATE INDEX ON issues        (audit_id);
CREATE INDEX ON issues        (audit_id, url);
CREATE INDEX ON issues        (audit_id, type);
CREATE INDEX ON action_briefs (audit_id);
