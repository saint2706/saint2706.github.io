## [GEO] AI Discoverability Optimization

- **llms.txt**: Implemented a comprehensive `llms.txt` file generated from `src/data/resume.js`. This file serves as a high-signal "manifest" for AI agents, detailing site architecture, skills, experience, and projects in a format optimized for RAG and direct consumption.
- **robots.txt**: Updated to explicitly allow `GPTBot`, `ChatGPT-User`, and `Google-Extended`. This ensures the site is indexed by major AI search engines (ChatGPT Search, Gemini), opting in for "AI visibility" while keeping `CCBot` (Common Crawl) blocked to manage bandwidth/noise if preferred.

## [SEO] Structural Improvements

- **Automated Sitemap**: Created `scripts/generate-sitemap.js` to dynamically generate `sitemap.xml` with current dates (`lastmod`), ensuring search engines know the content is fresh.
- **LCP Optimization**: Confirmed usage of `loading="eager"` for initial project images in `Projects.jsx` and verified `Hero` LCP strategy (text/code-card based).

## [GEO] Automation & Harmonization

- **Automated Generation**: Added `prebuild` script to automatically regenerate `llms.txt` and `sitemap.xml` before every build, ensuring fresh data for AI agents.
- **Verification**: Verified Core Web Vitals (LCP text-first, CLS constrained), Security (CSP, deps), and Structured Data (JSON-LD).
- **Scripts**: Exposed `npm run generate:geo` for manual updates.
