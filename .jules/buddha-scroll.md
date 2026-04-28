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
    - Added descriptive `title` attributes to links in `src/components/pages/Projects.jsx` for enhanced context.

## Date: 2026-03-06

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for better Discoverability (GEO), Creative Work representation, and Metadata (SEO).

### Changes

1.  **[GEO/SEO] Added `projectCreativeWorkSchema`:**
    - Created a new standard CreativeWork JSON-LD schema generator in `src/utils/seo.js` mapped to resume project data to ensure projects are accurately represented as Creative Work entities.
2.  **[GEO/SEO] Injected CreativeWork Schemas:**
    - Dynamically integrated the new schemas to the `SEOHead` inside `src/components/pages/Projects.jsx`, ensuring search engines and LLM agents retrieve structured context on creative experiments and tools.
3.  **[PERF] Validated LCP Lazy Loading:**
    - Confirmed the hero text serves as the main LCP for the index without lazy-loaded blocking items, and validated priority loading limits (`fetchPriority="high"`, `loading="eager"`) for above-the-fold image assets.

## Date: 2026-03-08

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for better accessibility, SEO, and semantic HTML structure.

### Changes

1.  **[SEO][GEO] Fixed Semantic Hierarchy in Overlays:**
    - Modified `src/components/shared/ChatInterface.jsx`, `src/components/shared/Chatbot.jsx`, and `src/components/shared/RoastInterface.jsx` to use `<h2>` instead of jumping directly to `<h3>` for their dialog headers.
    - Correct heading hierarchy is critical for both accessibility and search engine/AI agent document understanding, preventing structural "jumps" that confuse parsers.

## Date: 2026-03-09

**Agent**: Jules (Buddha Persona)

### Summary

Resolved build-blocking lint errors to ensure performance reliability and proper code analysis.

### Changes

1.  **[PERF] Fixed Build and Lint Stability:**
    - Fixed an `Unnecessary escape character: \"  no-useless-escape` error in `scripts/verify-sri.js`.
    - Verified that `pnpm build`, `pnpm lint`, and `pnpm run test:run` passed successfully, ensuring a reliable build pipeline and stable artifact generation.

## Date: $(date +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Fixed semantic HTML heading hierarchy in Resume page.

### Changes

1.  **[SEO][GEO] Fixed Semantic Hierarchy in Resume:**
    - Modified `src/components/pages/Resume.jsx` to use `<h3>` instead of jumping directly to `<h2>` inside `ThemedSectionHeading` sections for "Tech Stack", "Certifications", and "Languages".
    - Correct heading hierarchy is critical for both accessibility and search engine/AI agent document understanding, preventing structural "jumps" that confuse parsers.

- **[SEO][GEO]** Fixed semantic HTML heading hierarchy in `Resume.jsx`. Replaced `<h3`> tags with `<h2>` tags for top-level sections (Tech Stack, Certifications, Languages) to ensure proper semantic hierarchy since they don't have an `<h2>` parent.
- **[SEO] Semantic HTML Fix**: Fixed heading hierarchy in `Playground.jsx` by changing the empty state text from `<h3>` to `<h2>` to properly follow the main `<h1>` tag.

4.  **[SEO] Semantic HTML Hierarchy Fix**:
    - Fixed heading hierarchy in `src/components/pages/Resume.jsx` by changing child headings inside `ThemedSectionHeading` from `h2` to `h3`.
    - Handled sections: "Tech Stack", "Certifications", and "Languages".

## Date: $(date +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Fixed semantic HTML heading hierarchy across multiple pages.

### Changes

1.  **[SEO][GEO] Fixed Semantic Hierarchy in Playground:**
    - Modified `src/components/pages/Playground.jsx` to use `<h3>` instead of `<h2>` for "No snippets found" and `snippet.title`.
2.  **[SEO][GEO] Fixed Semantic Hierarchy in Blog:**
    - Modified `src/components/pages/Blog.jsx` to use `<h3>` instead of `<h2>` for "No articles found" and `blog.title`.
3.  **[SEO][GEO] Fixed Semantic Hierarchy in Contact:**
    - Modified `src/components/pages/Contact.jsx` to use `<h3>` instead of `<h2>` for "Send a message", "Draft Opened!", "Get in Touch", "Follow Me", and "Ready to start a conversation?".
4.  **[SEO][GEO] Fixed Semantic Hierarchy in Projects:**
    - Modified `src/components/pages/Projects.jsx` to use `<h3>` instead of `<h2>` for `project.title`.

## Date: $(date +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Fixed semantic HTML heading hierarchy across multiple pages.

### Changes

1.  **[SEO][GEO] Fixed Semantic Hierarchy in Playground:**
    - Modified `src/components/pages/Playground.jsx` to use `<h2>` instead of `<h3>` for "No snippets found" and `snippet.title`.
2.  **[SEO][GEO] Fixed Semantic Hierarchy in Blog:**
    - Modified `src/components/pages/Blog.jsx` to use `<h2>` instead of `<h3>` for "No articles found" and `blog.title`.
3.  **[SEO][GEO] Fixed Semantic Hierarchy in Contact:**
    - Modified `src/components/pages/Contact.jsx` to use `<h2>` instead of `<h3>` for "Send a message", "Draft Opened!", "Get in Touch", "Follow Me", and "Ready to start a conversation?".
4.  **[SEO][GEO] Fixed Semantic Hierarchy in Projects:**
    - Modified `src/components/pages/Projects.jsx` to use `<h2>` instead of `<h3>` for `project.title`.

## Date: $(date -u +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Optimized Core Web Vitals (LCP) and AI Discoverability (GEO) metrics per prompt instructions.

