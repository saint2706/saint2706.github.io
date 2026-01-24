## 2024-05-23 - Framer Motion and Suspense Integration
**Learning:** When using `AnimatePresence` with `React.lazy` and `Suspense`, the `Suspense` boundary must be the direct child of `AnimatePresence` (or at least the keyed element) to ensure exit animations work correctly. The `key` prop must be moved from `Routes` to `Suspense` so `AnimatePresence` tracks the `Suspense` wrapper as the entering/exiting component.
**Action:** When implementing code splitting in `AnimatedRoutes`, wrap `Routes` in `Suspense` and apply the location key to `Suspense`.
