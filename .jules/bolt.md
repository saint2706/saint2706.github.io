# Bolt

## 2024-05-23 - Framer Motion and Suspense Integration

**Learning:** When using `AnimatePresence` with `React.lazy` and `Suspense`, the `Suspense` boundary must be the direct child of `AnimatePresence` (or at least the keyed element) to ensure exit animations work correctly. The `key` prop must be moved from `Routes` to `Suspense` so `AnimatePresence` tracks the `Suspense` wrapper as the entering/exiting component.
**Action:** When implementing code splitting in `AnimatedRoutes`, wrap `Routes` in `Suspense` and apply the location key to `Suspense`.

## 2026-01-26 - Conditional Lazy Loading for Theme-Specific Features

**Learning:** Heavy components (like D3 charts) that are only visible in specific themes (e.g., Dark Mode) should be lazy loaded AND conditionally rendered. Simply using CSS (`hidden dark:block`) with static imports still bundles the heavy dependencies. Lazy loading them combined with `isDark && <Suspense>` ensures the code is only fetched when actually needed.
**Action:** Identify theme-specific features and use `React.lazy` + conditional rendering to split them from the main bundle.

## 2026-05-24 - Recursive Lazy Loading Pitfall

**Learning:** Lazy loading child components (like `ChatInterface` inside `Chatbot`) is insufficient if the parent container (`Chatbot`) is statically imported in the main entry point (`App.jsx`). The parent component's code and its immediate dependencies (even if small) will still be part of the initial bundle.
**Action:** Always lazy load the top-level container of non-critical widgets (like FABs or modals) in the main layout to ensure true code splitting.
