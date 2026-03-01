# 🧘 Buddha Scroll - SEO/GEO Improvements

## Date: 2024-05-23

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for better Discoverability (GEO), Performance (LCP), and Metadata (SEO).

### Changes

1.  **[GEO] Enhanced `llms.txt`**:
    - Added a "Vector Friendliness" section to `public/llms.txt` via `scripts/generate-llms.js`.
    - This section provides a dense, keyword-rich summary of skills, experience, and projects optimized for RAG ingestion by AI agents.

2.  **[GEO] Verified Sitemap**:
    - Confirmed `scripts/generate-sitemap.js` covers all active routes (`/`, `/projects`, `/resume`, `/blog`, `/contact`, `/games`, `/playground`).
    - Regenerated `public/sitemap.xml`.

3.  **[PERF] Optimized Hero LCP**:
    - Modified `src/components/home/Hero.jsx` to remove the initial opacity fade for the main heading (`motion.h1`).
    - Changed `initial` prop from `{ opacity: 0, y: 20 }` to `{ opacity: 1, y: 0 }`.
    - This ensures the Largest Contentful Paint (LCP) element is visible immediately upon hydration, improving Core Web Vitals.

4.  **[SEO] Added SoftwareApplication Schema**:
    - Created `playgroundSchema` in `src/utils/seo.js`.
    - Implemented `SoftwareApplication` JSON-LD schema for the `/playground` page to better describe the interactive Python environment to search engines.

### Next Steps

- Monitor Search Console for coverage of new schemas.
- Check Core Web Vitals field data after deployment.

## Date: $(date +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Implemented Core Web Vitals, traditional SEO, and AI discoverability improvements.

### Changes

1.  **[SEO] Removed `noindex` from Games Page**:
    - Removed `noindex` prop from `SEOHead` in `src/components/pages/Games.jsx`.
    - Removed `Disallow: /games` from `public/robots.txt` under `User-agent: *` to allow full crawling.

2.  **[GEO] Added `SoftwareApplication` Schema for Games Page**:
    - Created `gamesSchema` in `src/utils/seo.js` exporting JSON-LD structured data for the interactive games.
    - Added the schema to the Games page to improve AI discoverability and rich snippets.

3.  **[PERF] Optimized Image Priority on Projects Page**:
    - Modified `src/components/pages/Projects.jsx` to add `fetchPriority="high"` to the first three project images, matching their `loading="eager"` behavior. This optimizes the Largest Contentful Paint (LCP) for faster initial rendering.
