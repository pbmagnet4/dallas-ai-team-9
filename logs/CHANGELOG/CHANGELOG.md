# Changelog — NavFlow

Session-by-session record of what changed and why.
Read the last 2-3 entries when starting a new work session for context.
Cap: 10 entries — archive older entries to CHANGELOG-YYYY.md when exceeded.

---

## 2026-06-23 — flowgram patterns + UI enhancement pass + light/dark toggle

### Changes
- **flowgram.ai research & extraction** — evaluated flowgram as React Flow replacement (rejected — wrong model for data-driven canvas); extracted visual grammar as patterns
- **useHistory hook** (`hooks/useHistory.ts`) — generic snapshot-based undo/redo, single useState to avoid stale closure issues, 50-entry cap
- **variableEngine** (`lib/variableEngine.ts`) — `PortKind`, `EdgeMetrics` types; `computeEdgeMetrics()` derives drop-off rates and conversion potential; `getPortKind()` maps health to funnel role
- **MetricEdge** (`components/MetricEdge.tsx`) — custom React Flow edge with fat invisible hit area and EdgeLabelRenderer tooltip; weight-based thickness across all 3 layout modes
- **Dagre layout** — third layout mode (top-down compact tree) alongside ELK + force; all 3 computed in parallel on mount
- **DoubleLoop cascade** — BFS from critical/leaking nodes; cascade depth injected into node data; downstream nodes dim by opacity
- **UrlNode** — full visual redesign: colored header band replacing 2px strip, lucide health icons, health-tinted border via color-mix, health-colored handles
- **NodeSidebar** — full CSS var conversion (no more hardcoded dark Tailwind classes), port kind intelligence section using variableEngine, width 320px
- **AIPanel fix plan** — replaced linear timeline with node card flow diagram; condition steps have 2-column Yes/No branch grid
- **Light/dark theme toggle** — attribute-based (`[data-theme="dark"]` on html), FOIT prevention inline script in `<head>`, `useTheme` hook with localStorage persistence

### Key Decisions
- React Flow correct for NavFlow; flowgram is for authored workflow builders, not data-driven intelligence canvases
- `color-mix(in srgb, ${color} N%, var(--surface))` used throughout for theme-adaptive tinting — eliminates all hardcoded dark/light branches
- Light mode is the explicit default (not OS-detected); user preference persists in localStorage

### State
- 3 commits: `3aeb72c` (flowgram patterns), `6b47da9` (UI enhancement pass), `cd7cd76` (theme toggle)
- TypeScript clean, production build passing, all 7 routes static
- Canvas: 3 layout modes, undo/redo, edge metrics, double-loop cascade, port kind intelligence

### Next Session Priorities
- Enable BigQuery export on demo GA4 property → real session flow data for `flowWeight` values
- Set up OpenRouter account + spend cap → wire AI panel to real Gemini 2.5 Flash
- Wire "Ask AI" topbar button to canvas AI panel
- Expanded pattern legend (task #99), error state components (task #100)

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
