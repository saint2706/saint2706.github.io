## 2024-05-23 - Content Security Policy (CSP) Implementation
**Vulnerability:** Missing Content Security Policy (CSP) header.
**Learning:** The application was vulnerable to Cross-Site Scripting (XSS) attacks as it allowed loading scripts and other resources from any origin.
**Prevention:** Implemented a CSP meta tag in `index.html` to restrict content sources to a trusted allowlist (self, Google APIs, Firebase). Note: `unsafe-inline` was kept for scripts and styles to support current application architecture and external dependencies like Google Fonts, but should be removed in future iterations if possible.
