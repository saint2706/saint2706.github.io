# Session handoff: 2026-11-01

- Current phase: P02 (design research and concepts)
- Authorized task IDs: P02-T01 (complete) and P02-T02 (in review). P02-T03 is NOT authorized. P03-P07 are pending approval. Source of truth: `project-system/state/approvals.json` and `project.json`.
- Production release authorized?: No. Merging to `main` deploys the live site, so only docs, research and `design/` were merged; no change to `src/`, `public/`, workflows or manifests apart from `eslint.config.js` and `README.md` and the phone-number removal in `src/data/resume.js` (P01 PR #874, approved).
- Phase branch: work was done on short-lived `phase/p02-*` branches via PRs. Last open PR: #882 (reading-path owner decisions plus this handoff).
- Default branch and base SHA: `main`; last confirmed `5026ada` (PR #881). #882 was open and re-running checks when this handoff was written; verify with `gh pr view 882`.
- Worktree status: clean except the untracked folder `art and books/` in the repo root (13 images and one ZIP, 15 MB). It is excluded **locally only** via `.git/info/exclude` and must never be committed (contains images the owner does not want published and a deck with in-copyright works). Local stale branches `chore/record-protection`, `phase/p02-*` are merged; the `protect-git` hook blocks `git branch -D`, so remove them by hand if wanted.

## Completed

- Task IDs: P00-T01..T04 (audit), P01-T01..T04 (ADRs 001-004), P02-T01 (research), P02-T02 (concepts; status review, medium switched to code-first by ADR-005).
- Commits and PRs (all squash-merged unless noted): #874 pack merge, hygiene and ADRs; #875 ruleset record and validator hardening; #876 P02-T01; #877 P02-T02 record; #878 feedback round 1; #879 code-first A1 concept and ADR-005; #880 books reading path; #881 verified reading path; #882 open (see above).
- Repo governance applied through `gh api` (owner-authorized): ruleset `protect-main` (id 26293963: PR required, squash only, linear history, no force-push or deletion, threads resolved, 9 required checks, no bypass), auto-merge on, delete-branch-on-merge on, `github-pages` environment limited to `main`.

## Files changed

- `project-system/**`: audit reports (00-08), ADR-001..005, research (design reference library, directions, Figma record, draft copy register, content inventory, books reading path and `books-verified.json`), state files, validator hardening, evidence records, handoffs.
- `design/concepts/a1-specimen-field/index.html` and `design/README.md`: accessible A1 concept (greyscale placeholders, system fonts, no external requests).
- `eslint.config.js` (Node globals for `.mjs`), `README.md` (drift fixes), `CLAUDE.md`, `DESIGN.md`, root pack docs.
- `.claude/` (pack hooks and skills) is gitignored by the repo on purpose (owner decision); it exists locally only.

## Decisions and approvals

- ADR-001: Astro + React islands (owner chose it over the prerender recommendation; no migration task authorized yet). ADR-002: local JSON + Markdown, schema-checked. ADR-003: restructure to `/about`, `/projects`, `/writing`, `/contact`, `/lab` with redirects, phased. ADR-004: ruleset, environment restriction (no approval gate on deploys). ADR-005: design concepts are code-first under `design/concepts/` (Figma free-tier MCP limit is tiny); the Figma file stays as history.
- Owner decisions: lead with A1 Specimen Field; playful and curious mood with a **dry, understated** copy voice; mobile must not feel cramped; contact is email, GitHub, LinkedIn and Instagram `@saintkaprivate` (the handle sounds private: confirm); phone stays private; flagships are Coding-For-MBA, Programming-Challenges-5 (archived repo, not on the current site) and AI Attendance Management System (face data needs a privacy note); Music space left out; Art and Books spaces supplied; the three in-copyright paintings (Magritte x2, Dali) are left out and only verified public-domain works may be used; the reading lists are finished, including optional lists; commercial-only titles stay; Paine entry means the Deism essay; the Price work is removed.
- Standing permissions (owner): configure GitHub via `gh api` where asked; install and upgrade tooling when needed (saved in memory); every PR must have Codex review threads resolved before merge.
- Pending questions for the owner: confirm the Instagram handle should be public; whether the stage scheme of the reading list comes from a published curriculum (credit it); whether to open P02-T03; feedback on the A1 v2 concept (desktop, mobile, index dialog).

## Validation/evidence

- Repo checks (Windows, Node 26.13, pnpm 12.15): 437 tests pass, repo code lint-clean, `pnpm audit --prod` clean, state validator passes. `format:check` fails locally only because working-tree files are CRLF (CI is LF and passes).
- A1 concept checked in Chromium, Firefox and WebKit at 1440, 834 and 390 px: no horizontal overflow, targets at least 44 px, no console errors, no external requests, every link has a destination, reduced motion starts with motion off, the index dialog closes on Escape and on navigation, the skip link moves focus (WebKit check inconclusive because Safari skips links when tabbing). No manual screen-reader test yet.
- Figma file (history): https://www.figma.com/design/2BowEXr9mkzKHfS46IC7zM . Starter plan limits (3 pages, tiny MCP quota) were reached; pending edits there (dry-voice tag text, a v2 tablet frame) were not applied and may be dropped under ADR-005.
- Reading-path verification: six research agents plus a link check; 123 of 124 titles kept, 35 corrected, 5 links not machine-verifiable (listed in `books-reading-path.md`). Evidence: `project-system/research/books-verified.json`.

## Blockers/risks

- R1 Codex review loop: Codex comments on every PR and blocks merge until threads are resolved. Most findings so far concerned the state validator and stale docs. Check threads after every push; fix the root cause, not just the wording.
- R2 Production: any merge to `main` deploys the live site. Keep P02 changes to docs and `design/` until release is authorized.
- R3 Rights: the owner's "Ten Paintings" ZIP includes three in-copyright works; do not host them. The other seven credits are unverified (the deck's sources slide was not read). Treat the ZIP as untrusted: extract into a fresh directory, never run `serve.py`.
- R4 Content truth: all copy is DRAFT; no personal voice or facts may be invented. Claims are tracked in `project-system/research/draft-copy-register.md`.
- R5 Tool quirks: the pack hook blocks `git push` while on `main`, `git branch -D` and `git checkout -- .`; large heredocs with quotes broke the shell, so write files with the Write tool; chain checks with `&&`, not `;`, or a failed validation will not stop a commit or a reply; a squash-merge can leave a follow-up PR conflicted (merge `main` with `-X ours` when the branch holds the newer content).

## Exact next steps

1. Run `gh pr view 882`: if open, wait for checks and resolve any Codex threads; if merged, pull `main`.
2. Ask the owner for feedback on the A1 v2 concept and the open questions above before building more.
3. Continue the code-first A1 concept: Professional, Personal and Lab space pages and the tablet layout under `design/concepts/`, still greyscale and DRAFT copy, then re-run the cross-browser checks (Playwright browsers are installed locally).
4. Verify the seven public-domain painting credits (extract the ZIP in a new directory, read the sources slide, confirm each licence) and record them in the asset inventory.
5. When the owner approves a concept, ask for explicit authorization of P02-T03 (design system) with task IDs and the release decision, per `prompts/phase-authorization.md`.

## Do not

- Do not release or deploy; do not touch `src/`, `public/` or workflows without an authorized task.
- Do not commit `art and books/`, host the three in-copyright paintings, or publish the reading list before the owner approves.
- Do not invent personal voice, facts, metrics or a palette; no paid services; no portrait or likeness.
- Do not force-push, delete branches with `-D`, or run blanket `git checkout -- .`.
