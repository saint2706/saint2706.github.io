# GitHub Pages deployment

## Captured workflow behavior

- `ci.yml` runs for pull requests and pushes to main/master.
- `deploy.yml` listens for CI completion on main/master and `workflow_dispatch`.
- Deploy job runs for successful CI after a same-repository push event, or manual dispatch.
- It builds, uploads a Pages artifact and deploys it.

Re-read these workflow files before every release.

## Implications

- PRs should validate without deploying production.
- Merge/push to default can deploy production.
- `workflow_dispatch` is production-capable, not a preview.
- GitHub Pages remains host; no extra preview service unless justified and approved.

## Safeguards

- Explicit phase release approval before merge.
- Default branch protection and current required checks.
- Verify Pages environment deployment protection.
- Verify deployed commit and live site.
- Preserve known-good commit/deployment and rollback route.
