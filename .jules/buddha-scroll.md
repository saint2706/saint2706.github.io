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

## Date: 2026-03-06

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

## Date: 2026-03-06

**Agent**: Jules (Buddha Persona)

### Summary

Implemented Core Web Vitals (CLS), traditional SEO, and AI discoverability improvements for JSON-LD and Image handling.

### Changes

1.  **[GEO] Fixed JSON-LD Script Injection:**
    - Updated `src/components/shared/SEOHead.jsx` to use `dangerouslySetInnerHTML={{ __html: json }}` for `<script type="application/ld+json">`.
    - This prevents React from improperly escaping JSON strings, ensuring search engines and AI agents can correctly parse the structured data across the site.

2.  **[PERF] Improved Image CLS:**
    - Added explicit `width` and `height` dimensions to `<img>` tags in `src/components/pages/Projects.jsx` (`width={600}` `height={400}`) and `src/components/shared/ChatInterface.jsx` (`width={800}` `height={600}`).
    - This prevents Cumulative Layout Shifts (CLS) as images load, improving Core Web Vitals.

3.  **[SEO] Added TechArticle Schema:**
    - Created `blogPostingSchema` in `src/utils/seo.js` mapped to individual blog posts.
    - Implemented dynamically in `src/components/pages/Blog.jsx` so each article gets item-level structured data (`TechArticle`), enhancing search visibility and intelligence for AI agents.

- **[GEO][SEO]**: Fixed Semantic HTML in multiple pages (`Projects`, `Blog`, `Contact`, `Playground`) by replacing invalid `<h3>` tags jumping hierarchy with proper `<h2>` tags.
- **[PERF]**: Fixed font preloading in `index.html` where `<link rel="preload">` URL did not match the corresponding `<link rel="stylesheet">` URL. Ensuring exact matches prevents the browser from double-fetching stylesheets and improves LCP.

## Date: 2026-03-06

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for AI discoverability and rich snippets.

### Changes

1.  **[GEO] Allowed AI crawlers:**
    - Updated `public/robots.txt` to allow `PerplexityBot` and `OAI-SearchBot` to index the site.

2.  **[SEO][GEO] Added FAQ schema:**
    - Exported a new `faqSchema` in `src/utils/seo.js` that structures the Chatbot's quick replies as FAQs.
    - Injected the `faqSchema` into the homepage via `src/components/home/Hero.jsx` to provide direct answers to search engines and AI agents.

## Date: 2026-03-06

**Agent**: Jules (Buddha Persona)

### Summary

Conducted a thorough verification to confirm SEO, GEO, and Core Web Vitals optimization.

### Changes

1.  **[SEO][GEO] Verified Site-wide Compliance:**
    - Confirmed that LCP elements are eagerly loaded with `fetchPriority="high"`.
    - Confirmed that semantic `<h1-h6>` structures are intact across pages, correctly using `ThemedSectionHeading` with `as="h1"` for the primary header.
    - Verified `llms.txt` and `robots.txt` are accurate and generated successfully on build.
    - Ensured JSON-LD schema objects are appropriately injected across different routes.
    - Ensured no unused scripts or raw `dangerouslySetInnerHTML` injections exist without sanitization via `safeJSONStringify`.
    - Verified zero build and lint errors to ensure performance reliability.
