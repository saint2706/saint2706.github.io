## Session Learnings

- Safely wrapped `localStorage.getItem` and `setItem` using `safeGetLocalStorage` and `safeSetLocalStorage` across all game components (Minesweeper, SimonSays, WhackAMole, SnakeGame, LightsOut, MemoryMatch) to prevent private mode/quota crashes and potential injection vectors.
- Updated `lodash-es` to `>=4.18.0` and `brace-expansion` to `>=5.0.5` to resolve known Code Injection, Prototype Pollution, and Memory Exhaustion vulnerabilities detected by pnpm audit.
- Identified and fixed an XSS evasion vulnerability in `isSafeHref` and `isSafeImageSrc` by enforcing whitespace trimming inside the iterative URL decoding loop, mitigating payloads like `%2520javascript:alert(1)`.
- Prevented potential client-side Denial of Service in `Contact.jsx` by limiting the length of user inputs when generating `mailto:` URLs assigned to `window.location.href`.

## Date: 2026-03-06

### Vulnerability Mitigation

1.  **[RCE/DoS] Fixed Pyodide Memory Exhaustion:**
    - Replaced `ast.literal_eval` with `json.loads` in `src/data/snippets.js`.
    - Python's `ast.literal_eval` parses strings into an Abstract Syntax Tree (AST), which is recursive. A user providing deeply nested input (e.g., `[[[[...]]]]`) could cause a stack overflow in Python's C core, causing the Pyodide WebAssembly runtime to crash the browser tab (client-side Denial of Service).
    - `json.loads` is not vulnerable to recursive AST stack exhaustion and provides safer JSON parsing for the `py-flatten` and `py-transpose` snippets.

## Date: $(date -u +%Y-%m-%d)

**Agent**: Jules (Sentinel Persona)

### Summary

Resolved High severity vulnerability in a deep transitive dependency of Lighthouse (`puppeteer-core`).

### Changes

1. **[SEC-DEP] `basic-ftp` FTP Command Injection (GHSA-chqc-8p9q-pq6q)**:
   - Vulnerability found in `=5.2.0`
   - Added `"basic-ftp": ">=5.2.1"` to `pnpm.overrides` in `package.json`.
   - Updated `pnpm-lock.yaml` via `pnpm install --no-frozen-lockfile`.
     🛡️ **Sentinel Audit**

- Updated `src/services/ai.js` to correctly truncate UTF-16 strings using array spreading (`[...str].slice(...)`) to prevent splitting surrogate pairs, which can cause DoS or URI encoding errors.
- Verified safe JSON serialization in `SEOHead.jsx`.
- Verified strict CSP and secure attribute ordering in `ChatInterface.jsx`.

### Security Improvement: React-Markdown DOM Attribute Injection

- **Vulnerability / Warning**: `react-markdown` passes an AST `node` object to custom renderers. When `...rest` is spread onto DOM elements (like `<a>` or `<img>`), this object is passed as an attribute (`node="[object Object]"`), which causes React console warnings and could theoretically be manipulated if the AST structure is compromised.
- **Fix**: Updated `LinkRenderer` and `ImageRenderer` in `src/components/shared/ChatInterface.jsx` to explicitly destructure `node: _node` from `rest`, ensuring the AST node is never spread into the DOM elements.

### 2026-04-24

- **[SEC-DEP] PostCSS XSS via Unescaped <style> (GHSA-qx2v-qp2m-jg93)**:
  - Discovered a Moderate severity vulnerability in `postcss@8.5.8` via `pnpm audit`.
  - Upgraded `postcss` to `8.5.10` using `pnpm install postcss@8.5.10`.

### Date: 2026-04-29

**Agent**: Jules (Sentinel Persona)

### Summary

Conducted a thorough security discovery sweep of the codebase.

### Security Improvement: Discovery Sweep

- **Vulnerability / Warning**: Audited codebase for hardcoded secrets, dependency vulnerabilities, CSP configuration, SRI, and XSS risks (e.g., dangerouslySetInnerHTML, window.location.href, target="\_blank").
- **Fix**: No critical or high vulnerabilities were found. All security validations (pnpm run test:security-full, pnpm audit) passed successfully. No code modifications were necessary.
