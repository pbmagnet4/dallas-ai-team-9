# NavFlow AI — Product Requirements Document

**Version:** 0.1 (pre-build draft)
**Status:** Draft — pending team review
**Last updated:** 2026-06-15
**Author:** Edward Chalupa
**Competition:** Dallas AI Summer 2026 (8-week sprint)
**Demo site:** Demo Site Co. (real home services business — permission granted)

---

## Problem

Marketing and development teams operate on three disconnected data sources — Google Search Console (how pages appear in search), GA4 (how users actually navigate), and technical crawl data (what the page structure actually contains). When these drift apart, conversion leaks silently: pages rank for the wrong intent, high-traffic entry points bleed exits, and the internal link structure funnels users away from conversion paths.

No tool currently correlates all three at the page level and renders the complete picture as a navigable map. Teams are left doing one-source audits that miss compound failures.

---

## Solution

NavFlow ingests all three sources, reconstructs the real user path, and renders it as an interactive node canvas where:
- Each **node** is a URL, color-coded by health signal
- Each **edge** is a measured user flow (from GA4 BigQuery transition data)
- Each **page** receives an AI-generated action brief: URL-specific, impact-ranked, data-cited

The output is not a report — it is a living map. Teams can click any node, read the action brief, and know exactly what to fix and why.

---

## Personas

### Persona 1: The Performance Marketer

**Name:** Sarah, VP of Marketing at a regional service business
**Context:** Runs Google Ads alongside organic. Knows their best landing pages but can't explain why the service pages that rank well aren't converting. Suspicious that the site structure is fighting against her paid campaigns.
**Jobs to be done:**
- Identify which ranking pages are leaking exits before converting
- Find pages competing for the same keywords (diluting Ad Quality Score)
- Get a prioritized fix list her agency can act on without a full SEO audit

**Success state:** She opens NavFlow, sees the demo site journey map, clicks "Service Pages" cluster, reads the action brief for `/services/hvac-installation`, and hands it to her agency with a clear instruction.

---

### Persona 2: The Developer / Technical Owner

**Name:** Marcus, lead developer at an agency managing 8 client sites
**Context:** Gets handed vague instructions ("the SEO isn't working"). Needs specific, evidence-backed diagnostics — not opinion. Wants data he can put in a ticket.
**Jobs to be done:**
- Understand which internal links are routing users away from conversion pages
- Get page-level diagnoses he can translate directly to code changes (redirects, internal link edits, content gaps)
- Know the estimated impact before he prioritizes a fix

**Success state:** Marcus sees a red node (`/blog/what-is-hvac`), opens the action brief, reads "This page ranks for `hvac repair dallas` but 83% of sessions exit without visiting any service page. GA4 flow shows 0 internal links to `/services`. Recommendation: Add contextual CTA to service page — estimated 15-23% conversion lift based on comparable pattern on 3 similar sites." He opens a Jira ticket.

---

### Persona 3: The Executive / Decision Maker

**Name:** Graham, owner of Demo Site Co.
**Context:** Non-technical. Wants to know if his $3,500/month marketing spend is going to pages that convert. Trusts his agency but wants independent validation.
**Jobs to be done:**
- Understand the site's health at a glance without reading a 40-page report
- Know which 3 things to fix first
- Have language he can use in his agency review meeting

**Success state:** Graham sees the node canvas with a color-coded summary: 12 healthy pages, 8 leaking, 3 critical. He opens the Top 3 Action Brief. One item reads: "Your `/contact` page is not reachable from any ranked page in 2 clicks. Fix: add contact CTA to the 5 highest-traffic service pages." He takes that to his agency.

---

## Issue Detection Patterns

NavFlow detects five compound failure patterns. Each requires signal from at least two of the three sources.

### 1. SERP Trap
**What it is:** A page ranks well in GSC but GA4 shows high bounce rate + no conversion event. The page is capturing search intent it can't satisfy.
**Signals:** GSC clicks > threshold, GA4 engagement_rate < 30%, GA4 conversion_rate = 0
**Action brief focus:** Identify intent mismatch — is the page targeting the right keyword, or is it ranking for a query the content doesn't answer?

### 2. Intent Collision
**What it is:** Two or more pages compete for the same primary keyword in GSC, splitting authority and diluting ranking potential for both.
**Signals:** Two URLs share top-3 keyword from DataForSEO, both rank 5-20 (neither wins), internal links split between them
**Action brief focus:** Consolidate to one canonical page; 301 the weaker; concentrate internal links on winner.

### 3. Invisible Converter
**What it is:** A page drives a high percentage of GA4 conversion events but receives almost no internal links — it's succeeding despite the site structure, not because of it.
**Signals:** GA4 conversion_rate top quartile for URL, internal_inlinks count from Crawl4AI < 3, no edge from high-traffic pages in the flow graph
**Action brief focus:** Add internal links from high-traffic pages to this converter; protect it from future restructuring.

