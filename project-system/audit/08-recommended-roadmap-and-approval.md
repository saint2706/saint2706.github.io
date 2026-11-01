# 08 Recommended Roadmap and Approval

## Recommended order (one phase at a time; each merge to `main` deploys)

1. **P01 Governance and hygiene** (branch `phase/p01`): make pack lint/format-clean (ESLint node globals for `*.mjs`, Prettier ignore or format), decide `.claude/` tracking, fix README drift, enable ruleset (user-performed), record baseline.
2. **P02** Content model and claims: schema-validated content, remove or evidence skill scores, contact-data policy, flagship selection.
3. **P03** Design direction and tokens (DESIGN.md), asset provenance and missing icons.
4. **P04** Prerender / SEO and header strategy (architecture option 1).
5. **P05** Flagship pages and accessibility fixes.
6. **P06** Test hardening (Playwright e2e, Lighthouse budgets).
7. **P07** Release and rollback rehearsal.

Task IDs and details are in `project-system/tasks/`.

## Approval requested

P00 is complete and audit-only. **Nothing is authorized beyond P00.** To proceed, reply with an explicit instruction such as: "Approve P01 tasks P01-T01..P01-T04, including merge to main."

## Questions for the user

1. Approve P01 now? Include production release (merge to `main`) in scope?
2. Should `.claude/` be committed (remove from `.gitignore`) or stay local-only?
3. Prefer Prettier-format the pack files, or add them to `.prettierignore`?
4. Confirm Gemini key revoked and `GEMINI_API_KEY` secret deleted?
5. Keep phone/email public?
6. Architecture direction: prerendered SPA (recommended) vs Astro migration?
7. Who enables the branch ruleset: you (per report 03 steps) or authorize me via `gh` in P01?
