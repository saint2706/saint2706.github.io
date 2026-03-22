# Portfolio Modernization TODO

> **Last updated:** 2026-03-22  
> **Source:** Refactored from `brainstorm.md` into an execution-focused plan  
> **Goal:** Convert the portfolio vision into prioritized, verifiable delivery work that improves UX, performance, maintainability, and the project’s differentiated “Post-Brutalist” identity.

---

## Working Principles

- Prefer **native web platform APIs** before adding dependencies.
- Pair every feature task with a **measurable verification step**.
- Ship in thin vertical slices: design, implementation, accessibility, and performance should land together.
- Preserve the portfolio’s core identity: **bold, tactile, interactive, and clearly hand-crafted**.

---

## Priority 0 — Baseline Audit and Success Metrics

**Status:** In progress

> Keep this section at **Not started** until the first baseline artifact is committed, move it to **In progress** once at least one artifact exists, and mark it **Complete** only after every verification item below is checked.

### 0.1 Establish the current baseline for performance, bundle size, and interaction quality

**Why this matters**

- The roadmap makes aggressive claims about faster routing, smaller bundles, and smoother interaction, but the repo needs a current baseline before work starts.

**Artifacts**

- [x] `docs/audits/baseline-2026-03-22.md`
- [ ] `docs/audits/lighthouse-home.json`
- [ ] `docs/audits/lighthouse-playground.json`

**Actionable tasks**

- [x] Record the current production build size and identify the largest client-side chunks.
- [x] Capture the current audit route pair as `/` and `/playground`, then define Lighthouse-style targets for LCP, INP, and CLS on those existing routes.
- [x] Inventory where Framer Motion, custom modal logic, and `useEffect`-driven async/browser work are currently used.
- [x] Document the findings in a short engineering note so future PRs can compare against a stable reference.
- [x] Add a repeatable baseline runbook tied to the repo’s existing scripts.

**Verification**

- [ ] Run Lighthouse for `/` and save the JSON output to `docs/audits/lighthouse-home.json`.
- [ ] Run Lighthouse for `/playground` and save the JSON output to `docs/audits/lighthouse-playground.json`.
- [x] Run `pnpm build` and save the generated bundle summary.
- [x] Run the project’s existing test and lint suite before making architecture changes.
- [x] Confirm there is a written baseline artifact checked into the repo or attached to the implementation PR.

**Definition of done**

- [ ] Baseline metrics exist for performance and bundle size.
- [x] The major refactor targets are listed by file/component.
- [ ] Future tasks below can cite concrete before/after numbers.

---

## Priority 1 — UX and Navigation Upgrades

### 1.1 Implement view-transition-driven page navigation

**Outcome**

- Route changes should feel continuous rather than abrupt, especially when moving from project grids into project detail views.

**Actionable tasks**

- Identify high-value transitions, starting with project card → project detail and global navigation link → destination page.
- Add route-aware view transition hooks around navigation events.
- Assign stable `view-transition-name` values to shared visual elements such as thumbnails, headings, and persistent chrome.
- Build a graceful fallback path for browsers that do not support the View Transitions API.
- Ensure transitions do not interfere with keyboard navigation, focus restoration, or reduced-motion preferences.

**Verification**

- Verify route navigation still works correctly with JavaScript and CSS transition support disabled.
- Test reduced-motion behavior and confirm animations are minimized or removed appropriately.
- Confirm no visual flicker occurs in persistent layout regions during navigation.
- Run `pnpm test:run` and `pnpm build` after the implementation.

**Definition of done**

- At least one core route flow uses shared-element or layout-preserving transitions.
- Unsupported browsers still receive correct content updates without regressions.
- Accessibility behavior remains intact.

### 1.2 Add predictive routing with Speculation Rules where safe

**Outcome**

- High-intent navigations should feel instant without over-consuming bandwidth.

**Actionable tasks**

- Identify routes with the highest likelihood of next-click behavior, such as top navigation items and featured project links.
- Add speculation rules with conservative eagerness settings.
- Scope prerendering to routes that are safe to prefetch and do not trigger sensitive side effects.
- Add guardrails so the feature can be disabled or limited if it hurts mobile bandwidth or debugging.

