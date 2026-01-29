## 2024-05-22 - Unsafe Markdown Link Rendering
**Vulnerability:** The Chatbot's custom `LinkRenderer` accepted any `href` prop directly from the Markdown parser, exposing the application to XSS via `javascript:` URIs if the LLM output contained malicious links.
**Learning:** Custom components in `react-markdown` (and similar libraries) blindly receive props from the Markdown AST. In v9.x, `react-markdown` avoids rendering raw HTML by default rather than sanitizing it, so the real risk here was our custom link renderer accepting dangerous protocols (like `javascript:`) in `href` and passing them straight to native elements.
**Prevention:** Always validate potentially dangerous props (like `href`, `src`) in custom renderers against a strict allowlist (e.g., `http`, `https`, `mailto`) before rendering them.

## 2025-01-23 - RFC 9116 Compliance (Expires Field)
**Vulnerability:** `security.txt` file missing the mandatory `Expires` field.
**Learning:** RFC 9116 (security.txt standard) explicitly requires the `Expires` field (Section 2.5.5) to ensure security policies don't become stale. Tools and researchers may consider the file invalid without it.
**Prevention:** Always include `Expires: <ISO-8601-Date>` when creating `security.txt` files.
