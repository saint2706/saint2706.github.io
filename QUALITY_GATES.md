# Quality gates

Apply relevant gates to each task/phase; P07 runs the complete release matrix.

1. **Authorization/evidence:** exact approval; dependencies complete; clean/understood worktree; no hidden consequential assumptions.
2. **Build/engineering:** frozen-lockfile install, lint, format, tests and build pass; no unreviewed dependency/generated churn; pnpm-only lockfile policy respected.
3. **Functionality:** direct and in-app route navigation, loading/error/empty/404 states, keyboard/touch controls, correct state behavior and documented legacy URL disposition.
4. **Accessibility:** WCAG 2.2 AA target; axe + Playwright where configured plus manual keyboard, screen-reader, focus, zoom/reflow, contrast, reduced-motion and accessible-equivalent checks. Automated scan alone is insufficient.
5. **Responsive/visual:** mobile/tablet/desktop, Figma fidelity, consistent visual snapshots; investigate differences before updating golden images; structured creative review.
6. **Performance:** measure representative routes; set experience-specific budgets; strict ordinary-page budgets; immersive exceptions require justification.
7. **Security/privacy:** dependency audit, secret scanning, no client API secrets, actual-host CSP/header validation, least-privilege/pinned Actions, input/sandbox/Worker review, no unapproved tracking. Critical/high unmitigated issues block.
8. **Content/SEO:** every claim sourced or approved; asset rights recorded; no filler/thin section; metadata, canonical URLs, structured data, sitemap, robots, 404 and redirects validate.
9. **Git/release:** phase branch only, task commit evidence, PR gates, default branch protected, explicit release authorization, previous deployment and rollback ready.

Severity: P0 critical (stop); P1 high (block release); P2 medium (document and plan); P3 low (backlog).

Evidence records command/action, environment, timestamp, exit status, artifact path/URL, files changed, reviewer notes and limitations. Redact secrets.
