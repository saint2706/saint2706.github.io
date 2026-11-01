# Installation — repository root

1. Clone the current repo and inspect state:
   ```bash
   git clone https://github.com/saint2706/saint2706.github.io.git
   cd saint2706.github.io
   git status --short
   git branch --show-current
   git remote -v
   ```
2. Extract the ZIP to a temporary folder and inspect paths.
3. Copy only new pack files into repository root. Compare every destination path first.
4. If a file has appeared since pack creation or conflicts, stop and intelligently merge; never silently overwrite.
5. Run:
   ```bash
   node project-system/scripts/validate-pack.mjs
   node project-system/scripts/validate-project-state.mjs
   git status --short
   ```
6. Start Claude Code at the repo root.

## Overwrite policy

This ZIP intentionally excludes root `README.md`, `package.json`, lockfiles, `.gitignore`, `.github/workflows/*`, `src/**`, `public/**`, `proxy/**` and `.env*`. It uses `PROJECT_PACK_README.md` to avoid a README collision. The captured repo did not contain `CLAUDE.md`, `AGENTS.md` or `.claude/`; recheck before copying. If `.claude/` now exists, merge settings and skills file-by-file.

Never overwrite user changes, local secrets, existing Git configuration or uncommitted work. Preserve existing Git history/remotes. Do not initialize a new repository over the clone. Do not force-push.

The default branch was unprotected at the P00 snapshot (2026-10-31); protection was configured on 2026-11-01 (ruleset `protect-main`). Re-verify before merging. Before merging implementation PRs, configure and verify branch protection/rulesets and required checks. The pack cannot change GitHub account/repository settings.

**Installing the pack does not authorize implementation.** P00 audit only was pre-authorized at install (since completed; see `state/approvals.json` for current authorization); P01 onward requires explicit phase approval.
