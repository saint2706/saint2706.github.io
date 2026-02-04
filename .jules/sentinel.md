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