### 4. Leaky Funnel Entry
**What it is:** A high-traffic entry page (GA4 first_page_url) sends users to pages with low conversion rates or off-site. The funnel leaks at the top.
**Signals:** GA4 session start > threshold, GA4 page-to-page transition shows dominant exit path to low-value page or exit, Crawl4AI reveals no CTA links on the entry page
**Action brief focus:** Add navigational CTA to conversion path; reduce competing exit paths.

### 5. Keyword Cannibalization Drain
**What it is:** A high-priority target keyword is distributed across 3+ pages, none of which rank in the top 10. Total potential is divided.
**Signals:** DataForSEO keyword appears on 3+ pages, none rank < position 11, GSC click-through rate for the keyword below 2%
**Action brief focus:** Designate one page as the keyword champion; consolidate content; redirect others.

---

## Core Features

### F1 — Data Ingestion Pipeline
**Description:** Pull and normalize data from GSC, GA4 BigQuery, DataForSEO, and Crawl4AI into a per-URL canonical data model.

**User story:** As a user, I connect my GSC and GA4 accounts via OAuth, provide a domain, and NavFlow pulls 90 days of data and crawls the site so I can see a complete picture without manual data export.

**Acceptance criteria:**
- OAuth flow completes for GSC in < 2 minutes
- GA4 BigQuery export is queried; page-to-page transition edges are computed using LEAD() on `batch_page_id`/`batch_ordering_id` fields (added July 2024)
- DataForSEO keyword data fetched for all crawled URLs
- Crawl4AI returns internal link graph and content extraction for all reachable URLs
- All four sources normalized to `{ url, metrics{} }` schema in Supabase
- Pipeline status visible to user (progress indicator per source)

**Out of scope for v1:** Real-time re-crawl, multi-domain comparison, historical trend views

---

### F2 — Correlation Engine
**Description:** Join the four-source per-URL model, compute composite issue signals, and score each URL.

**User story:** As a user, I want each page scored so I know which ones have the most urgent issues without reading all the data myself.

**Acceptance criteria:**
- Three-source join completes for all crawled URLs
- Each of the five issue patterns detects correctly on the demo site (validated against known issues)
- Each URL receives an impact score (P0/P1/P2/P3)
- Scores stored in Supabase; queryable via dashboard
- Edge list (page-to-page flows) computed and persisted

---

### F3 — LLM Action Brief
**Description:** For each detected issue, generate a URL-specific, impact-ranked, data-cited action brief via OpenRouter.

**User story:** As a marketer, I want to click any flagged page and read a specific recommendation — not generic SEO advice — so I can hand it directly to my agency.

**Acceptance criteria:**
- Action brief includes: issue pattern name, specific data citations (GSC clicks, GA4 exit rate, DataForSEO keyword, crawl finding), recommended action with estimated impact range, confidence level
- Brief is URL-specific (not templated) — different pages produce materially different briefs
- Gemini 2.5 Flash used for volume generation; Claude Sonnet 4.6 used for final synthesis
- Structured output enforced via OpenRouter `require_parameters: true`
- Demo brief cached — no live LLM inference during Week 7-8 demo run
- Brief renders in < 3 seconds from click on node canvas

---

### F4 — Node Canvas
**Description:** Interactive React Flow canvas rendering all crawled URLs as nodes, with edges representing measured user flows.

**User story:** As an executive, I want to see my entire site at a glance, with problem pages immediately visible by color, so I don't have to read a table of data.

**Acceptance criteria:**
- Each node represents one URL; label = page title or slug
- Node color: Green (healthy, no issues), Yellow (leaking, P2 issue), Red (critical, P0/P1 issue), Blue (opportunity, Invisible Converter)
- Edges rendered from GA4 page-to-page transition data; edge weight proportional to flow volume
- ELK layout (`elkjs`) used for auto-layout; handles 50-200 nodes without overlap
- Clicking a node opens sidebar with: URL, composite signal summary, action brief, raw data sources
- Canvas renders on Vercel; public URL accessible
- `"use client"` wrapper used only on canvas component; page shell is server-rendered (SSR-first rule)

---

### F5 — Demo Site Audit (Demo Site Co.)
**Description:** End-to-end validated audit of [demo-site.com] with authentic data, cached for demo reliability.

**User story:** As a judge, I want to see NavFlow run on a real website with real traffic data, not a mockup, so I can evaluate whether the product actually works.

**Acceptance criteria:**
- GA4 BigQuery export enabled on the demo site property (prerequisite: must be enabled by 2026-06-16, no backfill)
- All five issue patterns searched; at least 2 detected with real data citations
- Action briefs generated and reviewed by Ruby (executive demo lead) for business accuracy
- Demo run completes end-to-end in < 5 minutes with no live API calls
- Findings reviewed with client team before submission

---

## Architecture Decision: Supabase over Firebase

**Decision:** Replace Firebase/Firestore with Supabase (PostgreSQL) for all data persistence.

