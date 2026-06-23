# Design System

## Color

### Theme

Dark-first. The product is used by marketers in browser-heavy work sessions — ambient office or home light, competitive analysis mindset. Dark bg reduces eye strain during data review and makes the canvas glow effects feel intentional rather than decorative.

### Palette

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#020617` (slate-950) | App background, canvas fill |
| `--surface` | `#0f172a` (slate-900) | Cards, panels, node backgrounds |
| `--surface-raised` | `#1e293b` (slate-800) | Hover/selected state surfaces |
| `--border` | `#334155` (slate-700) | Default borders |
| `--border-subtle` | `#1e293b` (slate-800) | Low-priority dividers |
| `--ink` | `#f1f5f9` (slate-100) | Primary text |
| `--ink-muted` | `#94a3b8` (slate-400) | Secondary text |
| `--ink-dim` | `#64748b` (slate-500) | Disabled / metadata |

### Issue Pattern Palette (semantic, not decorative)

| Pattern | Color | Hex |
|---------|-------|-----|
| SERP Trap | Orange | `#f97316` |
| Intent Collision | Purple | `#a855f7` |
| Invisible Converter | Blue | `#3b82f6` |
| Leaky Funnel Entry | Yellow | `#eab308` |
| Cannibalization | Red | `#ef4444` |
| Healthy (no issues) | Green | `#22c55e` |

Each pattern gets a `color` (border, text, dot) and a `bg` (`color + 12%` alpha) for filled backgrounds.

### Data Source Palette

| Source | Color | Hex |
|--------|-------|-----|
| GSC | Green | `#4ade80` |
| GA4 | Blue | `#60a5fa` |
| DataForSEO | Amber | `#f59e0b` |
| Crawl4AI | Violet | `#a78bfa` |

### Color Strategy

Restrained on structural surfaces (bg/surface/border stay in the slate ramp). The issue pattern colors carry all the expressive weight — they should remain vivid and distinct. Never use pattern colors for structural UI elements.

## Typography

### Fonts

- **Geist Sans** — body, UI labels, headings. Clean geometric sans that doesn't compete with data.
- **Geist Mono** — URL slugs, code, metrics. Monospaced legibility for path strings.

### Scale (functional, not decorative)

| Name | Size | Weight | Use |
|------|------|--------|-----|
| Display | 36px / `text-4xl` | 700 | Landing page H1 only |
| Heading | 20px / `text-xl` | 600 | Panel headers, section titles |
| Label | 14px / `text-sm` | 500 | UI labels, button text, nav |
| Body | 14px / `text-sm` | 400 | Paragraph text, descriptions |
| Caption | 12px / `text-xs` | 400 | Metadata, timestamps, chips |
| Micro | 10px | 400-700 | In-node metrics, impact badges |

### Rules

- URL paths: always `font-mono`. Never truncate mid-path — break-all.
- Body line length cap: 65ch max.
- Data numbers: tabular-nums, right-align in table-like contexts.
- No uppercase tracked eyebrows on every section.

## Components

### UrlNode

Graph node card. 160–240px wide, 90px tall (ELK sizing). Inline-styled (React Flow constraint).

- Background: `#0f172a` (rest), `#1e293b` (selected)
- Border: `2px solid {healthColor}88` (rest), `2px solid {healthColor}` (selected)
- Glow: `box-shadow: 0 0 0 2px {healthColor}44` on selected
- URL label: 11px, slate-200, `word-break: break-all`
- Status dot: 8px circle, health color
- Impact badge: P0–P3 in health color, 10px, bold, `letter-spacing: 0.05em`
- Metric row: 10px, slate-500, flex row with gap

### NodeSidebar

320px fixed right panel. Slides in on node selection.

- Background: `surface` with `border-l border-slate-800`
- Header: URL path in mono, health color accent
- Sections: Issue / Evidence (3-point list) / Recommended Action / Est. Impact / Confidence badge
- Pattern badges: pill with pattern color
- Source chips: filled with source color when active, slate-700 border when inactive

### AppHeader

32px tall top bar. Never competes with the canvas.

- Logo: "NavFlow" in Geist Sans, 14px, bold, white
- Audit name: 12px, slate-400
- Version badge: `bg-slate-900 border border-slate-800 rounded text-xs text-slate-500`

