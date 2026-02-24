# Sentinel Security Report 🛡️

## 1. Vulnerability Mitigation

- **NPM Vulnerabilities**:
  - `minimatch` (<10.2.1) and `ajv` (<6.14.0) were identified as vulnerable (ReDoS).
  - **Mitigation**: Applied `pnpm.overrides` in `package.json`:
    - `minimatch`: `>=10.2.1`
    - `ajv`: `^6.14.0` (Pinned to v6 branch to maintain compatibility with ESLint while applying security patch).
  - **Status**: `pnpm audit` reports 0 vulnerabilities.

## 2. Content Security Policy (CSP)

- **Status**: Strict CSP enforced via `<meta>` tag in `index.html`.
- **Configuration**:
  - `default-src 'self'`
  - `script-src`: strict, but allows `'wasm-unsafe-eval'` (required for Pyodide).
  - `style-src`: allows `'unsafe-inline'` (currently required for development/Tailwind).
  - `frame-ancestors 'none'`: Mitigates Clickjacking (replaces `X-Frame-Options`).
  - `upgrade-insecure-requests`: Enforced.

## 3. Subresource Integrity (SRI)

- **Pyodide Loader**:
  - `src/components/shared/pyodideLoader.js` manually enforces SRI for the Pyodide script.
  - **Hash**: `sha384-+R8PTzDXzivdjpxOqwVwRhPS9dlske7tKAjwj0O0Kr361gKY5d2Xe6Osl+faRLT7` (Verified).
  - **Verification**: `scripts/verify-sri.js` passes.

## 4. Input Validation & Sanitization

- **Chat Interface**:
  - Inputs limited to 500 chars.
  - Output rendered via `react-markdown` with strict `allowedElements`.
  - Links validated via `isSafeHref` (http, https, mailto).
  - Images validated via `isSafeImageSrc` (http, https).
    - **Update**: Enhanced test coverage for `isSafeImageSrc` in `scripts/test-security-utils.js` to explicitly verify handling of relative paths vs protocol-relative URLs.
- **Python Runner**:
  - Input passed via `pyodide.globals.set` (no string interpolation).
  - Output captured via `StringIO` redirection.

## 5. Secrets Management

- `VITE_GEMINI_API_KEY` loaded via `import.meta.env`.
- **Tooling**: Added `scripts/scan-secrets.js` to automate detection of hardcoded secrets (API keys, tokens, passwords) in the `src` directory.
- **Status**: No hardcoded secrets found in source code (verified by `scan-secrets.js`).

## 6. Headers

- `Referrer-Policy: strict-origin-when-cross-origin` present in `index.html`.
- `X-Frame-Options` covered by CSP `frame-ancestors`.
- `X-Content-Type-Options` (nosniff) omitted as meta tags are ineffective for this header; reliance on strict MIME types served by host recommended.
