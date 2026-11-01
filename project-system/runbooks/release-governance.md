# Release governance

1. Work on `phase/pNN`; open a PR; wait for all required checks green.
2. Merge only when the user has authorized production release for that phase (see `state/approvals.json`).
3. After merge, the Deploy workflow runs automatically; confirm the run, then check the live routes, assets and metadata.
4. `workflow_dispatch` is a second deploy path: restrict the `github-pages` environment to `main` (Settings > Environments > github-pages > Deployment branches).
5. Failure: follow `rollback.md` (revert PR), never force-push.
6. Record the release in `project-system/handoffs/` and update `repo-baseline.json`.
