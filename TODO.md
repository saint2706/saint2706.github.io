# 📋 TODO — Portfolio "Quantum Leap" Roadmap

> **Generated from:** `brainstorm.md` (March 2026 Edition)
> **Last Updated:** 2026-03-21
> **Principle:** Less JavaScript = More Capability. Native APIs > npm packages.

---

## Legend

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Complete
- 🔥 — High impact | 💤 — Low effort | ⚠️ — Has dependencies

---

## 🏆 Tier 1 — High-Impact, Stack-Native (Q1–Q2 2026)

### 1. 🌊 Liquid Page Transitions `🔥🔥🔥` `Medium Effort` `Q1`

> Pages morph instead of loading — native iOS-like navigation feel using the now-Baseline View Transitions API.

- [ ] **Integrate View Transitions API with React Router v7**
  - Hook into `document.startViewTransition()` on route changes
  - Ensure sidebar/header elements persist across transitions (zero flicker)
- [ ] **Project card → detail page morph**
  - Assign `view-transition-name` to project card thumbnails
  - Card thumbnail grows to fill viewport and becomes the hero image of the detail page
- [ ] **Add graceful fallback**
  - Content updates normally without animation in unsupported browsers
- [ ] **Test across Baseline browsers**
  - Verify in Chrome, Firefox 144+, Safari 18+, Edge

