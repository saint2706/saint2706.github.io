## [GEO] AI Discoverability Optimization

- **llms.txt**: Implemented a comprehensive file generated from . This file serves as a high-signal "manifest" for AI agents, detailing site architecture, skills, experience, and projects in a format optimized for RAG and direct consumption.
- **robots.txt**: Updated to explicitly allow , , and . This ensures the site is indexed by major AI search engines (ChatGPT Search, Gemini), opting in for "AI visibility" while keeping (Common Crawl) blocked to manage bandwidth/noise if preferred.

## [SEO] Structural Improvements

- **Automated Sitemap**: Created to dynamically generate with current dates (), ensuring search engines know the content is fresh.
- **LCP Optimization**: Confirmed usage of for initial project images in and verified LCP strategy (text/code-card based).

## [GEO] AI Discoverability Optimization

- **llms.txt**: Implemented a comprehensive `llms.txt` file generated from `src/data/resume.js`. This file serves as a high-signal "manifest" for AI agents, detailing site architecture, skills, experience, and projects in a format optimized for RAG and direct consumption.
- **robots.txt**: Updated to explicitly allow `GPTBot`, `ChatGPT-User`, and `Google-Extended`. This ensures the site is indexed by major AI search engines (ChatGPT Search, Gemini), opting in for "AI visibility" while keeping `CCBot` (Common Crawl) blocked to manage bandwidth/noise if preferred.

## [SEO] Structural Improvements

- **Automated Sitemap**: Created `scripts/generate-sitemap.js` to dynamically generate `sitemap.xml` with current dates (`lastmod`), ensuring search engines know the content is fresh.
- **LCP Optimization**: Confirmed usage of `loading="eager"` for initial project images in `Projects.jsx` and verified `Hero` LCP strategy (text/code-card based).
