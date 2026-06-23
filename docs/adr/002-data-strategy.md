# ADR-002 — Data Strategy: BigQuery vs GA4 API, Hybrid Demo Approach

**Status:** Accepted
**Date:** 2026-06-20
**Owner:** Edward Chalupa
**Deciders:** Edward, Krishna, Nithin

---

## Context

NavFlow requires behavioral page-flow data (user journeys across URLs) to produce journey map edges and to detect Leaky Funnel Entry and Invisible Converter patterns. Two data sources are available: the GA4 Data API (free, no setup) and GA4's BigQuery Export (requires GCP project linkage). The team must decide which to use for the competition build and what that means for the demo data strategy given that GOAT Home Services has thin keyword data.

---

## Decision 1: BigQuery over GA4 Data API for page-flow edges

**Decision:** Use GA4 BigQuery Export as the authoritative source for page-to-page transition edges.

**Why the GA4 Data API is insufficient for journey edges:**
- The GA4 Data API aggregates events per-session but does not expose the sequence of pages within a session.
- The API can return "sessions that included /page-A" and "sessions that included /page-B" but cannot answer "what percentage of sessions that hit /page-A also hit /page-B next."
- Journey edge weight (the core canvas feature) requires knowing exact page transition sequences, which only BigQuery provides.

**Why BigQuery enables this:**
- GA4 BigQuery Export writes one row per event per session. The `batch_page_id`, `batch_ordering_id`, and `batch_event_index` fields (added July 2024) allow exact reconstruction of the page sequence within each session using `LEAD()` window functions.
- Full SQL: `LEAD(page_location) OVER (PARTITION BY session_id ORDER BY batch_ordering_id, batch_event_index)` produces the next-page in sequence per row — this is the journey edge.
- This capability does not exist in any GA4 API surface below the ~$30K/year enterprise tier.

**Trade-offs accepted:**
- BigQuery export must be enabled immediately — data accumulates from the enable date only, with no backfill. Every day it is not enabled loses irrecoverable journey data.
- A GCP project is required (Raj owns provisioning via Terraform).
- The team uses a service account (JSON key) to query BigQuery, not user OAuth.

**Rejected:** GA4 Data API as the sole source. It satisfies 4 of 5 issue detection patterns but produces a canvas with no edges — the differentiating visual feature is absent.

---

## Decision 2: Two-tier product architecture (post-competition)

**Decision:** NavFlow ships as two tiers.

| Tier | Data Source | Patterns | Price Target |
|------|-------------|----------|--------------|
| Lite | GA4 Data API + GSC + DataForSEO + Crawl4AI | 4/5 (SERP Trap, Intent Collision, Invisible Converter, Keyword Cannibalization Drain) | ~$49/month |
| Full | BigQuery Export + all lite sources | All 5 + journey edges | ~$199/month |

**Why this matters for the competition:** The BigQuery-powered full tier is the actual market differentiator. No tool below enterprise pricing produces page-to-page journey flows for SEO clients. The lite tier functions as a self-service entry point with a natural upgrade path when clients want the journey map.

**Competition deliverable:** Full tier — BigQuery journey edges are the visual centerpiece of the demo.

---

## Decision 3: Hybrid demo data strategy

**Context:** DataForSEO validation of GOAT Home Services returned only 9 ranked keywords (all positions 23–99). Intent Collision and Keyword Cannibalization Drain patterns require keyword density that the live site cannot provide.

**Decision:** Use real data as the behavioral foundation, synthetic data for keyword density.

| Layer | Source | Authenticity |
|-------|--------|--------------|
| Crawl structure | Live Crawl4AI crawl | Real |
| GA4 behavioral | BigQuery Export (pending enable) | Real |
| GSC impressions/clicks | GSC API | Real |
| DataForSEO keyword ranking | Live API + synthetic seed | Hybrid |

**Synthetic keyword seed (`scripts/seed/demo-keyword-seed.json`):**
- Contains realistic keyword data for GOAT's service/location pages at realistic positions and volumes.
- Seeded into `url_signals.dseo_*` fields in Supabase during the demo environment setup.
- Covers all 5 issue patterns to ensure every detection type fires in the demo.
- Keywords are real search queries (home services in DFW) at plausible volumes — not fabricated.

**Why hybrid rather than full synthetic:**
- A full synthetic audit is unconvincing to judges. Real GA4 behavioral data (bounce rates, session counts, conversion paths) cannot be faked and provides authenticity the judges can verify.
- Hybrid approach: "this is real website behavioral data; we supplemented the keyword layer for pattern density" is defensible.

**In all public-facing materials (GitHub README, demo slides), the client is referred to as "Demo Site Co." — no client name or internal IP addresses are committed to the repository.**

---

## Consequences

- BigQuery export must be enabled on GOAT GA4 property immediately (Edward, P0 blocker).
- `scripts/seed/demo-keyword-seed.json` must be generated and ingested before the Week 3 correlation pipeline runs.
- Krishna's correlation pipeline must merge real GA4/GSC/Crawl4AI rows with the seeded DataForSEO rows using the canonical URL as the join key.
- The two-tier architecture must be documented in the pitch deck (Ruby, Week 8).
