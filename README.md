# NavFlow AI — Customer Journey Intelligence Platform

Dallas AI Summer 2026 — Team 9 (8-week sprint)

NavFlow correlates Google Search Console, GA4, DataForSEO, and Crawl4AI at the URL level and renders the compound signal as an interactive journey map with AI-generated action briefs.

## Repo Structure

```
apps/web/           → Next.js 14 frontend (Edward)
apps/api/           → FastAPI backend (Nithin)
packages/connectors/→ GSC, GA4, DataForSEO, Crawl4AI connectors (Nithin)
infra/              → Terraform — AWS + Supabase (Raj)
docs/
  PRD.md            → Product requirements
  OPPORTUNITY.md    → Market opportunity
  adr/              → Architecture Decision Records
logs/CHANGELOG/     → Session changelog
```

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready only. PR required, one review minimum. |
| `staging` | Pre-demo integration. All features merge here first. |
| `feature/<name>/<task>` | Individual work. Examples: `feature/edward/nextjs-scaffold`, `feature/nithin/gsc-connector` |

**Rules:**
- Branch off `staging`, merge back to `staging` via PR
- `main` ← `staging` only when staging is stable and demo-ready
- No direct pushes to `main` or `staging`
- PR title format: `[Week N] Short description`

## Team

| Name | Role | GitHub |
|------|------|--------|
| Edward Chalupa | Product Lead, Frontend | pbmagnet4 |
| Nithin Gopal | Backend, API Connectors | omegagigachad |
| Krishna Shukla | Data Engineer, Pipeline | — |
| Nagaraj Rao (Raj) | Cloud Infra, Terraform | — |
| Utkarsh Garg | Data Science, LLM layer | — |
| Ruby Grewal | Executive Demo Lead | — |
| David Morgan | Sales Strategy, GTM | — |
| Andrea Hamblin | UX Validation | pandiorama |
| Ben Peeri | Advisor | — |

## Timeline

| Week | Dates | Focus |
|------|-------|-------|
| 0 | Jun 9–15 | Planning, PRD, scaffolding |
| 1 | Jun 16–22 | Connectors, schema, infra scaffold |
| 2 | Jun 23–29 | Three-source join, correlation engine |
| 3 | Jun 30–Jul 6 | Issue detection (5 patterns), scoring |
| 4 | Jul 7–13 | LLM action briefs, OpenRouter integration |
| 5 | Jul 14–20 | Node canvas prototype, UX feedback |
| 6 | Jul 21–27 | Canvas edges (GA4 flows), full deploy |
| 7 | Jul 28–Aug 3 | Demo site audit, hardening, caching |
| 8 | Aug 4–10 | Final polish, submission |

## Resources

- [PRD](docs/PRD.md)
- [Market Opportunity](docs/OPPORTUNITY.md)
- [ADRs](docs/adr/)
- [Dallas AI Competition](https://www.dallasai.org/)
