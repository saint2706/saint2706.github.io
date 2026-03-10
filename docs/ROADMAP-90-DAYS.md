# 90-Day Product Roadmap (Website Development & Refinement)

## Purpose

This roadmap outlines the next 3 months of continued development for the portfolio website, focusing on:

- **Feature depth** (content utility, AI quality, discoverability)
- **UI polish** (visual consistency across both themes)
- **UX quality** (speed, accessibility, and user journey clarity)

It is structured as a practical execution document with milestones, acceptance criteria, and measurable outcomes.

---

## Inputs Reviewed (Existing Artifacts)

The roadmap is based on current repository context and existing documentation/progress logs:

- `README.md` (current feature set and scripts)
- `docs/ARCHITECTURE.md` (component/data flow/performance posture)
- `docs/THEMING.md` (dual-theme implementation model)
- `docs/GAMES.md` (modular game architecture)
- `CONTRIBUTING.md` (quality gate expectations)
- `.jules/hunter-progress.md` (recent cleanup/refactor history)
- `CHANGELOG.md` (unreleased and recent documentation focus)

---

## North-Star Goals for 90 Days

By end of month 3, the site should:

1. **Convert more visitors into meaningful interactions** (project clicks, contact, resume downloads, chat engagement).
2. **Feel premium and consistent in both themes** (neubrutalism + liquid) with fewer rough edges.
3. **Be measurably faster and more accessible** (Core Web Vitals + keyboard/screen-reader usability).
4. **Have stronger content operations** (repeatable updates for projects/blog/SEO assets).

---

## KPI Targets (3-Month)

- **Performance**
  - Lighthouse Performance score: **90+** on key routes (`/`, `/projects`, `/blog`, `/playground`)
  - LCP: **< 2.5s** on homepage (simulated mobile)
  - CLS: **< 0.1** across major pages
- **Accessibility**
  - Lighthouse Accessibility score: **95+**
  - Zero critical keyboard traps and no unlabeled interactive elements
- **Engagement**
  - +25% increase in project detail clicks
  - +20% increase in contact conversions (form/email/CTA clicks)
  - +15% increase in average session depth (pages per session)
- **Content freshness**
  - Minimum 2 new/updated project entries and 2 blog sync/content updates per month

---

## Roadmap by Month

## Month 1 — Foundation, Baselines, and UX Friction Removal

### Feature Goals

1. **Analytics + Event Taxonomy Foundation**
   - Define event schema for major interactions:
     - Theme toggle usage
     - CTA clicks (resume/contact/project links)
     - Chatbot open/send
     - Game starts/completions
     - Blog card clicks
   - Add a small analytics abstraction layer to avoid vendor lock-in.

2. **Portfolio Content Quality Pass**
   - Audit and standardize project cards for:
     - Outcome-oriented summaries
     - Tech stack tags consistency
     - Live/demo/source link clarity
   - Add “featured projects” ordering strategy.

3. **Command Palette Improvements (Quick Wins)**
   - Expand useful commands (jump to projects, open resume PDF, toggle animations, open top blog post).
   - Improve discoverability with subtle first-visit hint.

### UI Goals

1. **Theme Consistency Audit (Both Modes)**
   - Establish a checklist for spacing, border radius, shadow intensity, typography scale, and motion timing.
   - Fix obvious component drift between neubrutalism and liquid variants.

2. **Navigation Clarity Improvements**
   - Improve active-link affordance.
   - Standardize hover/focus states in navbar/footer/CTAs.

### UX Goals

1. **Accessibility & Keyboard Navigation Sweep**
   - Validate focus order, skip links, button labels, and modal focus trapping.
   - Ensure command palette and chatbot are fully keyboard-operable.

2. **Perceived Performance Quick Wins**
   - Add/simplify skeleton loading states where route-level async/lazy loading occurs.
   - Reduce layout shift caused by image/container loading.

### Month 1 Deliverables

- Event taxonomy document + instrumentation on core routes
- Updated project content standards + at least first pass applied
- Theme consistency issue list resolved for high-traffic pages
- Accessibility fixes for top-priority interactions

---

## Month 2 — Experience Depth, Personalization, and Content Engine

### Feature Goals

1. **AI Chat Experience Upgrade**
   - Improve prompt/context quality from structured resume/project/blog data.
   - Add suggested prompt chips (e.g., “Best projects for recruiters”, “Explain your ML experience”).
   - Add better failure/retry UX for API/network errors.

2. **Projects Discovery Enhancements**
   - Add filtering/sorting controls (domain, stack, impact, recency).
   - Add richer project detail panel/page with outcomes + architecture highlights.