⚠️ **Deps:** View Transitions API (Baseline Oct '25), React Router v7

---

### 2. ⚡ Predictive Routing (Speculation Rules) `🔥🔥🔥` `Low Effort` `Q1`

> Pages are pre-rendered before the user clicks. Sub-50ms route transitions.

- [ ] **Add `<script type="speculationrules">` to the document head**
  - Configure `"eagerness": "moderate"` to balance bandwidth vs. speed
- [ ] **Detect hover/focus on nav links → trigger `prerender`**
  - Pre-render the top 3 most-likely-next pages
- [ ] **Remove manual `<link rel="prefetch">` and SPA route preloading logic**
  - Native API replaces these patterns
- [ ] **Measure INP improvement**
  - Target: INP < 100ms, perceived zero-latency navigation
  - No spinners, no skeleton screens — the page is just _there_

⚠️ **Deps:** None (native API, Chrome + Edge)

---

### 3. 📐 Spatial UI with CSS Anchor Positioning `🔥🔥` `Low Effort` `Q2`

> Tooltips, popovers, and contextual menus that position themselves — zero JavaScript.

- [ ] **Skill tag tooltips on project cards**
  - Hover a tag like "React" → anchored tooltip shows proficiency level + years of experience
  - Use `anchor-name`, `position-anchor`, `position-area` CSS properties
- [ ] **Navigation breadcrumb mini-maps**
  - Anchored mini-maps showing location within a project deep-dive
- [ ] **Command Palette → Popover API migration**
  - Replace custom focus-trap JS with `popover` attribute
  - Built-in light-dismiss, focus management, top-layer rendering
- [ ] **Delete `@floating-ui` / positioning libraries**
  - Zero JS for spatial UI — pure CSS

⚠️ **Deps:** CSS Anchor Positioning (Baseline Jan '26), Popover API (Baseline Jan '25)

---

### 4. 🗣️ Living AI Assistant (Gemini 2.5 Live) `🔥🔥🔥` `High Effort` `Q3`

> Upgrade the AI roast bot into a real-time conversational entity that can see and speak.

- [ ] **Voice mode implementation**
  - Integrate Gemini 2.5 Live API via WebSocket streaming
  - Use `gemini-live-2.5-flash-native-audio` model
  - Support barge-in (interrupt mid-sentence)
- [ ] **Multimodal roast feature**
  - Drag-and-drop / paste screenshot → Gemini sees it and critiques it
  - Implement affective dialog (matches user's tone)
- [ ] **Streaming UI with neubrutalist typewriter aesthetic**
  - Use React 19's streaming + `useOptimistic` for character-by-character rendering
- [ ] **Conversation memory**
  - Leverage Gemini's 1M token context window for full conversation history
- [ ] **Design the voice interaction UI**
  - Microphone button, audio waveform visualizer, response indicator

⚠️ **Deps:** Gemini 2.5 Live API, WebSocket infrastructure

---

## 🎨 Tier 2 — Design & Experience Innovation (Q2–Q3 2026)

### 5. 📜 Archival Index Blog/Lessons Redesign `🔥🔥` `High Effort` `Q3`

> Curriculum and blog section redesigned as an archival catalog — turning information density into a design statement.

- [ ] **Design the archival catalog layout**
  - Clean monospaced grids, strong hierarchical typography
  - Visible metadata: dates, tags, reading times
  - Structured like a library index card system
- [ ] **Implement CSS scroll-driven animations for browsing**
  - Progress indicators that scroll with you
  - Cards unfold on viewport entry
- [ ] **Optimize for the 140-day data engineering curriculum's volume**
  - Ensure the archival approach handles massive content gracefully

---

### 6. 🎮 Gamified Portfolio Navigation `🔥` `High Effort` `Q3`

> Make exploring the portfolio an adventure, not a scroll.

- [ ] **XP system**
  - Track sections visited (About → Projects → Blog → Contact)
  - Accumulate XP → unlock easter eggs at thresholds (hidden theme variant, secret project, meme)
  - Persist with `localStorage`
- [ ] **Achievement badges**
  - "Viewed 5 projects" → Badge unlocked
  - "Sent a message" → Badge unlocked
  - Display in a tiny HUD corner
  - Use CSS `@starting-style` for badge reveal animations
- [ ] **Interactive site map**
  - Non-linear exploration via a game-world-map-style navigation
- [ ] **Use `<Activity />` to preserve XP state across route changes**
- [ ] **Quality check: fun and surprising, NOT gimmicky**
  - Gamification _reveals_ content, never gatekeeps it

---

### 7. 🧱 Textured Neubrutalism 2.0 `🔥🔥` `Medium Effort` `Q2`

> Evolve flat neubrutalism with digital textures — making the interface feel tactile and handmade.

- [ ] **Noise/grain overlays on card backgrounds**
  - Use CSS `filter` or SVG `feTurbulence`
- [ ] **Halftone dot patterns on hover states**
  - Print-design-inspired interaction feedback
- [ ] **Paper-fold effects on card corners**
  - CSS 3D transforms + shadow tricks
- [ ] **Rubber-stamp aesthetic for achievement badges**
  - Grain + rotation + opacity variation

---

### 8. 🔮 Organic Hero Section (Anti-Grid) `🔥🔥🔥` `High Effort` `Q2`

> Break free from "image left, text right." The hero should feel like art, not a template.

- [ ] **Massive kinetic typography**
  - Name animates in with `@starting-style`, settles into bold, slightly rotated placement
- [ ] **Overlapping elements design**
  - Text overlaps image, image bleeds off-screen — intentionally breaking the grid
- [ ] **Cursor-reactive depth (lightweight parallax)**
  - Elements respond to mouse position using CSS `perspective-*` and custom properties
  - Lightweight mouse listener updates CSS custom props — no heavy JS libs
- [ ] **Design review: ensure it looks handcrafted, NEVER templated**

---

## ⚙️ Tier 3 — Performance & Architecture (Ongoing)

### 9. React 19.2 Internal Refactors

> Leverage React 19.2's hidden gems for cleaner code and better performance.

- [ ] **`<Activity />` adoption**
  - Wrap Settings Modal, Command Palette, Chat in `<Activity mode={visible ? "visible" : "hidden"}>`
  - Preserves internal state, deprioritizes hidden re-renders, no remounting
- [ ] **`useEffectEvent` migration**
  - Extract event callbacks from `useEffect` deps into `useEffectEvent`
  - Eliminates stale-closure bugs in chat, forms, theme listeners
- [ ] **`use()` API for data fetching**
  - Replace `useEffect` + `useState` fetch pattern for GitHub stats, blog posts
  - Use `use(fetchPromise)` inside `<Suspense>` for automatic loading states
- [ ] **Delete all `forwardRef` wrappers**
  - Pass `ref` as a normal prop (React 19 feature)
- [ ] **React Compiler adoption (when stable)**
  - Remove all manual `useMemo`/`useCallback` — compiler auto-memoizes

---

### 10. Kill `useEffect` for Data Fetching _(PRIORITY #1)_

> No waterfall requests. Data should be ready before the component renders.

- [ ] **Audit all components using `useEffect` + `fetch` on mount**
  - GitHub stats, blog posts, curriculum data
- [ ] **Refactor to React Router v7 Loaders or React 19 `use(Promise)`**
  - Pair with `<Suspense>` for automatic loading/error states
- [ ] **Pair with Speculation Rules for pre-rendered data**
  - Data is not only pre-fetched, it's pre-*rendered* in a hidden tab

---

### 11. Replace Custom Modals with Popover API + `<Activity />`

> Let the browser handle focus traps, overlays, and state — delete custom JS logic.

- [ ] **Settings Modal → Popover API migration**
  - Use native `popover` attribute for light-dismiss, focus management, top-layer
- [ ] **Command Palette → Popover API migration**
- [ ] **Wrap modal content in `<Activity />`**
  - State persists when modal is closed
- [ ] **Animate entry/exit with `@starting-style`**
  - Remove framer-motion dependency for open/close transitions
- [ ] **Remove custom focus-trap code, overlay logic, escape-key handlers**

---

### 12. Migrate Scroll Animations to CSS-Only

> Run on compositor thread = zero main-thread blocking, silky 60fps.

- [ ] **Audit all framer-motion scroll-triggered animations**
  - Section entry fades, parallax effects
- [ ] **Replace with CSS Scroll-Driven Animations**
  - Use `animation-timeline: scroll()` and `animation-timeline: view()`
- [ ] **Keep framer-motion ONLY for complex gestures**
  - Drag, layout reorder, spring physics
- [ ] **Measure bundle reduction**
  - Target: 30-40kb bundle savings

⚠️ **Deps:** Safari β support — check polyfill needs

---

### 13. Container Queries for Component Portability

> Cards adapt to their container, not the viewport. Same component works everywhere.

- [ ] **Migrate project cards to `@container` queries (Tailwind v4)**
- [ ] **Migrate blog cards to `@container` queries**
- [ ] **Migrate lesson cards to `@container` queries**
- [ ] **Remove `md:` / `lg:` media queries from migrated components**
- [ ] **Verify: same card works in grid, sidebar, modal, and homepage**

---

### 14. OKLCH Color System Migration `💤`

> Wider gamut, perceptually uniform, P3 display support.

- [ ] **Migrate all CSS custom properties to OKLCH color space**
  - Tailwind v4 defaults to OKLCH — align custom definitions
- [ ] **Verify contrast ratios remain accessible**
- [ ] **Test on P3 displays for vibrancy**

---

### 15. Type Safety Overhaul

> Catch bugs at compile time, not runtime.

- [ ] **Ensure `tsc --noEmit` runs on pre-commit hook**
- [ ] **Delete all `forwardRef` wrappers** (React 19 `ref` as prop)
- [ ] **Audit `Ref` and `Context` types for React 19.2 compatibility**
- [ ] **Adopt React Router v7's type-safe route params**

---

## 🧪 Performance Targets

| Metric       | Current | Target   | Strategy                                                    |
| :----------- | :------ | :------- | :---------------------------------------------------------- |
| **LCP**      | ~1.8s   | < 1.2s   | Prerender via Speculation Rules, optimize hero image        |
| **INP**      | ~180ms  | < 150ms  | Break long tasks, `useTransition` for heavy updates         |
| **CLS**      | ~0.05   | < 0.02   | `<Activity />` for layout, `content-visibility: auto`       |
| **JS Bundle**| ~180kb  | < 120kb  | Replace JS libs with native APIs                            |

---

## 🌀 Backlog / Experiments (Wild Ideas)

> Aspirational, potentially impractical, but worth prototyping.

- [ ] **Cursor as identity** — visitor's cursor becomes unique shape/color based on browser fingerprint (`CSS cursor: url()` + Canvas API)
- [ ] **AI-generated project thumbnails** — Gemini Imagen API generates cards from project descriptions on-the-fly
- [ ] **"Time Machine" mode** — view the portfolio at any git commit via timeline slider (git API + Cloudflare Workers)
- [ ] **Sound design** — subtle UI sounds on interaction using Web Audio API (respect `prefers-reduced-motion`)
- [ ] **Web Components export** — ship neubrutalist components as framework-agnostic Web Components (`<neu-button>`)

---

> **The Thesis:** In 2026, the best portfolio isn't the one with the most JavaScript — it's the one with the _least JavaScript that does the most_. Native APIs are the new frameworks. Ship less, do more, make it **brutal**.
