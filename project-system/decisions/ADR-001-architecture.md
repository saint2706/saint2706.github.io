# ADR-001: Application and rendering architecture

- Status: **confirmed** 2026-11-01 (user chose Astro + React islands, overriding the prerender recommendation; runner-up and 2-4 week estimate stand; migration needs its own approved task, none authorized yet)
- Date: 2026-11-01
- Related tasks: P01-T01 (depends on P00-T04)
- Evidence: audit reports 02 and 03; docs: Astro (deploy to GitHub Pages, client islands, `client:visible`), Vite SSR guide (client build + `--ssr` server entry build, `renderToString`).

## Context

React 19 + Vite 8 SPA, 22k source lines, 437 tests, nine games, Pyodide runner, sandboxed playground, Gemini chat. Hosting is GitHub Pages (username site, base `/`). Gaps: empty HTML shell for crawlers/no-JS, SPA deep links served through `404.html` (HTTP 404), no e2e tests.

## Priority drivers

Progressive enhancement and SEO; keep working games and tests; low maintenance for a solo owner; Pages compatibility; minimal regression risk.

## Alternatives

| Criterion               | A. React+Vite + build-time prerender                                         | B. Astro + React islands                                                                                                   | C. Status quo + meta only      |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| No-JS / crawler HTML    | Yes, per route                                                               | Yes, per route (zero JS by default)                                                                                        | No                             |
| Deep links on Pages     | Emit `route/index.html` per route; real 200s                                 | Same                                                                                                                       | 404.html hack stays            |
| Reuse of existing code  | ~100% (add `entry-server`, prerender script)                                 | Pages/layout rewritten in `.astro`; games/Pyodide kept as islands; React Router, transitions and ThemeProvider need rework | 100%                           |
| Migration effort (est.) | 2-4 days                                                                     | 2-4 weeks                                                                                                                  | 0                              |
| Test impact             | Existing vitest kept; add 1 e2e smoke                                        | Component tests reusable; routing/layout tests rewritten                                                                   | none                           |
| Risk                    | Hydration mismatches in games/animation (mitigate with client-only wrappers) | Highest: scope and regression                                                                                              | SEO/accessibility gap persists |
| Maintenance             | Custom ~100-line script on Vite SSR API                                      | Framework upgrades, content collections built in                                                                           | lowest                         |
| Licensing               | MIT                                                                          | MIT                                                                                                                        | n/a                            |

Estimates are judgment from file counts and code structure; no prototype was built.

## Recommendation

**A (prerender on the existing stack)**; runner-up **B** if the content model (ADR-002) grows to many writing/collection pages where Astro content collections pay off. Revisit B after P02 content volume is known. Do not migrate before approval.

## User approval

- Required: yes (consequential)
- Approval evidence: user answers 2026-11-01
- Date: n/a

## Consequences

Adds a server entry and a post-build prerender step; `404.html` retained for unknown routes only. Prebuild scripts (`generate:geo`) stay.
