# ADR-003: Information architecture and URL model

- Status: **proposed**
- Date: 2026-11-01
- Related tasks: P01-T03 (depends on ADR-001, ADR-002)

## Context

Seven routes plus catch-all. Pack intent: core navigation, optional discovery, a deliberate professional/personal gateway, and a separate laboratory. GitHub Pages serves unknown paths through `404.html` (status 404); the repo's 404 script redirects deep links into the SPA.

## Proposal (route inventory in `research/P01-route-inventory.md`)

- Core: `/`, `/projects`, `/resume` (rename candidate `/about`), `/writing` (from `/blog`), `/contact`.
- Lab: `/lab` containing games and playground (`/games`, `/playground` become redirects).
- Conventions: lowercase, trailing slash, one `index.html` per route after ADR-001 prerender, 404 page only for unknown paths.
- Redirects on Pages: static meta-refresh pages at legacy paths (no server redirects available).
- No empty categories: add `/interests` only when content exists.

## Alternatives

Keep current flat routes (no churn, no gateway) vs the proposal (clearer spaces, redirect maintenance). Recommend the proposal, phased after P02 content exists.

## User approval

Required: yes (affects legacy URLs and SEO). Evidence: none yet.