**Verification**

- Confirm speculation rules are emitted correctly in production output.
- Manually verify that prerendered pages do not execute unsafe side effects.
- Compare repeat navigation timing before and after the change.
- Run `pnpm build` and validate that generated HTML still passes existing CSP/SRI checks when relevant.

**Definition of done**

- Predictive routing is enabled for a small, intentional set of routes.
- There is a documented rollback strategy if metrics regress.

### 1.3 Rework the hero into a distinct anti-template landing experience

**Outcome**

- The hero should immediately communicate that this is a custom portfolio, not a commodity template.

**Actionable tasks**

- Audit the current hero for generic layout patterns.
- Redesign the hero with asymmetric composition, kinetic typography, and controlled overlap.
- Introduce lightweight depth/parallax only if it remains smooth on low-power devices.
- Make sure the visual treatment still preserves readability and clear calls to action.

**Verification**

- Review the hero at mobile, tablet, and desktop breakpoints.
- Confirm headings, CTA buttons, and key introductory copy remain readable at all sizes.
- If the change affects the running UI, capture a screenshot artifact for the implementation PR.
- Run `pnpm build` to ensure the redesigned hero does not break the production build.

**Definition of done**

- The hero is visually distinct, accessible, and performant.
- Layout overlap does not cause clipping, collision, or responsiveness issues.

---

## Priority 2 — Native Platform Refactors

### 2.1 Replace custom modal and overlay logic with Popover API plus persistent hidden state

**Outcome**

- Settings dialogs, command palettes, and similar overlays should rely more on the browser and less on custom JavaScript.

**Actionable tasks**

- Audit existing modal/palette implementations and identify duplicated focus, dismissal, and layering logic.
- Migrate the simplest overlay first using the `popover` attribute.
- Preserve hidden component state using React’s modern visibility/persistence patterns where appropriate.
- Remove obsolete escape-key handlers, focus-trap code, and overlay plumbing once parity is confirmed.
- Validate that top-layer behavior works with the portfolio’s theme and z-index system.

**Verification**

- Test keyboard open/close flows, outside-click dismissal, and focus return behavior.
- Confirm the overlay remains usable with only keyboard input.
- Run `pnpm lint` and `pnpm test:run` after each migrated overlay.
- Compare the before/after implementation to verify that custom overlay code was actually removed.

**Definition of done**

- At least one existing overlay is migrated end-to-end.
- Browser-native behavior replaces bespoke code without UX regressions.

### 2.2 Introduce CSS Anchor Positioning for contextual UI

**Outcome**

- Tooltips, contextual hints, or small detail cards should align intelligently without a dedicated positioning library.

**Actionable tasks**

- Pick one interaction with clear user value, such as skill-tag tooltips on project cards.
- Add anchor-based positioning for the trigger and floating element.
- Design fallback placement behavior for browsers that do not yet support the feature set.
- Remove any redundant JavaScript positioning logic where the browser now handles layout.

**Verification**

- Test positioning near viewport edges and inside constrained containers.
- Verify content remains accessible by keyboard and readable on touch devices.
- Confirm there is no dependency increase for functionality now handled by native CSS.
- Run `pnpm build` after implementation.

**Definition of done**

- One contextual UI pattern uses anchor positioning in production.
- The solution behaves acceptably in both supported and fallback environments.

### 2.3 Migrate eligible scroll effects from JavaScript animation to CSS scroll-driven techniques

**Outcome**

- Scroll-linked visuals should feel smoother and consume less main-thread time.

**Actionable tasks**

- Inventory existing scroll-triggered animations and split them into “easy CSS migration” vs. “keep in Framer Motion.”
- Convert simple fades, reveals, and parallax effects to CSS scroll/view timelines where browser support is acceptable.
- Keep Framer Motion only for interactions that truly need complex gesture or physics behavior.
- Document the browser support and fallback strategy so future contributors understand the tradeoffs.

**Verification**

