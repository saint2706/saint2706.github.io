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

### basic-ftp FTP Command Injection via CRLF

- **Vulnerability**: GHSA-chqc-8p9q-pq6q
- **Fix**: Added `"basic-ftp": ">=5.2.1"` to `pnpm.overrides` in `package.json` to resolve vulnerability in `puppeteer-core`'s transitive dependency.