**Rationale:**
- Firestore has no JOIN syntax — three-source correlation requires INNER JOINs across url_metrics, keyword_signals, and crawl_data tables. Firestore's document model requires client-side fan-out for every join.
- Per-document billing: at 50K reads/day free limit, 50 dashboard page loads exhaust the free tier. Estimated Firebase cost at scale: ~$180/month. Supabase pro: $25/month.
- PostgreSQL window functions (`RANK()`, `ROW_NUMBER()`, `LEAD()`) are native — required for scoring URL impact and computing page transition sequences.
- Supabase offers native Row-Level Security, real-time subscriptions (for pipeline status), and a Python client that works directly in the FastAPI backend.

**Rejected alternative:** Firebase Realtime Database — same billing model, worse query support.

**Owner:** Krishna (data layer), Raj (infra/Terraform)

---

## Tech Stack

| Layer | Technology | Owner |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router), React Flow (@xyflow/react v12.11) | Edward |
| Canvas layout | ELK (`elkjs`), `@dagrejs/dagre` | Edward |
| Backend API | FastAPI (Python) | Nithin |
| Database | Supabase (PostgreSQL) — replaces Firebase | Krishna, Raj |
| Cloud infra | AWS (EC2/ECS/Lambda), Terraform | Raj |
| Data pipeline | Databricks (or AWS Glue), Python | Krishna |
| GSC connector | OAuth2 user flow (service account requires manual Owner grant — use user OAuth) | Nithin |
| GA4 connector | BigQuery Export + `google-cloud-bigquery` SDK | Nithin, Krishna |
| Crawl4AI | Self-hosted at Mac Pro :11235 (JS rendering, sitemap, link graph) | Edward |
| LLM | OpenRouter: Gemini 2.5 Flash (volume) + Claude Sonnet 4.6 (synthesis) | Utkarsh |
| Deploy | Vercel (frontend) + AWS (backend) | Raj, Edward |
| ADRs | `/docs/adr/` in repo | Edward |

---

## Constraints

- **8-week hard deadline** — Week 8 = submission. No scope additions after Week 5.
- **Demo must run without live API calls** — cache all data after Week 7 UAT.
- **Real data only** — no mocked metrics in the demo. If BigQuery isn't ready, the demo site is not viable.
- **SSR-first** — React Flow canvas uses `"use client"` on the canvas component only. Page shell, metadata, and any content outside the canvas must be server-rendered.
- **ADR for every major decision** — written in `/docs/adr/` before implementation begins, not after.

---

## Out of Scope (v1)

- Multi-site comparison
- Automated fix implementation (NavFlow diagnoses; humans fix)
- E-commerce / revenue attribution (conversion events only, not revenue)
- Paid search (Google Ads, Meta Ads) data sources
- Real-time re-crawl or live monitoring
- White-label or multi-tenant auth
- WordPress/Webflow integrations (post-competition)

---

## Open Decisions (require team input)

| # | Decision | Owner | Due |
|---|----------|-------|-----|
| 1 | Confirm Supabase over Firebase (ADR-001) | Krishna, Raj | Week 1 |
| 2 | GA4 BigQuery export enabled on the demo site property | Edward | 2026-06-16 |
| 3 | Google OAuth app verification started (can take days) | Nithin, Raj | 2026-06-16 |
| 4 | AWS region (us-east-1 vs us-east-2) | Raj | Week 1 |
| 5 | Crawl4AI hosted on Mac Pro vs AWS (for team access) | Edward, Raj | Week 1 |
| 6 | DataForSEO API access — who holds the key, what budget | Edward | Week 1 |
| 7 | Supabase instance — hosted (supabase.com) vs self-hosted | Krishna, Raj | Week 1 |

---

## Appendix: Data Model (v0)

```sql
-- Per-URL canonical record
CREATE TABLE url_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL,
  url TEXT NOT NULL,
  -- GSC
  gsc_clicks INTEGER,
  gsc_impressions INTEGER,
  gsc_ctr FLOAT,
  gsc_position FLOAT,
  gsc_top_keywords JSONB,
  -- GA4
  ga4_sessions INTEGER,
  ga4_bounce_rate FLOAT,
  ga4_engagement_rate FLOAT,
  ga4_conversion_rate FLOAT,
  ga4_entry_rate FLOAT,
  -- DataForSEO
  dseo_keyword_count INTEGER,
  dseo_top_keyword TEXT,
  dseo_top_position INTEGER,
  dseo_competing_urls JSONB,
  -- Crawl
  crawl_internal_inlinks INTEGER,
  crawl_internal_outlinks INTEGER,
  crawl_has_cta BOOLEAN,
  crawl_title TEXT,
  crawl_meta_description TEXT,
  -- Scoring
  issue_patterns JSONB,   -- array of detected pattern names
  impact_score TEXT,      -- P0/P1/P2/P3
  action_brief TEXT,      -- LLM output
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page-to-page flow edges (from GA4 BigQuery)
CREATE TABLE page_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL,
  from_url TEXT NOT NULL,
  to_url TEXT NOT NULL,
  session_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