- Compare animation smoothness before and after on a production build.
- Confirm reduced-motion preferences are respected.
- Measure bundle impact after removing or reducing JS animation usage.
- Run `pnpm build` and `pnpm test:run` after the migration.

**Definition of done**

- At least one scroll-driven interaction is CSS-first.
- The repo has a clear rule for when Framer Motion is still justified.

---

## Priority 3 — React 19 and Data Flow Cleanup

### 3.1 Eliminate `useEffect`-on-mount data fetching where router loaders or Suspense patterns are better

**Outcome**

- Route data should load predictably, reduce waterfalls, and integrate with better loading/error states.

**Actionable tasks**

- Find components that fetch data during mount.
- Group them by route-owned data versus component-local async work.
- Migrate route-owned data to React Router loaders first.
- Evaluate whether any remaining async UI should move to `use()`/Suspense-based patterns.
- Update loading and error UI so users get consistent states across routes.

**Verification**

- Confirm no migrated route still performs a duplicate client fetch on mount.
- Test loading, success, and error states manually.
- Run `pnpm lint` and `pnpm test:run` after each migrated route.
- Compare network waterfall behavior in development tools before and after the change.

**Definition of done**

- At least one route has been migrated away from mount-time data fetching.
- The replacement approach is documented for the rest of the app.

### 3.2 Modernize React internals: `useEffectEvent`, `ref` cleanup, and state persistence patterns

**Outcome**

- Internal code should be easier to reason about and less prone to stale-closure or ref-forwarding boilerplate.

**Actionable tasks**

- Audit effects with callback dependencies that are only present to keep closures fresh.
- Refactor suitable cases to `useEffectEvent`.
- Identify old `forwardRef` wrappers that can be simplified.
- Introduce persistent hidden-state patterns where they improve UX for chat, palette, or settings surfaces.

**Verification**

- Run `pnpm lint` to catch Hook usage regressions.
- Run `pnpm test:run` to confirm interactive behavior still works.
- Review the diff to ensure complexity is genuinely reduced rather than moved around.

**Definition of done**

- At least one effect and one ref-heavy component are simplified with modern React patterns.
- The repo has a repeatable standard for future modernization work.

### 3.3 Strengthen type and script verification for future refactors

**Outcome**

- The project should make it harder to merge regressions while the architecture evolves.

**Actionable tasks**

- Confirm whether TypeScript checks exist in the current toolchain and add them if applicable.
- Ensure lint, formatting, unit tests, and security scripts can be run reliably in local and CI workflows.
- Consider whether a single “verify” script should orchestrate the minimum safe pre-merge checks.

**Verification**

- Run `pnpm lint`, `pnpm format:check`, and `pnpm test:run`.
- Run targeted security checks already defined in `package.json` if the changed area touches security-sensitive code.
- Validate that any newly introduced verification script succeeds from a clean working tree.

**Definition of done**

- Verification expectations are explicit and easy to run.
- Contributors have one obvious way to confirm a refactor is safe.

---

## Priority 4 — Design System Evolution

### 4.1 Evolve “Neubrutalism” into a more tactile Post-Brutalist system

**Outcome**

- The visual language should stay bold while feeling more human, textured, and current.

**Actionable tasks**

- Define a small set of reusable texture motifs, such as noise, halftone accents, folded corners, or rubber-stamp treatments.
- Apply those motifs to high-value surfaces first: hero, featured cards, badges, and callouts.
- Keep the design system disciplined so texture becomes a signature rather than visual clutter.
- Document where texture is decorative versus where it communicates hierarchy or interaction.

**Verification**

- Review the interface in both theme modes, if multiple themes exist.
- Check contrast and readability for all textured surfaces.
- If UI changes are visible, capture screenshots for review.
- Run `pnpm build` after the visual update.

**Definition of done**

- Texture usage feels deliberate and repeatable.
- The visual change strengthens the portfolio identity without harming usability.

### 4.2 Migrate theme tokens toward OKLCH and container-aware components

**Outcome**

- Colors should be easier to tune perceptually, and components should adapt to their container rather than only the viewport.

**Actionable tasks**

