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

### Security Improvement: Safe URL Navigation in Projects Component

- **Issue**: The `Projects` component (`src/components/pages/Projects.jsx`) used `window.open` to navigate to project links or GitHub repositories dynamically derived from `resumeData` without prior protocol validation. If data sources were compromised or contained malicious protocols (e.g., `javascript:`), this could result in an XSS vulnerability.
- **Fix**: Added an explicit validation check utilizing the `isSafeHref` utility function from `src/utils/security.js` prior to invoking `window.open`. This ensures only safe, non-malicious protocols (like HTTP and HTTPS) can be executed, reinforcing defense-in-depth even for statically managed data. Blocked navigation attempts are now safely logged as warnings.

### Security Improvement: Dependency Update - flatted

- **Issue**: A high severity vulnerability (unbounded recursion DoS in `parse()` revive phase) was found in `flatted` < `3.4.0` via `pnpm audit`.
- **Fix**: Updated `flatted` to `3.4.1` by running `pnpm update flatted` to resolve the vulnerability. This successfully clears the `test:security-full` script warnings and ensures defense against ReDoS in the dependency.

### Validated Project Image Sources

- **Severity**: Low (Defense in Depth)
- **Vulnerability**: While project data comes from a trusted local file, dynamically rendering `src={project.image}` inside `src/components/pages/Projects.jsx` could become an XSS vector if a malicious `javascript:` URL was ever injected into the data source.
- **Fix**: Wrapped the `project.image` property check with an `isSafeImageSrc(project.image)` validation to guarantee only HTTP/HTTPS protocols are evaluated by the browser for image fetching.

### Security Improvement: Safe URL Navigation in Contact Component

- **Issue**: The `Contact` component (`src/components/pages/Contact.jsx`) used `window.location.href` to navigate to a dynamically generated `mailto:` link using `resumeData` without prior protocol validation. If data sources were compromised or contained malicious protocols (e.g., `javascript:`), this could result in an XSS vulnerability.
- **Fix**: Added an explicit validation check utilizing the `isSafeHref` utility function from `src/utils/security.js` prior to invoking `window.location.href`. This ensures only safe, non-malicious protocols are executed, reinforcing defense-in-depth. Blocked navigation attempts are safely logged as warnings.
