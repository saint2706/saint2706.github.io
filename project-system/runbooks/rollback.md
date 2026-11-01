# Rollback checklist

1. Stop further release work.
2. Classify severity and determine if a rollback trigger is met.
3. Record failed commit, Pages workflow run and affected routes.
4. Identify last known-good commit/deployment.
5. Prefer revert/restoration PR; never rewrite/force-push history.
6. Run CI and authorized Pages deploy for restored state.
7. Verify live routes, assets, metadata and core journeys.
8. Update state and incident record.
9. Add regression test/preventive task.
10. Seek approval before retry if root cause changes scope/architecture.

Do not rotate/revoke live credentials unless the incident task explicitly authorizes it.
