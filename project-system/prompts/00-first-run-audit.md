# First Claude Code run — P00 audit-only

You are authorized only to execute P00-T01 through P00-T04. This is read-only audit and preparation, not website implementation.

## Allowed writes

- `project-system/audit/**`
- `project-system/state/repo-baseline.json`
- `project-system/state/approvals.json`
- P00 evidence/task records under `project-system/evidence/**`

Do not modify `src/**`, `public/**`, `proxy/**`, package manifests/lockfiles, build configuration, `.github/workflows/**`, GitHub settings, Figma, production configuration or secrets.

## Required actions

1. Refresh the live default branch, HEAD, tree, worktree, branch protection/rulesets and Pages configuration where accessible.
2. Inventory source, routes, components, content, assets, dependencies, tests, scripts, CI/CD, security/privacy, accessibility, SEO and performance.
3. Inspect relevant project repositories, docs and media provenance; mark factual claims as verified, stale, unsupported or requiring user confirmation.
4. Run safe read-only checks if environment readiness permits; capture exact exit code and skipped reasons. Do not install packages or fix code.
5. Produce comprehensive findings, risks, architecture options, content/asset review, dependency map and proposed roadmap.
6. Compare credible architecture and content model alternatives; recommend but do not finalize consequential choices.
7. Highlight production deployment implications and default branch protection gap.
8. Update state and validate it.
9. Stop and ask for explicit P01 approval.

## Required reports

- `project-system/audit/00-executive-summary.md`
- `project-system/audit/01-repository-inventory.md`
- `project-system/audit/02-technical-architecture-audit.md`
- `project-system/audit/03-quality-security-deployment-audit.md`
- `project-system/audit/04-content-and-claims-audit.md`
- `project-system/audit/05-asset-provenance-inventory.csv`
- `project-system/audit/06-flagship-evidence-review.md`
- `project-system/audit/07-comprehensive-audit-dossier.md`
- `project-system/audit/08-recommended-roadmap-and-approval.md`
- refreshed `project-system/state/repo-baseline.json`
- P00 completion/evidence state

## Stop conditions

Stop if repository identity differs, user changes cannot be protected, evidence is inaccessible, credentials are required or a check would mutate production. Do not work around by widening scope.

## Final report

Explain what was inspected, checks run/skipped and exits, top risks/opportunities, architecture trade-offs, recommendation, branch-protection steps, approval questions, and confirm that no implementation was performed.