- Audit current color tokens and identify candidates for OKLCH migration.
- Convert one theme slice at a time rather than rewriting every token at once.
- Identify card-like components that should respond to container size.
- Replace viewport-only assumptions with container query logic where it improves portability.

**Verification**

- Compare old and new color rendering across light/dark or alternate theme contexts.
- Test components in different layout containers, not just standard page grids.
- Run `pnpm build` and inspect for styling regressions.

**Definition of done**

- At least one token group uses OKLCH successfully.
- At least one reusable card component is container-query aware.

### 4.3 Redesign the blog/curriculum area as an archival index

**Outcome**

- Dense content should feel organized, browsable, and intentionally editorial.

**Actionable tasks**

- Audit the current information architecture for blog posts and curriculum content.
- Design a metadata-forward list or grid pattern with dates, tags, and reading cues.
- Add subtle motion only where it improves comprehension.
- Ensure the design supports expansion as more lessons and posts are added.

**Verification**

- Check scannability on mobile and desktop.
- Confirm metadata is readable and consistently formatted.
- Capture screenshots if a visible UI redesign is implemented.
- Run `pnpm build` after the change.

**Definition of done**

- The content index reads like a deliberate archive rather than a generic blog list.
- Information density improves without overwhelming the user.

---

## Priority 5 — Differentiated Interactive Features

### 5.1 Upgrade the AI assistant into a multimodal, voice-capable experience

**Outcome**

- The AI interaction should feel like a memorable product feature rather than a standard text chatbot.

**Actionable tasks**

- Split the work into phases: improved streaming text UX, voice interaction, then multimodal image critique.
- Define clear safety and cost boundaries for any live or multimodal API usage.
- Design an interface that makes conversation state, permissions, and loading states obvious.
- Add instrumentation or logging hooks to understand feature usage and failure modes.

**Verification**

- Validate text-only fallback behavior when voice or multimodal features are unavailable.
- Manually test interruption, reconnect, and long-response states.
- Re-run any AI- or security-related checks that apply to the changed code.
- Document environment-variable and API setup requirements.

**Definition of done**

- The first phase can be demoed reliably.
- Advanced capabilities are broken into smaller, reviewable milestones.

### 5.2 Introduce light-touch gamification without blocking content access

**Outcome**

- Exploration should feel playful, but the site must remain professional and immediately usable.

**Actionable tasks**

- Define a tiny achievement/XP model tied to real exploration milestones.
- Store progress locally without making content inaccessible.
- Add understated UI treatments for badges, unlocks, or hidden extras.
- Make sure the system is optional in spirit: rewarding, not distracting.

**Verification**

- Confirm all primary content is still accessible without engaging with gamified elements.
- Test persistence across reloads and route changes.
- Review whether the feature adds delight without cluttering the interface.
- Run `pnpm test:run` if logic is introduced for unlock state or progression rules.

**Definition of done**

- Gamification enhances discovery but never gates essential information.
- The UX remains coherent for visitors who ignore the feature entirely.

---

## Suggested Execution Order

1. **Baseline audit and verification hardening**
2. **View transitions and predictive routing**
3. **Popover/API-native refactors**
4. **Data-loading modernization**
5. **Scroll animation and bundle reduction work**
6. **Hero and design-system evolution**
7. **Archival content redesign**
8. **AI and gamification experiments**

---

## Required Verification Checklist for Any Future TODO Item

Before marking any task complete, verify the following when applicable:

- `pnpm lint`
- `pnpm format:check`
- `pnpm test:run`
- `pnpm build`
- Any targeted security checks relevant to the modified area
- Manual accessibility review for keyboard flow, focus handling, and reduced-motion behavior
- Screenshot evidence for visible UI changes
- Before/after notes for performance-sensitive work

---

## Notes for Future Contributors

- Avoid landing multiple speculative platform experiments in a single PR.
- Prefer one feature flag or one migration path at a time for anything involving browser support risk.
- If a feature cannot be measured, narrow its scope until it can be.
- If a feature looks impressive but weakens clarity, performance, or accessibility, it is not ready.