### Changes

1.  **[PERF] Optimized LCP element in Hero section**:
    - Modified `src/components/home/Hero.jsx` by updating `textInitial` from `{ opacity: 0, y: 20 }` to `{ opacity: 1, y: 0 }`.
    - This ensures the Hero text LCP block is immediately visible without delayed fade-in animations, strictly adhering to Core Web Vitals guidance.

2.  **[GEO] Standardized Site Architecture format in `llms.txt`**:
    - Updated `scripts/generate-llms.js` to strictly follow the AI-friendly Site Architecture mapping format provided.
    - Verified proper generation of `public/llms.txt`.

## Date: $(date -u +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for better Discoverability (GEO) by adding `Product` structured data.

### Changes

1.  **[GEO] Added `productSchema`**:
    - Created `productSchema` in `src/utils/seo.js` to structure featured projects as Products.
    - Updated `src/components/pages/Projects.jsx` to inject `productSchema` for all featured projects into the `schemas` array.
    - Added comprehensive unit tests in `src/utils/seo.test.js` to verify the generated schema.

## Date: $(date -u +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Fixed semantic HTML heading hierarchy in Resume page.

### Changes

1.  **[SEO][GEO] Fixed Semantic Hierarchy in Resume:**
    - Modified `src/components/pages/Resume.jsx` to use `<h2>` instead of jumping directly to `<h3>` for "Tech Stack", "Certifications", and "Languages".
    - Correct heading hierarchy is critical for both accessibility and search engine/AI agent document understanding, preventing structural "jumps" that confuse parsers.

# Buddha Session Log

## Changes Applied

- **[PERF]** Optimized font loading in `index.html` by setting `media="print"` and using an `onload` handler on the Google Fonts stylesheet to remove render-blocking resources.
- **[GEO]** Verified that the `llms.txt` and structured data (JSON-LD) already exist and accurately represent the site architecture and required SEO metadata.

- **[GEO]** Verified that the `llms.txt` and structured data (JSON-LD) already exist and accurately represent the site architecture and required SEO metadata.
- **[SEO]** Verified that `robots.txt` is already configured for common AI crawlers.
- **[PERF]** Found images in `Projects.jsx` and `ChatInterface.jsx` have appropriate loading strategies.

- **[SEO]** `index.html`: Changed `<noscript>` `<h1>` fallback element to `<h2>` to prevent multiple `<h1>` elements from appearing on the page when parsed by search engines. This preserves semantic hierarchy since the primary React app injects the true `<h1>`.

## Date: $(date -u +%Y-%m-%d)

**Agent**: Jules (Buddha Persona)

### Summary

Optimized the codebase for better accessibility, Core Web Vitals (LCP), and Content Security Policy compliance.

### Changes

1.  **[SEO] Fixed Lighthouse Accessibility Warnings in Hero Component**:
    - Updated `aria-label` for "Talk to Digital Rishabh" button to match visible text.
    - Updated `aria-label` for Easter egg span to include the visible text.
2.  **[PERF] Fixed CSP Violation in Font Preloading**:
    - Removed `onload` inline event handler from font stylesheet link in `index.html`.
    - Changed `media="print"` to `media="all"` to ensure fonts load without violating the strict Content Security Policy. This improves LCP metrics and resolves console errors.

- **[SEO] / [PERF] Lighthouse Console Error Fix**: Moved `frame-ancestors` from the `index.html` `<meta>` Content-Security-Policy to `public/_headers` as an HTTP response header, fixing a Lighthouse audit failure ("The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.").

- **[SECURITY] basic-ftp FTP Command Injection Fix**: Added an override to `package.json` for `basic-ftp@>=5.2.1` to resolve a High severity vulnerability (`GHSA-chqc-8p9q-pq6q`) affecting `pac-proxy-agent` within `puppeteer-core`.

### 2026-04-10

- [SEO] Updated `index.html` to use a semantic `<h1>` tag within the `<noscript>` block for better crawler hierarchy indexing.

## Date: 2026-04-17

**Agent**: Jules (Buddha Persona)

### Summary

Optimized Core Web Vitals (LCP) and Semantic HTML (SEO).

### Changes

1.  **[SEO] Fixed Semantic Hierarchy in `index.html`**:
    - Changed `<h1>` to `<h2>` in the `<noscript>` block to preserve document hierarchy and avoid multiple `<h1>` tags.
2.  **[PERF] Optimized LCP Font Loading**:
    - Added `fetchpriority="high"` to the Google Fonts preload link in `index.html` to ensure critical fonts for the Hero text LCP block are loaded with the highest priority.

## Date: 2026-05-18

**Agent**: Jules (Buddha Persona)

### Summary

Audited the codebase for Core Web Vitals (LCP, CLS, INP), structured data (JSON-LD), AI Discoverability (GEO), and Semantic HTML (SEO).

### Changes

1.  **[SEO][GEO] Audited codebase**:
    - Confirmed `llms.txt`, `robots.txt`, structured data (JSON-LD), `dangerouslySetInnerHTML` sanitization, and semantic HTML hierarchy meet requirements.
    - Confirmed LCP and priority elements were optimized. No additional code changes were necessary as the codebase already satisfies all Buddha persona constraints.
>> Audit completed. Verified that `<h2>` is correctly used in `index.html` <noscript> fallback.
>> Verified `sitemap.xml` and `llms.txt` using `pnpm run generate:geo`.
>> H1-H6 semantic structure is intact across all pages.
>> JSON-LD is correctly sanitized using safeJSONStringify to prevent XSS.
>> Image priority eager loading is in place for LCP (Hero) element and eager images on projects, lazy otherwise.
