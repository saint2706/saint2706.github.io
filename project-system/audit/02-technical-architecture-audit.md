# 02 Technical Architecture Audit

**Shape:** client-rendered React 19 SPA, `BrowserRouter`, all pages `React.lazy` with Suspense, Framer Motion page transitions, Tailwind v4 with one 51 KB `index.css`. Vite `base` is `/` (correct for a user site on Pages).

## Strengths

- Consistent code splitting; shared ThemeProvider, LIQUID_MOTION, useFocusTrap; view-transition navigation with feature detection.
- Security utilities centralised (`isSafeHref`, `isSafeImageSrc`, `safeJSONStringify`) and tested.
- Gemini key moved server-side via Worker proxy; client falls back to a dev key only locally.

## Findings

| #   | Finding                                                                                                        | Evidence                 | Severity |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------ | -------- |
| A1  | SPA deep links rely on `public/404.html`, so crawlers see HTTP 404 for non-root routes                         | `public/404.html`, Pages | Med      |
| A2  | No prerender; first paint is an empty root plus meta fallback                                                  | `index.html`             | Med      |
| A3  | Content lives in JS (`resume.js`); projects have no stable slugs                                               | `src/data/resume.js`     | Low      |
| A4  | `playwright` is a dependency but `@playwright/test` is not; no e2e tests, only jsdom                           | `package.json`           | Med      |
| A5  | CSP is a `<meta>` tag; `frame-ancestors` and HSTS unsupported on Pages                                         | `index.html`, `_headers` | Med      |
| A6  | CSP allows `*.firebaseio.com`/`firebase.com`, but no Firebase code exists in `src`                             | grep                     | Low      |
| A7  | `index.html` icons (`/vite.svg`, favicon-16/32, apple-touch-icon) are absent from `public/` (verify in `dist`) | `ls public`              | Low      |
| A8  | `blogs.json` `coverImage` for Medium posts is a tracking pixel (`/_/stat?event=...`)                           | `blogs.json`             | Low      |
| A9  | `run-lighthouse-baseline.mjs` writes `docs/audits/`, which does not exist                                      | script                   | Low      |

## Architecture options (recommended, not finalized)

1. **Keep the SPA and add build-time prerender** for the 6 routes. Smallest change; fixes A1/A2. _Recommended._
2. Migrate to Astro/Next static export with React islands. Best SEO, high rewrite cost; games and Pyodide need islands.
3. Status quo plus sitemap/meta only. Cheapest; leaves the no-JS gap.

**Content model options:** (a) keep `resume.js`; (b) split into `content/*.json|md` validated by schema with provenance fields (recommended, matches the pack schemas); (c) headless CMS (overkill).
