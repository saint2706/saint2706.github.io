# Branch protection checklist

Captured `main` was unprotected on 2026-10-31. Refresh before use.

1. Confirm current default branch.
2. In GitHub repository Settings, configure a ruleset/branch-protection rule targeting default.
3. Require PRs and all applicable current CI checks; use exact status-check names from successful runs.
4. Block force pushes and branch deletion.
5. Require review as appropriate to available independent collaborators; do not invent a required second reviewer where none exists.
6. Configure conversation resolution and admin applicability where appropriate.
7. Verify rule is active, targets default and applies as intended.
8. Record screenshot/API evidence and update `repo-baseline.json`.
9. Test with a draft PR to verify failing checks block merge.

Do not claim protection is enabled until the live setting has been verified. Claude should guide the user through account/repository settings rather than silently mutate remote administration.
