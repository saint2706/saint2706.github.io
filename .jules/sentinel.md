# Sentinel

## 2024-05-22 - Unsafe Markdown Link Rendering

**Vulnerability:** The Chatbot's custom `LinkRenderer` accepted any `href` prop directly from the Markdown parser, exposing the application to XSS via `javascript:` URIs if the LLM output contained malicious links.
**Learning:** Custom components in `react-markdown` (and similar libraries) blindly receive props from the Markdown AST. In v9.x, `react-markdown` avoids rendering raw HTML by default rather than sanitizing it, so the real risk here was our custom link renderer accepting dangerous protocols (like `javascript:`) in `href` and passing them straight to native elements.
**Prevention:** Always validate potentially dangerous props (like `href`, `src`) in custom renderers against a strict allowlist (e.g., `http`, `https`, `mailto`) before rendering them.

## 2025-01-23 - RFC 9116 Compliance (Expires Field)

**Vulnerability:** Risk of deploying a non-compliant `security.txt` that omits the mandatory `Expires` field.
**Learning:** When creating a new `security.txt`, RFC 9116 (security.txt standard) explicitly requires the `Expires` field (Section 2.5.5) to ensure security policies don't become stale. Tools and researchers may consider the file invalid without it.
**Prevention:** Always include an `Expires: <ISO-8601-Date>` line when creating `security.txt` files.

## 2025-02-05 - Client-Side AI Rate Limiting

**Vulnerability:** Lack of rate limiting on the AI service allowed potential abuse of the Gemini API key (quota exhaustion) via rapid manual requests from a single client.
**Learning:** In client-side-only applications (like this GitHub Pages site) where API keys must be exposed in the bundle, server-side rate limiting (by IP) is not possible without a backend proxy.
**Prevention:** Implement client-side rate limiting (throttling) in the service layer as a defense-in-depth measure to slow down potential abuse and improve UX by preventing accidental double-submissions, even if it doesn't fully prevent distributed attacks.

## 2025-02-18 - Python Code Injection in Playground

**Vulnerability:** The `PythonRunner` component interpolated user input directly into Python code strings executed by Pyodide, allowing arbitrary Python code execution (and potentially XSS via `js` module) through malicious input.
**Learning:** String interpolation of user input into code templates is dangerous even in client-side sandboxes if the sandbox has access to the DOM or other sensitive contexts. Pyodide execution is not isolated from the browser's JavaScript environment by default.
**Prevention:** Pass user input as variables to the runtime environment (e.g., using `pyodide.globals.set`) instead of constructing code strings dynamically. Use safe parsing methods (like `ast.literal_eval`) for structured data instead of `eval` or direct code execution.

## 2025-02-23 - Strict Referrer Policy

**Vulnerability:** Default browser behavior for the `Referer` header can leak full URLs (including paths and query parameters) to third-party sites when users click external links, potentially exposing sensitive information or user navigation patterns.
**Learning:** While modern browsers default to `strict-origin-when-cross-origin`, explicitly defining it via `<meta name="referrer">` ensures consistent privacy protection across all environments and older browsers.
**Prevention:** Always set a strict referrer policy (like `strict-origin-when-cross-origin` or `no-referrer`) in the document head to minimize data leakage.

## 2025-02-26 - Input Sanitization for LLM Context

**Vulnerability:** Lack of sanitization for user input sent to the LLM allows for potential injection of invisible control characters or malformed Unicode, which could confuse the model or cause processing errors.
**Learning:** Even when using high-level AI APIs, input should be treated as untrusted. Normalizing Unicode (NFKC) and removing control characters ensures that the text processed by the model matches the user's visible intent and prevents obscure encoding attacks.
**Prevention:** Implement a strict input sanitization layer (stripping control chars, normalizing Unicode) at the application boundary before any data processing or API calls.

## 2025-02-27 - Subresource Integrity (SRI) for CDN Scripts

**Vulnerability:** Loading external scripts (like Pyodide) from CDNs without integrity checks exposes the application to supply chain attacks if the CDN or the specific file is compromised.
**Learning:** Even trusted CDNs like jsDelivr can be vectors for attacks. Browsers allow verifying the integrity of fetched resources using the `integrity` attribute, ensuring that the executed code matches exactly what was expected during development.
**Prevention:** Always use Subresource Integrity (SRI) with `integrity` and `crossOrigin="anonymous"` attributes when loading external scripts from CDNs.

## 2025-03-01 - LocalStorage Tampering Validation

**Vulnerability:** The application trusted chat history loaded directly from `localStorage`, allowing potential Denial of Service (DoS) or application crashes if the storage was tampered with (e.g., inserting massive payloads or malformed objects).
**Learning:** Data persisted in `localStorage` is not immutable and can be modified by other scripts on the same origin or by the user. Trusting it blindly violates the principle of "trust nothing".
**Prevention:** Always validate the structure, type, and size of data loaded from client-side storage before using it in the application state, treating it as untrusted input.

## 2026-02-08 - Unsafe Markdown Image Rendering

**Vulnerability:** `ReactMarkdown` renders `img` tags by default. While generally safe, relying on library defaults for untrusted input is less secure than explicit validation. Malicious image sources using dangerous URI schemes (like `javascript:`) could be introduced if not sanitized.
**Learning:** Just like `href` in links, `src` in images is an injection vector. Client-side markdown renderers should validate all resource URLs against a strict allowlist and reject unsafe protocols.
**Prevention:** Implement a custom `ImageRenderer` component for `react-markdown` that validates `src` using `isSafeImageSrc` (or equivalent) before rendering the `img` tag, blocking dangerous protocols and potential XSS vectors.
## 2026-02-18 - Improved URL Security with Relative Path Support
**Vulnerability:** `isSafeHref` and `isSafeImageSrc` were overly restrictive, blocking valid relative URLs (`/projects`, `#contact`) which broke internal navigation in dynamic content.
**Learning:** Security utilities must balance strictness with functionality. Over-blocking often leads to broken features or security bypasses. Using `new URL(src, 'http://example.com')` allows robust parsing of relative URLs while still enforcing protocol checks.
**Prevention:** When designing validators, explicitly test for valid internal use cases (relative paths, fragments) alongside attack vectors. Use standard parsers over regex where possible.

## 2026-05-23 - Python Runner Input Hardening

**Vulnerability:** The interactive Python runner input field lacked length limits and browser-specific security attributes, potentially allowing for Denial of Service (DoS) or application crashes if the storage was tampered with (e.g., inserting massive payloads or malformed objects).
**Learning:** Even client-side inputs for sandboxed environments should have reasonable constraints. Unbounded inputs can crash the browser tab or the WASM runtime. Code inputs should opt-out of spellchecking and autocomplete to prevent data leakage.
**Prevention:** Always set `maxLength`, `spellCheck="false"`, and `autoComplete="off"` on inputs intended for code execution or sensitive data entry.

## 2026-05-23 - Open Redirect via Control Characters

**Vulnerability:** The `isSafeHref` validation used a blacklist for protocol-relative URLs (`//example.com`) but failed to remove control characters like `\t`, `\n`, `\r` before the check. Browsers strip these characters during URL parsing, allowing attackers to bypass the blacklist (e.g., `/\t/example.com` becomes `//example.com`) and redirect users to malicious sites.
**Learning:** Blacklisting patterns in URLs is brittle if the input is not strictly normalized first. Browser URL parsing behavior differs from simple string matching. Control characters are often ignored by browsers but can break regex checks.
**Prevention:** Always strip control characters from URLs before performing security checks, especially when validating relative URLs or checking against blocklists. Mimic browser normalization logic in security validators.
