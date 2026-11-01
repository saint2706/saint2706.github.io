# 07 Comprehensive Audit Dossier

Index and consolidated risk register for P00. Details live in reports 00-06.

## Dependency map (runtime)

react 19 + react-dom -> react-router-dom 7 (routes) -> framer-motion 14 (transitions) -> tailwindcss 4 via `@tailwindcss/postcss`; `lucide-react` (pinned 1.65.0, import-checked), `react-markdown`, `prismjs`, `@dr.pogodin/react-helmet` (SEO), `@google/generative-ai` (chat/roast, via Worker proxy). Pyodide loads from `cdn.jsdelivr.net/pyodide/` (CSP-allowed, SRI script present). Build: vite 8, vitest 5, eslint 10, prettier 3. No Firebase dependency despite CSP allowance.

## Consolidated risks

| ID  | Risk                                                             | Likelihood | Impact | Owner action                             |
| --- | ---------------------------------------------------------------- | ---------- | ------ | ---------------------------------------- |
| R1  | Unprotected `main` auto-deploys                                  | High       | High   | Enable ruleset (report 03)               |
| R2  | Pack files fail CI lint/format on merge                          | Certain    | Med    | P01: fix or ignore pack paths            |
| R3  | `.claude/` is gitignored so pack hooks/skills not versioned      | Certain    | Med    | Decide: un-ignore or keep local          |
| R4  | Unsupported skill percentages and personal contact data public   | High       | Med    | Decide claim policy                      |
| R5  | No prerender / e2e coverage                                      | Med        | Med    | P03/P05 options                          |
| R6  | Gemini abuse via public proxy URL; old key not confirmed revoked | Med        | Med    | Confirm revocation; review Worker limits |
| R7  | README/doc drift                                                 | Certain    | Low    | P01 doc fix                              |
| R8  | Missing favicons and tracking-pixel blog covers                  | Certain    | Low    | Fix when UI work approved                |

## Checks and exits

See report 03. Repo code: lint clean, 437/437 tests, audits clean. Pack files: lint and format failing (exit 1 each).

## Limitations

No production probing, no browser run, no build, no external repo inspection, no GitHub settings changes. CRLF/Prettier result is an environment artifact and unverified against CI. Branch protection and Pages data come from the GitHub API as accessed by the signed-in `gh` user.
