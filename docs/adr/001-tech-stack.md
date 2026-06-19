# ADR-001 — Tech Stack Rationale

**Status:** Accepted
**Date:** 2026-06-15
**Owner:** Edward Chalupa
**Deciders:** Edward, Krishna, Nithin, Raj

---

## Context

NavFlow must join three external data sources (GSC, GA4/BigQuery, DataForSEO) at the URL level, score compound failures, generate per-URL AI action briefs, and render the result as an interactive node canvas — all within an 8-week build timeline. The stack must support a live demo with no live API calls during presentation.

---

## Decisions

### 1. Database: Supabase (PostgreSQL) over Firebase/Firestore

**Decision:** Supabase.

**Why Firestore was rejected:**
- No JOIN syntax. The three-source correlation engine requires `INNER JOIN` across `url_signals`, `page_flows`, and the per-URL scoring model. Firestore's document model forces client-side fan-out for every join — O(n) reads per correlation query.
- Per-document billing. At Firestore's free tier (50K reads/day), 50 dashboard page loads exhaust the quota. Estimated cost at 500 active sites: ~$180/month vs. Supabase Pro at $25/month.
- No window functions. `RANK()`, `ROW_NUMBER()`, and `LEAD()` are native to PostgreSQL and required for scoring URL impact tiers and computing page-to-page transition sequences from BigQuery export data. Firestore has no equivalent.

**Why Supabase was chosen:**
- PostgreSQL: native JOINs, window functions, JSONB columns for flexible metadata, Row-Level Security for multi-tenant isolation.
- Real-time subscriptions for pipeline status updates (no polling).
- Python client (`supabase-py`) integrates directly into FastAPI backend.
- Hosted option (supabase.com) eliminates infra overhead during the competition sprint; self-hostable post-competition.

---

### 2. Frontend: Next.js 14 (App Router)

**Decision:** Next.js 14 with App Router.

**Why:** SSR-first requirement. SEO-critical content and the canvas shell must render server-side. React Flow canvas is wrapped in a single `"use client"` component (`JourneyCanvas.tsx`); all surrounding page structure is server-rendered. This satisfies the SSR-first rule while allowing the interactive canvas to run client-side.

**Rejected:** Pure SPA (Vite + React). No SSR, would require additional work to deploy on Vercel with server-side data fetching.

---

### 3. Canvas: React Flow (@xyflow/react v12.11)

**Decision:** React Flow with ELK layout (`elkjs`) and `@dagrejs/dagre` for tree layouts.

**Why:** Production-grade graph visualization library. Handles 50–200 nodes with proper memoization. ELK layout produces better edge routing for large graphs than dagre alone. Active development, 22k+ GitHub stars, used in production by Stripe, Vercel, Linear.

**Rejected:** D3.js force layout. More flexible but requires significant custom code for node drag, zoom, minimap, and edge routing that React Flow provides out of the box. Not worth rebuilding for an 8-week sprint.

**Rejected:** Cytoscape.js. Heavier bundle, React integration less clean, less active community than React Flow.

---

### 4. Backend: FastAPI (Python)

**Decision:** FastAPI.

**Why:** Python is the correct language for the data pipeline layer (Google Cloud BigQuery SDK, `supabase-py`, DataForSEO client, Crawl4AI integration). FastAPI provides async support, automatic OpenAPI docs, and Pydantic validation at zero friction. The backend and data pipeline share the same language, eliminating a context switch.

**Rejected:** Express (Node.js). Would require bridging to Python for the data pipeline. The GSC, GA4 BigQuery, and DataForSEO SDKs all have stronger Python support.

---

### 5. LLM: OpenRouter (Gemini 2.5 Flash + Claude Sonnet 4.6)

**Decision:** OpenRouter with `require_parameters: true` for structured output.

**Model routing:**
- Gemini 2.5 Flash (~$0.07–0.15/1M tokens): volume brief generation, one brief per flagged URL
- Claude Sonnet 4.6: final synthesis, cross-URL pattern summary, executive brief

**Why OpenRouter over direct API calls:** Single key, single billing, model fallback routing, no per-model SDK integration. Structured output enforcement via `require_parameters: true` eliminates JSON parsing failures in the action brief pipeline.

**Why not GPT-4o:** Higher cost (~$2.50/1M vs $0.07–0.15) for equivalent output quality on structured summarization tasks. Gemini 2.5 Flash is sufficient for URL-level briefs.

**Demo caching:** All briefs pre-generated and cached in Supabase after Week 7 UAT. No live LLM calls during the Week 8 demo.

---

### 6. Data Pipeline: Databricks (or AWS Glue)

**Decision:** Databricks preferred; AWS Glue as fallback.

**Why Databricks:** Native Spark SQL for large-scale BigQuery export processing, Delta Lake for incremental updates, MLflow for scoring model tracking. Krishna has Databricks expertise.

**Fallback to AWS Glue:** If Databricks licensing is unavailable for the sprint, AWS Glue (Spark on AWS) provides equivalent functionality within the existing AWS infra footprint.

**Decision owner:** Krishna. Must be confirmed by end of Week 1.

---

### 7. Cloud Infra: AWS + Terraform

**Decision:** AWS (EC2/ECS/Lambda) managed via Terraform.

**Why AWS:** Team has existing AWS expertise (Raj). The BigQuery connector runs as a Lambda or ECS task on a schedule. Supabase hosted removes the need for managed database infra on AWS.

**Terraform:** All infra as code from day one. No snowflake environments. Clean destroy/recreate for the demo environment.

---

### 8. GSC Auth: OAuth2 User Flow (not Service Account)

**Decision:** OAuth2 user flow.

**Why:** GSC service accounts require the property owner to manually grant the service account Owner permission in Google Search Console — a manual step that creates onboarding friction for every new customer. OAuth user flow is self-service: the user authorizes NavFlow to read their own GSC data.

**Implication:** Google OAuth app verification must be submitted immediately (critical-path item, can take days to weeks). Owner: Nithin.

---

### 9. Crawl4AI: Self-hosted at Mac Pro :11235

**Decision:** Use the existing Crawl4AI instance self-hosted on the Mac Pro.

**Why:** Already deployed, handles JS rendering (required for Next.js sites like the demo site), returns internal link graphs natively, zero incremental cost. For the competition sprint, self-hosted is sufficient.

**Post-competition:** Move to AWS for team access and production reliability.

---

## Consequences

- Supabase schema must be finalized in Week 1 before any connector writes data.
- GA4 BigQuery export must be enabled on the demo site immediately (no backfill — data accumulates from enable date only).
- OAuth app verification is the critical-path item with the longest external dependency (Google review timeline).
- All demo data must be cached by end of Week 7 — no live API calls in Week 8.
