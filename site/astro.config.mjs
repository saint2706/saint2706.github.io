import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output for GitHub Pages: one folder per route, URLs end in a slash (ADR-003).
export default defineConfig({
  site: 'https://saint2706.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Old SPA paths keep working; Pages cannot send real 301s, so Astro writes meta-refresh pages.
  redirects: {
    '/blog': '/writing/',
    '/resume': '/about/',
    '/games': '/lab/',
    '/playground': '/lab/',
  },
  integrations: [sitemap({ filter: page => !page.includes('/search/') })],
  devToolbar: { enabled: false },
  // Pages has no response headers, so Astro writes the policy as a <meta> tag with hashes for inline code.
  // 'wasm-unsafe-eval' is for Pagefind's search index (WebAssembly).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
