# Architecture baseline and decisions

## Live repository snapshot (31 Oct 2026)

- Repo: `saint2706/saint2706.github.io`
- Default branch: `main`
- HEAD: `95a04fb60193c74b20273b01a983de7b1f465182`
- Tree: 182 entries; 161 blobs; 21 folders
- Pages enabled; default branch protection was disabled at capture and enabled 2026-11-01 (ruleset `protect-main`)
- React `^19.3.1`, Vite `^8.3.5`, Tailwind `^4.3.3`, React Router DOM `^7.18.5`, Framer Motion `^14.8.0`, Vitest `5.0.5`, Playwright `^1.64.1`, Lighthouse `~13.6.0`, pnpm `12.15.0`, Node `^24.15.0 || >=26.0.0`.

Observed system: React/Vite SPA; `src/App.jsx` uses BrowserRouter and lazy routes `/`, `/projects`, `/resume`, `/blog`, `/contact`, `/games`, `/playground`, catch-all. Tailwind v4, Framer Motion, Vitest/Testing Library, Playwright dependency (but no @playwright/test in captured manifest), Gemini service + optional Cloudflare Worker proxy, Pyodide runner, sandboxed JS/HTML playground, security/SEO scripts, GitHub Pages workflows and eight project thumbnails.

## Known baseline drift/risks

- GitHub API reported `protected=false`, `protection.enabled=false`.
- Deploy workflow runs after successful CI on pushes to main/master and supports workflow_dispatch. Default-branch merge may deploy production.
- `index.html` says site requires JavaScript; this conflicts with progressive-enhancement goals.
- `public/_headers` exists, but an HTML comment states GitHub Pages does not honor it. Validate host behavior rather than claiming it works.
- Root README references `.jules/` and `.jules/sentinel.md`, absent in captured tree.
- README setup tells user `cd rishabh-portfolio`, unlike actual repo directory.
- README's Node matrix text contradicts actual CI; workflow is authoritative.
- Root README describes VITE_GEMINI_API_KEY but proxy docs/deploy flow use VITE_GEMINI_PROXY_URL/GEMINI_PROXY_URL.
- No `CLAUDE.md`, `AGENTS.md` or `.claude/` at capture.

## Architecture NOT selected

P01 must compare credible alternatives:

- A. Retain/improve React+Vite: low migration cost and existing code/tests; investigate SEO/prerendering/progressive enhancement complexity.
- B. Static-first Astro (React islands candidate): static content, selective hydration, content collections; investigate migration cost, interaction model, routes/404, testing and Pages output.
- C. Another static export approach only if there is measurable advantage over A/B.

No framework is pre-approved. Compare on SEO, accessibility/progressive enhancement, content workflow, interactive experiences, GitHub Pages, performance, migration cost, maintainability, licensing and security. Recommend; obtain user approval before consequential implementation.

## Content architecture

Compare Markdown/MDX, validated local structured data, CMS and hybrid. Criteria: low maintenance, rich content, review/approval states, asset provenance, Git history, SEO, Pages support, portability and cost.

## Hosting/release

`https://saint2706.github.io/` remains primary. GitHub Pages is host. Cloudflare Worker/serverless only if justified. No custom-domain move. Old site stays live while branch implementation proceeds. Explicit release authorization is needed before a default-branch merge or manual production dispatch.
