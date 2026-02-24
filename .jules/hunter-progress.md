# Hunter Progress

## Session 1

- **Fixed Duplicate Code**: Refactored `TicTacToe.jsx`, `ChatInterface.jsx`, `RoastInterface.jsx`, and `Navbar.jsx` to use the shared `useFocusTrap` hook.
- **Improved Utility**: Updated `useFocusTrap` to support optional scroll locking (`preventScroll`).
- **Verified**: Build and Lint passed.

## Session 2

- **Fixed Duplicate Code**: Centralized `NB_SHADOW_COLOR_MAP` in `src/components/shared/ThemedPrimitives.utils.js` and removed duplicates from `ThemedButton.jsx` and `ThemedCard.jsx`.
- **Standardized Component**: Replaced custom SVG spinner in `ThemedButton.jsx` with shared `Loader2` from `lucide-react` to match `PageLoading.jsx`.
- **Verified**: Build and Lint passed.
