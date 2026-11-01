# ADR-004: Governance, branch protection and release model

- Status: **proposed** (settings changes are a separate user action)
- Date: 2026-11-01
- Related tasks: P01-T04

## Evidence

`main` unprotected, no rulesets (API 2026-11-01). `ci.yml` jobs: `lint`, `test` (3 OS x Node 24/26), `build`. `deploy.yml` runs via `workflow_run` after successful CI on a push to `main`, or manually via `workflow_dispatch`, with `github-pages` environment.

## Policy

1. **Branches:** one branch per phase (`phase/pNN`), a commit per verified task, PR into `main`.
2. **Ruleset on `main`:** require PR; required checks `lint`, `build` and the `test` matrix legs (use exact names from a green run); block force-push and deletion; linear history; optional zero required approvals (solo owner).
3. **Release = merge.** Any merge to `main` deploys production, so phase PRs are released only when the user authorizes production for that phase. Draft PRs stay unmerged; the live site stays on the last deployed `main` during branch work.
4. **`workflow_dispatch` risk:** it can deploy any ref selected in the UI. Mitigation: add deployment-branch protection to the `github-pages` environment (only `main`), optionally a required reviewer.
5. **Rollback:** `runbooks/rollback.md` (revert PR, never force-push), plus re-run deploy for the last good SHA.
6. **Local guard:** the pack's `.claude/hooks` block default-branch pushes and force pushes (local only, not committed per owner decision).

## Status of settings

Not applied. Steps in `runbooks/branch-protection.md` and `runbooks/release-governance.md`.

## User approval

Required for any GitHub settings change. Evidence: none yet.
