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

---

## Date: 2024-05-25

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the Projects page for better Performance (LCP).

### Changes

1.  **[PERF] Optimized Projects LCP**:
    - Modified `src/components/pages/Projects.jsx` to add `fetchPriority={idx < 3 ? 'high' : 'auto'}` to the `<img>` tags for eagerly loaded project thumbnails.
    - This ensures the top 3 images prioritize fetching, improving LCP and Core Web Vitals for the Projects page.

### Next Steps

- Continue to monitor Core Web Vitals and address any other image loading priority improvements needed.
