## 2024-05-23 - Framer Motion and Suspense Integration
**Learning:** When using `AnimatePresence` with `React.lazy` and `Suspense`, the `Suspense` boundary must be the direct child of `AnimatePresence` (or at least the keyed element) to ensure exit animations work correctly. The `key` prop must be moved from `Routes` to `Suspense` so `AnimatePresence` tracks the `Suspense` wrapper as the entering/exiting component.
**Action:** When implementing code splitting in `AnimatedRoutes`, wrap `Routes` in `Suspense` and apply the location key to `Suspense`.

## 2026-01-26 - Conditional Lazy Loading for Theme-Specific Features
**Learning:** Heavy components (like D3 charts) that are only visible in specific themes (e.g., Dark Mode) should be lazy loaded AND conditionally rendered. Simply using CSS (`hidden dark:block`) with static imports still bundles the heavy dependencies. Lazy loading them combined with `isDark && <Suspense>` ensures the code is only fetched when actually needed.
**Action:** Identify theme-specific features and use `React.lazy` + conditional rendering to split them from the main bundle.