3. **Blog Experience Improvements**
   - Better card metadata (read time, tags).
   - “Related posts” logic for deeper reading path.

### UI Goals

1. **Component Polish Sprint**
   - Refine card hierarchy, button density, and section rhythm on homepage/projects/blog.
   - Normalize icon usage and microcopy tone.

2. **Micro-interactions (Intentional, Not Noisy)**
   - Improve transitions for route changes, overlays, and section reveals.
   - Respect reduced-motion preferences everywhere.

### UX Goals

1. **Funnel Optimization**
   - Strengthen CTA placement (“Hire me”, “View resume”, “See featured work”).
   - Add contextual CTAs at the end of high-intent sections.

2. **Mobile-First Pass**
   - Improve touch targets, spacing, and readability for small screens.
   - Validate command palette/chat/game controls on mobile interaction constraints.

### Month 2 Deliverables

- Enhanced chat with prompt chips + resilient error states
- Project filtering/sorting live
- Blog browsing improvements + related-content path
- Mobile usability pass completed on key pages

---

## Month 3 — Optimization, SEO/Distribution, and Launch-Ready Quality

### Feature Goals

1. **SEO and Discoverability Pack**
   - Expand structured data coverage for projects/blog where useful.
   - Tighten metadata strategy (titles/descriptions/open graph per route).
   - Review sitemap/LLM text generation quality and completeness.

2. **Case-Study Depth Additions**
   - Convert top 2 projects into deeper case studies:
     - Problem
     - Approach
     - Trade-offs
     - Results/metrics

3. **Operational Quality Automation**
   - Add CI checks for docs freshness and key generated artifacts (`llms.txt`, sitemap).
   - Improve release checklist for content + quality gates.

### UI Goals

1. **Final Visual QA Pass**
   - Pixel-level pass on spacing, contrast, and responsive behavior.
   - Ensure consistency in empty states, error states, and loading states.

2. **Theme Delight Pass**
   - Small branded moments in both themes (without hurting performance/accessibility).

### UX Goals

1. **Performance Deep Optimization**
   - Bundle analysis and chunk refinement for heavy routes/components.
   - Verify lazy-loading strategy for games/chat/playground remains efficient.

2. **End-to-End Journey Validation**
   - Test core user journeys:
     - Recruiter quick scan → projects → resume/contact
     - Technical evaluator deep dive → case studies/blog
     - Casual visitor engagement → games/chat exploration

### Month 3 Deliverables

- SEO/distribution package finalized
- 2 detailed project case studies published
- Performance and accessibility goals validated against KPI targets
- Release-readiness checklist and monitoring cadence established

---

## Prioritized Backlog (Cross-Cutting)

### P0 (Must Have in 90 Days)

- Analytics event tracking on core interactions
- Accessibility pass for navigation, overlays, and key forms
- Project page discoverability improvements (filter/sort + better summaries)
- Chat UX hardening (error states + useful starter prompts)
- Lighthouse/performance optimization to hit baseline targets

### P1 (Should Have)

- Related-post/blog depth features
- Expanded command palette utility
- Case-study style project deep dives
- Visual consistency refinements across both themes

### P2 (Could Have)

- Advanced personalization (visitor-type pathways)
- Extra mini-game feature expansion
- Experimental motion/theming flourishes

---

## Risks & Mitigations

- **Scope Creep**
  - Mitigation: Enforce P0/P1/P2 boundaries and monthly freeze windows.
- **Performance regression from added features**
  - Mitigation: Track route-level bundle impact before merge and monitor CWV trends.
- **Inconsistent dual-theme QA**
  - Mitigation: Add explicit “test both themes” checklist item to PR workflow.
- **AI API reliability/cost variability**
  - Mitigation: Add robust fallbacks, local UX messaging, and request throttling discipline.

---

## Definition of Done (Roadmap Completion)

This 90-day roadmap is considered complete when:

1. KPI thresholds are met or clearly trended with evidence.
2. P0 backlog items are shipped and stable.
3. Monthly deliverables are implemented and documented.
4. A repeatable operating cadence exists for ongoing content, SEO, and UX refinement.

---

## Suggested Execution Cadence

- **Weekly**: Planning + implementation sprint + demo + retro
- **Biweekly**: KPI review (performance/accessibility/engagement)
- **Monthly**: Milestone acceptance review against this document

Ownership can be split into:

- Product/Content
- UI/Theming
- Frontend Engineering
- Quality/Accessibility

(For a solo maintainer, convert ownership into day-based focus blocks.)
