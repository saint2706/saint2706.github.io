# 01 Repository Inventory

| Item                  | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Repo                  | saint2706/saint2706.github.io (public, not archived)                                       |
| Default branch / HEAD | `main` / `95a04fb60193c74b20273b01a983de7b1f465182` (2026-10-31 18:27 +05:30)              |
| Local vs origin       | identical; fetched 2026-11-01                                                              |
| Working tree          | clean before pack merge; after: only untracked pack files, no tracked file modified        |
| Pages                 | enabled, `build_type=workflow`, https enforced, no CNAME                                   |
| Branch protection     | **none**; `/rulesets` returns `[]`                                                         |
| Runtime               | Node v26.13.0 (engines `^24.15 \|\| >=26`), pnpm 12.15.0, pnpm-only lockfile policy passes |
| Source size           | 103 files / 22.0k code lines in `src` (76 JSX, 23 JS, 2 TS, 1 CSS)                         |
| Tests                 | 32 test files, 437 tests                                                                   |

## Areas

- `src/components/{games,home,layout,pages,shared}`: 9 games, 7 pages plus NotFound, Chatbot, Pyodide runner, Terminal mode, Roast interface.
- `src/{data,services,utils,navigation}`: `resume.js` (single source of truth), `blogs.json` (12 posts from Medium/Dev.to), `ai.js` (Gemini + proxy), `security.js`, `seo.js`, `storage.js`, view-transition navigation.
- `scripts/` (15): security/CSP/SRI tests, generate-llms/sitemap (run by `prebuild`), sync-blogs, Lighthouse baseline.
- `.github/`: 5 workflows (ci, deploy, dependency-review, sync-blogs, workflow-lint), composite `setup-env`, dependabot.
- `proxy/`: Cloudflare Worker Gemini proxy (worker.js, wrangler.toml, README).
- `public/`: 404, `_headers`, llms.txt, robots, sandbox.html, sitemap, manifest, 8 project webp (231K total).
- Routes: `/ /projects /resume /blog /contact /games /playground /*`.
- Deps: 9 runtime, 22 dev. Production `pnpm audit`: no known vulnerabilities.

## Pack merge

Added 20 root docs, `.claude/` (3 agents, 6 skills, 2 hooks, settings) and `project-system/`. No path collisions; nothing overwritten. The repo `.gitignore` ignores `.claude/`, so hooks and skills will not be committed unless that rule changes (decision needed).
