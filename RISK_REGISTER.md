# Initial risk register

| ID    | Risk                                   | Evidence/reason                                      | Severity            | Treatment                                    |
| ----- | -------------------------------------- | ---------------------------------------------------- | ------------------- | -------------------------------------------- |
| R-001 | Default branch unprotected             | Captured GitHub API: protected=false                 | Critical governance | Refresh; enable/verify ruleset before merge  |
| R-002 | Default-branch push deploys production | Deploy workflow after CI push to main/master         | High                | Phase release approval and deploy protection |
| R-003 | Architecture unresolved                | Client-only SPA vs progressive enhancement ambitions | High                | Compare and obtain P01 approval              |
| R-004 | No-JS experience absent                | index.html says JS required                          | High                | Audit and architectural plan                 |
| R-005 | `_headers` may be ignored by Pages     | HTML comment explicitly says so                      | High                | Validate actual platform behavior            |
| R-006 | README drift                           | Missing .jules, wrong cd path, Node mismatch         | Medium              | Reconcile against live evidence              |
| R-007 | Gemini key instructions conflict       | README vs Worker/proxy docs                          | High                | Verify bundle and update with approval       |
| R-008 | Personal claims can be stale           | Resume/profile facts need current approval           | High                | Claim register and source review             |
| R-009 | Unknown asset licensing                | Existing/external media                              | High                | Asset provenance; reject unclear rights      |
| R-010 | Figma plugin permissions/cost          | Remote write/auth capability                         | Medium              | Authenticated review and explicit approval   |
| R-011 | Visual snapshot flakiness              | Environment-dependent rendering                      | Medium              | Pin browser/OS and tolerance                 |
| R-012 | SPA deep-link behavior                 | BrowserRouter on GH Pages                            | High                | Verify 404/routing behavior                  |
| R-013 | Dependency/security drift              | Fast-moving frontend stack                           | Medium              | Re-audit before updates                      |
| R-014 | Immersive performance                  | WebGL/animation/embed cost                           | Medium              | Budgets and accessible alternatives          |
| R-015 | Scope creep                            | Evolving personal universe                           | High                | Task limits and phase approval               |
| R-016 | Content/history loss                   | Clean rebuild could remove value                     | Critical            | Preserve history and backups                 |
| R-017 | Personal content leakage               | Public selectively curated area                      | High                | Approval workflow and prepublish review      |
| R-018 | Paid integrations                      | Figma/hosting/service plans may change               | Medium              | Verify current terms; seek approval          |
