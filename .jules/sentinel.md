## 2024-05-22 - Unsafe Markdown Link Rendering
**Vulnerability:** The Chatbot's custom `LinkRenderer` accepted any `href` prop directly from the Markdown parser, exposing the application to XSS via `javascript:` URIs if the LLM output contained malicious links.
**Learning:** Custom components in `react-markdown` (and similar libraries) blindly receive props from the Markdown AST. In v9.x, `react-markdown` avoids rendering raw HTML by default rather than sanitizing it, so the real risk here was our custom link renderer accepting dangerous protocols (like `javascript:`) in `href` and passing them straight to native elements.
**Prevention:** Always validate potentially dangerous props (like `href`, `src`) in custom renderers against a strict allowlist (e.g., `http`, `https`, `mailto`) before rendering them.

## 2024-05-23 - AI Service Validation Gap
**Vulnerability:** The AI service lacked input length limits and timeouts despite documentation/memory stating otherwise, exposing the app to potential DoS or excessive API usage.
**Learning:** Documentation and "memory" of security features can drift from reality. Verification of critical controls (like input validation) must always happen at the code level, not just assumed from existing knowledge.
**Prevention:** Implement explicit input validation layers (like `validateInput`) in service modules and use timeout wrappers for all external API calls. Verify these controls with standalone scripts.
