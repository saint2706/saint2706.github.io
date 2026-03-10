# Sentinel Security Log 🛡️

## 2024-05-22: Dependency Update - Minimatch

### Vulnerability

- **NPM Vulnerabilities**:
  - `rollup` (<4.59.0) was identified as vulnerable (Arbitrary File Write via Path Traversal).
  - `minimatch` (<10.2.1) and `ajv` (<6.14.0) were identified as vulnerable (ReDoS).
  - **Mitigation**: Applied `pnpm.overrides` in `package.json`:
    - `rollup`: `>=4.59.0`
    - `minimatch`: `>=10.2.3`
    - `ajv`: `^6.14.0` (Pinned to v6 branch to maintain compatibility with ESLint while applying security patch).
  - **Status**: `pnpm audit` reports 0 vulnerabilities.

- **Package**: `minimatch`
- **Severity**: High
- **Type**: ReDoS (Regular Expression Denial of Service)
- **Advisories**:
  - GHSA-7r86-cg39-jmmj
  - GHSA-23c5-xmqv-rm74

### Fix

- Updated `minimatch` in `pnpm.overrides` to `>=10.2.3`.
- Verified with `pnpm audit` and `npm run test:security-full`.

### Verification

- `npm run test:security-full`: Passed
- `pnpm lint`: Passed
- `pnpm test:run`: Passed

### Security Improvement: Pseudo-Random Number Generator

- **Issue**: `src/components/shared/ChatInterface.jsx` was using `Math.random()` to generate chat message identifiers if `crypto.randomUUID()` was unavailable. `Math.random()` is not cryptographically secure and can be predictable.
- **Fix**: Updated `generateMessageId` to prioritize `crypto.getRandomValues()` as a fallback over `Math.random()`, ensuring cryptographically secure pseudo-randomness for message identifiers across a broader range of browsers, maintaining defense-in-depth principles.

### Security Improvement: HTTP Security Headers

- **Issue**: Missing explicit security headers for static site deployments (e.g., Cloudflare Pages, Netlify, GitHub Pages). While index.html contains a strong CSP, other headers like HSTS and X-Frame-Options were not enforced via HTTP response headers.
- **Fix**: Added a \`public/\_headers\` file containing \`X-Frame-Options: DENY\`, \`X-Content-Type-Options: nosniff\`, \`Referrer-Policy: strict-origin-when-cross-origin\`, and \`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\`. This hardens the application against Clickjacking, MIME sniffing, and ensures secure transport.

### Security Improvement: Fallback Identifier Generation (Math.random)

- **Issue**: The fallback identifier generation for chat messages in `src/components/shared/ChatInterface.jsx` was using `Math.random()`, which can be predictable and is an insecure pseudo-randomness mechanism.
- **Fix**: Replaced the `Math.random()` fallback mechanism inside `generateMessageId` with a monotonic counter. This guarantees unique IDs during the session while adhering to secure coding principles by avoiding insecure pseudo-random sources for generating unique identifiers.

### Security Improvement: Safe Use of dangerouslySetInnerHTML

- **Issue**: The `src/components/shared/SEOHead.jsx` component uses `dangerouslySetInnerHTML` to inject structured JSON-LD schemas into the head, which could be an XSS vector if improperly formatted or sanitized.
- **Fix**: Documented the current robust mitigation within the codebase by adding explicit security context comments explaining that `safeJSONStringify` (from `src/utils/security.js`) prevents XSS attacks by safely escaping dangerous HTML characters (`<`, `>`, `&`, `'`, and line separators) prior to injection.

### Security Improvement: Enforcement of rel="noopener noreferrer"

- **Issue**: Usage of `target="_blank"` on external links without `rel="noopener noreferrer"` can expose the site to reverse tabnabbing attacks, where the newly opened page gains access to the `window.opener` object.
- **Fix**: Implemented the `react/jsx-no-target-blank` rule as an `error` in `eslint.config.js` to strictly enforce the presence of `rel="noopener noreferrer"` for any `target="_blank"` usages across the entire repository. This acts as a preventative control for current and future developments.
