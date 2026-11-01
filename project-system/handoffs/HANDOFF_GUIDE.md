# Handoff guide

Start Claude Code in the repository root. The project is self-contained; no global settings are required.

## First session

Run `project-system/prompts/00-first-run-audit.md` or `/audit-repository`. It refreshes live repo state, inspects source/config/workflows/content/assets, runs safe checks and creates a comprehensive evidence-backed audit dossier. No website implementation, dependency installation, production config change or deployment is authorized.

## Later sessions

Check phase approval, exact task IDs, dependencies, worktree, current ADRs and task files. Execute only that task scope. Commit after each independently verified task on the phase branch. Update JSON and Markdown together.

## Handoff

Create dated file under `project-system/handoffs/` using `project-system/templates/session-handoff.md`. Include current phase/task, authorization, branch/SHA, completed work, changed files, decisions, checks/exit codes, evidence, blockers and exact next action.

## Example commands

- `Run P00 audit only.` (historical: completed 2026-11-01; check `project-system/state/approvals.json` for what is authorized now, currently P02-T01 and P02-T02 only.)
- `Review audit findings and recommend P01; do not implement.`
- `Approve P01 and execute P01-T01 only.`
- `Execute P02-T01 through P02-T03; stop at the phase gate.`
- `Verify P03 and report blockers without starting P04.`
- `Prepare a handoff; make no further changes.`
