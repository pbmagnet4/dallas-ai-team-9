# Changelog — NavFlow

Session-by-session record of what changed and why.
Read the last 2-3 entries when starting a new work session for context.
Cap: 10 entries — archive older entries to CHANGELOG-YYYY.md when exceeded.

---

## 2026-06-15 — PRD v0.1 + Project Scaffolding

### Changes
- Created `docs/PRD.md` — lean PRD covering 3 personas, 5 issue detection patterns, 5 core features with acceptance criteria, full tech stack, and data model v0
- Created `docs/` and `logs/CHANGELOG/` directories
- Scaffold only — `src/` is empty

### Key Decisions
- **Supabase over Firebase** (ADR-001 pending): Firestore has no JOINs, per-document billing, 50K/day free limit. Supabase/PostgreSQL is structurally correct for a three-source correlation engine.
- **Demo site confirmed:** Demo Site Co. (real home services business — permission granted) — permission granted by the client
- **BigQuery export must be enabled on demo site GA4 immediately** (no backfill — P0, due 2026-06-16)
- **Google OAuth app verification must start immediately** (can take days — P0, due 2026-06-16)
- **GSC auth:** Use OAuth user flow, not service account (service account requires manual Owner grant from each client)
- **GA4 BigQuery transition data:** Use LEAD() on `batch_page_id`/`batch_ordering_id` fields (added July 2024) for page-to-page sequence reconstruction
- **React Flow:** @xyflow/react v12.11 + ELK layout (`elkjs`) + `@dagrejs/dagre` for trees; handles 50-200 nodes with proper memoization; `"use client"` wrapper on canvas component only
- **OpenRouter:** `require_parameters: true` for structured output; Gemini 2.5 Flash for volume, Claude Sonnet 4.6 for final synthesis
- **Crawl4AI:** Already self-hosted at Mac Pro :11235 — handles JS rendering, sitemap parsing, internal link graph natively

### State
- Team: 9 people (8 active + Ben Peeri as advisor)
- NocoDB tasks: 14 decision/blocker tasks created (IDs 10-23)
- PRD: v0.1 draft, pending team review
- Repo: scaffold only, no implemented code

### Next Session Priorities
- Team reviews PRD and amends/updates their assigned sections
- ADR-001: Supabase vs Firebase — get Krishna and Raj aligned
- Enable BigQuery export on demo site GA4 property (Edward — TODAY)
- Start Google OAuth app verification (Nithin/Raj — TODAY)
- Week 1 architecture sprint begins: GSC + GA4 connectors, Supabase schema, Terraform scaffold
