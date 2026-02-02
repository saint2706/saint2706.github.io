## 2026-02-02 - Cascading Renders in Layout and Pages
**Learning:** The codebase has multiple instances of `setState` calls inside `useEffect` without conditions or in a way that triggers immediate re-renders (cascading renders). This is flagged by the linter (`react-hooks/set-state-in-effect`) and hurts performance by forcing React to render twice.
**Action:** In future optimizations, refactor these state updates to happen during event handling or derive state during render where possible.

## 2026-02-02 - Bundle Splitting Effectiveness
**Learning:** Using `manualChunks` to separate stable vendors (React, Framer Motion) from application code significantly cleaner output in `dist/assets` and likely improves caching.
**Action:** Always check `vite.config.js` for `manualChunks` in React projects with large dependencies like `framer-motion` or `three.js`.
