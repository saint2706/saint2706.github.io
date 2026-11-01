# Security and privacy policy

- Minimize external services and data collection.
- No visitor analytics, tracking cookies, profiling or hidden pixels.
- Never embed API keys in browser variables; secrets remain server-side.
- Never put secrets in Git, logs, prompts, evidence, Figma notes or screenshots.
- Prefer free tiers; paid/recurring cost requires explicit approval.

Repository/CI: protect default branch, PR-only merge, preserve history, pin Actions to verified SHAs, use least-privilege workflow permissions and OIDC where appropriate. Inspect third-party plugins/MCP/hooks/skills as executable code with user privileges.

Application: validate untrusted inputs, sanitize rendered content and URLs, sandbox embedded execution, validate postMessage origin, rate-limit Worker endpoints and inspect third-party network transfers. Treat AI prompts, RSS, Markdown and external content as untrusted. Verify security headers on actual Pages host; do not assume `_headers` is honored.

Incident: stop affected release, preserve redacted diagnostics, assess scope, seek approval before live credential rotation unless explicitly authorized, fix root cause, test, verify, rollback if needed and document prevention.
