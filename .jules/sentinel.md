## 2024-05-22 - Unsafe Markdown Link Rendering
**Vulnerability:** The Chatbot's custom `LinkRenderer` accepted any `href` prop directly from the Markdown parser, exposing the application to XSS via `javascript:` URIs if the LLM output contained malicious links.
**Learning:** Custom components in `react-markdown` (and similar libraries) blindly receive props from the Markdown AST. In v9.x, `react-markdown` avoids rendering raw HTML by default rather than sanitizing it, so the real risk here was our custom link renderer accepting dangerous protocols (like `javascript:`) in `href` and passing them straight to native elements.
**Prevention:** Always validate potentially dangerous props (like `href`, `src`) in custom renderers against a strict allowlist (e.g., `http`, `https`, `mailto`) before rendering them.

## 2024-05-23 - Centralized URL Validation
**Vulnerability:** URL validation logic was duplicated or inconsistent between production components (`ChatInterface.jsx`) and verification scripts (`scripts/test-link-security.js`), risking a false sense of security where tests pass but production code remains vulnerable.
**Learning:** Ad-hoc regex validation in tests often drifts from production implementation.
**Prevention:** Extract security primitives (like `isSafeHref`) to a shared utility (`src/utils/security.js`) and test the utility directly.