### AuditSummary

Compact stat bar below AppHeader. 5 stats: URLs Audited, Critical, Leaking, Opportunities, Sessions at Risk.

- Background: `bg-slate-900 border-b border-slate-800`
- Labels: 11px uppercase, slate-500
- Values: 20px, bold, colored per health state for critical/leaking/opportunity

### DemoBanner

Single amber strip. Only renders when `NEXT_PUBLIC_DEMO_MODE=true`. 36px tall.

- Background: amber-950, border-b amber-900
- Text: amber-400, 12px

### IssuePatternLegend

Collapsed: 5-dot pill strip. Expanded: 272px panel showing all 5 patterns with color, name, description.

- Floating absolute top-left of canvas area
- Collapsed pill: `bg-slate-900 border-slate-700 rounded-lg`
- Expanded panel: same surface, shadow-lg

### Filter Bar

Floating pill bar, bottom-center of canvas.

- `bg-slate-900 border-slate-700 rounded-full`
- Active filter: `border-{healthColor} text-{healthColor} bg-slate-800`
- Inactive: `border-transparent text-slate-500`
- Count badges: slate-600 dimmed

### PipelineStatus

4-source status display (idle / running / done / error).

- Running: animated pulse dot
- Done: green dot
- Error: red dot, `SourceErrorCard` inline below

### ErrorStates

`SourceErrorCard`: inline `bg-red-950 border border-red-900 rounded-lg` with retry button.

`AuthExpiredOverlay`: `absolute inset-0 bg-slate-950/90 backdrop-blur-sm`, centered modal card.

## Layout

### App Shell

```
┌─────────────────────────────────────────┐
│ DemoBanner (conditional, 36px)          │
├─────────────────────────────────────────┤
│ AppHeader (40px)                        │
├─────────────────────────────────────────┤
│ AuditSummary (48px)                     │
├──────────────────────┬──────────────────┤
│                      │                  │
│  JourneyCanvas       │  NodeSidebar     │
│  (flex-1)            │  (320px, cond.)  │
│                      │                  │
│  [IssuePatternLegend │                  │
│   abs. top-left]     │                  │
│                      │                  │
│  [FilterBar          │                  │
│   abs. bottom-center]│                  │
└──────────────────────┴──────────────────┘
```

Full viewport: `h-screen w-screen overflow-hidden`. No scroll on the canvas shell.

### Landing Page

Centered column, max-width 512px. Nav + hero + form + pattern strip + footer. Vertical rhythm via padding, not cards.

## Spacing

Base unit: 4px (Tailwind's `1` = 4px). Use multiples: 4, 8, 12, 16, 24, 32, 48.

Gaps inside components: 6–12px. Gaps between sections: 24–48px. Panel padding: 16px.

## Motion

Currently minimal. Intended motion register:

- Node selection: border + background transition, 150ms ease-out
- Sidebar entrance: slide from right, 200ms ease-out
- Skeleton pulse: `animate-pulse`, 2s cycle
- Demo banner: none (static)
- Filter active state: transition-colors, 150ms
- Reduced-motion: all transitions → `transition: none`

## Z-Index Scale

| Layer | Value |
|-------|-------|
| Canvas base | 0 |
| React Flow controls | 4 |
| Canvas overlays (legend, filter bar) | 10 |
| Panel / sidebar | 20 |
| Modal / overlay | 30 |
| Toast | 40 |

## Known Gaps (audit backlog)

1. `globals.css` still contains default Next.js light/dark variables that conflict with the actual dark-first design — cleanup needed.
2. No CSS custom properties defined — all design decisions live in Tailwind utilities, making systematic refactoring harder.
3. `--ink-dim` (slate-500 / `#64748b`) on `--bg` (slate-950 / `#020617`) barely clears 4.5:1 — should be verified and bumped to slate-400 for body text contexts.
4. Issue pattern colors are all at ~500-level luminance — they read similarly on dark bg. Consider varying luminance across patterns for easier distinction.
5. Landing page and canvas page don't share a consistent header/nav component — two separate visual languages.
6. No motion beyond pulse/transitions — animate.md pass would add sidebar slide, filter pill, node entrance.
