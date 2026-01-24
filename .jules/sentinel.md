## 2024-05-22 - Unsafe Markdown Link Rendering
**Vulnerability:** The Chatbot's custom `LinkRenderer` accepted any `href` prop directly from the Markdown parser, exposing the application to XSS via `javascript:` URIs if the LLM output contained malicious links.
**Learning:** Custom components in `react-markdown` (and similar libraries) blindly receive props. Trusting `react-markdown`'s default sanitization is insufficient when replacing components with custom ones that pass props through to native elements.
**Prevention:** Always validate potentially dangerous props (like `href`, `src`) in custom renderers against a strict allowlist (e.g., `http`, `https`, `mailto`) before rendering them.
