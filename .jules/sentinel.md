## 2024-05-23 - Content Security Policy (CSP) Implementation
**Vulnerability:** Missing Content Security Policy (CSP) header.
**Learning:** The application was vulnerable to Cross-Site Scripting (XSS) attacks as it allowed loading scripts and other resources from any origin.
**Prevention:** Implemented a CSP meta tag in `index.html` to restrict content sources to a trusted allowlist (self, Google APIs, Firebase). Note: `unsafe-inline` was kept for scripts and styles to support current application architecture and external dependencies like Google Fonts, but should be removed in future iterations if possible.

## 2025-02-17 - Hardcoded Secrets in Example Files
**Vulnerability:** Hardcoded Firebase API Key in `.env.example`.
**Learning:** Even "example" files can be a source of leaked credentials if developers copy-paste real keys into them and commit the file. This exposes the key to anyone with access to the repository.
**Prevention:** Replaced the hardcoded key with a placeholder string. Implemented a practice to always use placeholders in example configuration files and verify no real secrets are committed, even in "safe" or "example" contexts.

## 2025-02-18 - CSP Hardening and XSS Prevention
**Vulnerability:** Weak CSP (`unsafe-inline` in `script-src`) and missing anti-clickjacking headers.
**Learning:** Keeping `unsafe-inline` for convenience significantly weakens CSP, as it allows any injected script to run. Additionally, missing `frame-ancestors` allows the site to be embedded in iframes, enabling clickjacking attacks.
**Prevention:**
1. Extracted the inline SPA redirect script to a separate file (`public/spa-redirect.js`) to allow removing `'unsafe-inline'` from `script-src`.
2. Added `frame-ancestors 'none'` to prevent clickjacking.
3. Added `object-src 'none'` to block plugin-based attacks.
4. Added `base-uri 'self'` to prevent base tag hijacking.
