# P03 evidence (2026-11-05)

Branch `phase/p03-foundations`. P03-T01 and P03-T02 are in commit `068ccd3`. P03-T03 is in the commit after it.

## Builds and tests (local, Windows, Node 26, pnpm 12.15.0)

| Check                                     | Result                                                                                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`          | ok, lockfile passes supply-chain policy                                                                                                                                                                                  |
| `pnpm run lint` (root)                    | no issues; `site/` is ignored                                                                                                                                                                                            |
| `pnpm exec vitest run` (root)             | 437 passed, 32 files; `site/` is excluded                                                                                                                                                                                |
| `pnpm run build` (root, the deploy build) | old app only                                                                                                                                                                                                             |
| `pnpm run test:security-full` (root)      | all pass, no high or critical advisories                                                                                                                                                                                 |
| `actionlint .github/workflows/ci.yml`     | clean                                                                                                                                                                                                                    |
| `site`: `astro check`                     | 0 errors, 24 files                                                                                                                                                                                                       |
| `site`: `pnpm run build`                  | static pages, 4 redirects, 15 pages indexed by Pagefind                                                                                                                                                                  |
| `site`: `pnpm test`                       | 11 passed (content integrity, metadata, sitemap, redirects, no third-party assets, no cookies, analytics or secrets)                                                                                                     |
| `site`: `pnpm run test:e2e`               | 38 passed on desktop Chrome and Pixel 7: axe WCAG 2.2 AA, no horizontal overflow, no console or CSP errors, skip link, redirects, search results and empty state, detail markers, no-JS menu, every painting image loads |

## Deploy output is unchanged

`origin/main` was built in a separate worktree and compared with this branch's root `./dist`. Both have 50 files. 44 are byte-identical. The other 6 (`index.html`, `sandbox.html`, `robots.txt`, `_headers`, `site.webmanifest`, `.well-known/security.txt`) are identical once line endings are normalised. They differ only because the two Windows checkouts store CRLF and LF differently; CI checks out with LF on Linux. `deploy.yml` still builds the root and uploads `./dist`, and `site/` is not part of that build.

## Privacy and security

- No cookies, analytics or third-party requests: all fonts, images and scripts are self-hosted (checked in `site/scripts/dist.test.mjs`).
- CSP is a `<meta>` tag with hashes for inline code; GitHub Pages cannot send headers, so no `_headers` claim is made for `site/`. `'wasm-unsafe-eval'` is there only for Pagefind.
- Blog cover images (Medium tracking pixels) are never rendered, and `?source=rss` parameters are stripped from links.
- No API keys or environment values are read by `site/`.
- JSON-LD has `<` escaped so content cannot close the script block.

## Accessibility notes

- axe runs with reduced motion, because the entrance animation fades text in and axe would otherwise sample it mid-fade. With motion on, the final state has the same colours.
- Detail markers on painting pages are a visual aid (SVG, `aria-hidden`); the same details are listed as numbered text with crops below the image.

## Screens

`project-system/evidence/p03/screens/`: home, work, about, personal, lab, search, the Icarus page with markers on, and the Draupadi page, each on desktop and mobile.
