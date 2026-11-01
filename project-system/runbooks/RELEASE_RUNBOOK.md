# Release and rollback runbook

## Pre-release

- Verify explicit phase/task authorization includes production release.
- Confirm P0/P1 findings resolved and mandatory gates pass.
- Verify default branch protected and required checks match current CI.
- Review PR scope and current Pages workflow.
- Record deployed commit and known-good rollback target.
- Verify claims, rights, SEO routes and redirect map.
- Scan repo/build artifacts/logs for secrets.

## Release

- Merge only if authorized.
- Observe GitHub Pages workflow; verify intended commit and deployment URL.
- Smoke-test critical routes, deep links, 404, metadata, assets, contact and interactions.
- Record verification timestamp, screenshots and workflow evidence.
- Sync project state.

## Never

- `workflow_dispatch` as preview.
- Deploy an unauthorized branch.
- Merge implementation-only phase without release approval.
- Delete known-good commit/deployment.
- Claim success without live verification.

## Rollback triggers

Site unavailable, broken core journeys, P0/P1 security/privacy/factual issue, critical accessibility regression, or serious runtime/build failure.

## Rollback

Stop releases; record failed commit/run; identify last known-good commit; use a revert/restoration PR (no history rewrite); run CI and authorized Pages deploy; smoke-test live site; update incident/evidence records; add regression prevention. Do not rotate/revoke credentials unless explicitly authorized.
