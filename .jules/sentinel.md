## 2024-05-23 - Content Security Policy (CSP) Implementation
**Vulnerability:** Missing Content Security Policy (CSP) header.
**Learning:** The application was vulnerable to Cross-Site Scripting (XSS) attacks as it allowed loading scripts and other resources from any origin.
**Prevention:** Implemented a CSP meta tag in `index.html` to restrict content sources to a trusted allowlist (self, Google APIs, Firebase). Note: `unsafe-inline` was kept for scripts and styles to support current application architecture and external dependencies like Google Fonts, but should be removed in future iterations if possible.

## 2025-02-17 - Hardcoded Secrets in Example Files
**Vulnerability:** Hardcoded Firebase API Key in `.env.example`.
**Learning:** Even "example" files can be a source of leaked credentials if developers copy-paste real keys into them and commit the file. This exposes the key to anyone with access to the repository.
**Prevention:** Replaced the hardcoded key with a placeholder string. Implemented a practice to always use placeholders in example configuration files and verify no real secrets are committed, even in "safe" or "example" contexts.
