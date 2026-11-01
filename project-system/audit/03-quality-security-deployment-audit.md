# 03 Quality, Security and Deployment Audit

## Checks run (2026-11-01, local Windows, Node 26.13.0, pnpm 12.15.0)

| Check                                       | Result                                                                                                                                                                                                                                                                                                              | Exit |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `vitest run`                                | 437/437 passed (78.7 s)                                                                                                                                                                                                                                                                                             | 0    |
| `check:lucide-imports`                      | 32 files verified                                                                                                                                                                                                                                                                                                   | 0    |
| `check:package-manager-policy`              | pass                                                                                                                                                                                                                                                                                                                | 0    |
| `test:security`, `test:csp`, `test:no-aura` | pass                                                                                                                                                                                                                                                                                                                | 0    |
| `pnpm audit --prod`                         | no known vulnerabilities                                                                                                                                                                                                                                                                                            | 0    |
| `eslint . --max-warnings 0 --no-cache`      | **32 errors, all in pack files** (`.claude/hooks` 18, `project-system/scripts` 14); 0 in repo code                                                                                                                                                                                                                  | 1    |
| `prettier --check`                          | fails on 65 files: about 55 pack files plus repo files (`index.html`, `package.json`, `README.md`, `proxy/worker.js`, `public/sandbox.html`, `scripts/*`, 2 games). Those repo files are CRLF in the working tree (`core.autocrlf=true`, index is LF), so this is a local Windows artifact; not verified against CI | 1    |
| `validate-pack.mjs`                         | FAILED: pre-existing repo `README.md` is flagged and links to missing `.jules/sentinel.md` (script is meant to run on the pack, not the merged repo)                                                                                                                                                                | 1    |
| `validate-project-state.mjs`                | PASSED (28 tasks, 163 decisions)                                                                                                                                                                                                                                                                                    | 0    |

**Skipped:** `pnpm build` (prebuild rewrites `public/llms.txt` and `sitemap.xml`, out of P00 scope); `verify:sri`, `audit-deps`, `scan-secrets` (not needed for baseline; not run); Lighthouse (browser install and file writes); live-site probing.

## Security and privacy

- Good: SHA-pinned actions, `persist-credentials: false`, least-privilege permissions, deploy gated to same-repo push events, dependency-review, workflow-lint, secrets scan script.
- S1: no branch protection or required checks (below).
- S2: phone and email were in the public bundle (`resume.js`). Owner decision 2026-11-01: remove phone, keep email.
- S3: Worker proxy URL is hard-coded in CSP; proxy CORS, rate limiting and abuse controls were not reviewed.
- S4: revoking the old Gemini key and deleting the `GEMINI_API_KEY` secret were pending per prior session notes; **user confirmation required**.

## Deployment

CI (lint, test matrix on 3 OS x Node 24/26, build) runs on PR and push. Deploy runs after CI success on a push to `main`, or manually. **Merging to `main` deploys production**, so a phase PR merge is a release.

## Branch protection steps (user action, not performed)

1. Settings > Rules > Rulesets > New branch ruleset targeting `main`.
2. Require pull request (0-1 approvals for a solo owner), block force pushes and deletion, require linear history.
3. Require status checks: `lint`, `test` legs, `build` from CI, plus workflow-lint.
4. Keep admin bypass only for emergency fixes.
5. Re-run `repo-snapshot.mjs` to confirm `protected=true`.
