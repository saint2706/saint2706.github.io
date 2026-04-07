# Hunter Progress

## Session 1

- **Fixed Duplicate Code**: Refactored `TicTacToe.jsx`, `ChatInterface.jsx`, `RoastInterface.jsx`, and `Navbar.jsx` to use the shared `useFocusTrap` hook.
- **Improved Utility**: Updated `useFocusTrap` to support optional scroll locking (`preventScroll`).
- **Verified**: Build and Lint passed.

## Session 2

- **Fixed Duplicate Code**: Centralized `NB_SHADOW_COLOR_MAP` in `src/components/shared/ThemedPrimitives.utils.js` and removed duplicates from `ThemedButton.jsx` and `ThemedCard.jsx`.
- **Standardized Component**: Replaced custom SVG spinner in `ThemedButton.jsx` with shared `Loader2` from `lucide-react` to match `PageLoading.jsx`.
- **Verified**: Build and Lint passed.

## Session 3

- **Fixed Duplicate Code**: Created `src/components/shared/useIsMounted.js` to centralize component mount tracking logic.
- **Refactored Components**: Updated `ChatInterface.jsx` and `RoastInterface.jsx` to use the shared `useIsMounted` hook, removing repetitive `useRef`/`useEffect` patterns.
- **Verified**: Build and Lint passed. Tests for `ChatInterface` passed.

## Session 4

- **Fixed Runtime Safety**: Updated `src/components/shared/CustomCursor.jsx` to handle text nodes safely by checking `nodeType` and accessing the parent node before checking matches. This prevents runtime errors when hovering over text directly.
- **Verified**: Build and Lint passed.

## Session 5

- **Fixed Formatting**: Fixed Prettier formatting violation in `src/data/blogs.json` preventing `pnpm run format:check` from passing.
- **Fixed Lint Warning**: Addressed incomplete `// eslint-disable-next-line` in `src/components/games/LightsOut.jsx` by explicitly declaring the `react-hooks/set-state-in-effect` rule that caused an ESLint error when running `pnpm run lint`.
- **Verified**: Build, Lint, and Tests passed.

## Session 6

- **Fixed Code Cleanliness**: Removed `console.error` logs that were not easter eggs across `src/components/shared/RoastInterface.jsx`, `src/components/shared/PythonRunner.jsx`, `src/components/shared/ChatInterface.jsx`, `src/components/pages/Playground.jsx`, and `src/services/ai.js`.
- **Fixed Unused Variables**: Removed the `error` argument entirely from empty catch blocks in the aforementioned files to prevent lint errors.
- **Verified**: Build, Lint, and Tests passed cleanly.

## Session 7

- **Fixed Unused Variables**: Refactored `framer-motion` mocks in test files (`LightsOut`, `Minesweeper`, `SnakeGame`, `SimonSays`, `TicTacToe`, `MemoryMatch`, `WhackAMole`) to dynamically filter out animation properties from `props` instead of destructuring them into unused variables. Removed corresponding `eslint-disable-next-line` comments.
- **Fixed Code Cleanliness**: Removed an unused `ms` argument from a `setInterval` mock in `SnakeGame.test.jsx`.
- **Fixed Code Cleanliness**: Commented out `console.warn` statements in `src/components/shared/ChatInterface.jsx` and used ES2019 optional catch binding (`catch { ... }`) to remove unused error variables.
- **Verified**: Build, Lint, and Tests passed cleanly.

## Session 8

- **Fixed Lint Warnings**: Removed unused `eslint-disable-next-line no-console` directives in `src/main.jsx` and `src/components/pages/NotFound.jsx`.
- **Fixed JSDoc Types**: Fixed JSDoc `@example` formatting in `src/services/ai.js` to prevent `@typescript-eslint` or similar tools from parsing `console.log` and warning about it.
- **Verified**: Build, Lint, and Tests passed cleanly.

## Session 9

- **Fixed Code Cleanliness**: Removed commented out `console.warn` statements in `src/components/shared/ChatInterface.jsx` and added informative `// Ignore load errors` and `// Ignore save errors` comments in the empty catch blocks to clearly indicate intent.
- **Verified**: Build, Lint, and Tests passed cleanly.
- **Fixed Formatting**: Fixed formatting issues in `src/data/blogs.json` to ensure `pnpm run format:check` passes in CI.

## Session 10

- **Fixed Code Cleanliness**: Removed `console.log` statements in `src/main.jsx` and `src/components/pages/NotFound.jsx` (which were easter eggs but technically console statements).
- **Verified**: Build and Lint passed ✅.

## Session 11

- **Fixed Lint Warnings**: Replaced inline control character regex `[\x00-\x08...]` with dynamically constructed regex string in `src/utils/security.js` to fix the `no-control-regex` linting rule violation while maintaining exact logic. Removed the corresponding `eslint-disable-next-line` directive.
- **Verified**: Build and Lint passed.

## Session 12

- **Fixed Code Cleanliness**: Removed `console.warn` statements in `src/components/pages/Projects.jsx` and `src/components/pages/Contact.jsx`.
- **Verified**: Build, Lint, and Tests passed.

## Session 13

- **Fixed Lint Warnings**: Resolved `react-hooks/set-state-in-effect` lint warnings in `src/components/games/LightsOut.jsx`, `src/components/shared/TerminalMode.jsx`, and `src/components/shared/CommandPalette.jsx` by refactoring state updates into the render phase or event handlers without using `eslint-disable-next-line`.
- **Fixed Lint Warnings**: Resolved `react-hooks/exhaustive-deps` lint warning in `src/components/layout/Navbar.jsx` by refactoring dependency arrays and utilizing render phase state updates.
- **Verified**: Build, Lint, and Tests passed.

## Session 14

- **Fixed Dead Code**: Removed unused file `src/components/home/FloatingIcon.jsx` and its import in `src/components/home/Hero.jsx`.
- **Fixed Unused Dependencies**: Removed unused dependencies `date-fns`, `date-fns-tz`, `@tailwindcss/line-clamp`, `baseline-browser-mapping`, and `markdown-link-check` from `package.json`.
- **Fixed Duplicate Exports**: Removed default export of `useFocusTrap` from `src/components/shared/useFocusTrap.js` as it is already exported as a named export.
- **Fixed Unused Exports**: Removed unused exports from `src/components/shared/NbDecorative.jsx`, `src/components/shared/SkeletonLoader.jsx`, `src/data/snippets.js`, and `src/utils/seo.js`.
- **Verified**: Build and Lint passed ✅.

## Session 15

- **Fixed Duplicate Code**: Removed duplicate import of `./theme-context` in `src/components/shared/SettingsModal.jsx`.
- **Verified**: Build and Lint passed ✅.

## Session 16

- **Fixed Unused Exports**: Removed unused exports from `src/components/shared/chatHistory.js` (`MAX_HISTORY_CONTEXT`) and `src/data/snippets.js` (`snippets`).
- **Verified**: Build and Lint passed ✅.

## Session 17

- **Fixed Runtime Safety**: Refactored tests in `src/components/layout/Layout.test.jsx` to wrap rendering in `act()` and await `findByRole` to correctly handle `Suspense` and `React.lazy` resolutions for React 19 test environments, eliminating `A suspended resource finished loading inside a test` errors from stderr.
- **Verified**: Build, Lint, Format, and Tests passed ✅.

## Session 18

- **Fixed Unused Exports**: Removed unused `BlogSkeleton`, `ProjectSkeleton`, and `ChatSkeleton` exports in `src/components/shared/SkeletonLoader.jsx`. Removed unused `getStartViewTransition` and `canAnimateViewTransitions` exports from `src/navigation/viewTransitionNavigate.ts`.
- **Verified**: Build, Lint, and Tests passed cleanly.

## Session 19

- **Fixed Runtime Safety**: Resolved `no-unused-vars` lint warnings in `src/components/layout/Navbar.test.jsx` by properly destructuring and omitting Framer Motion-specific props (`initial`, `animate`, `exit`, `transition`) in the `motion.div` and `motion.nav` mocks, ensuring standard HTML elements don't receive these props.
- **Fixed Cleanliness**: Added `vi.restoreAllMocks()` in the `afterEach` hook of `src/components/layout/Navbar.test.jsx` to prevent mock leakage across test files.
- **Verified**: Build, Lint, Format, and Tests passed cleanly.

## Session 20

- **Fixed Runtime Safety**: Wrapped remaining `fireEvent` calls in `act(...)` blocks across `src/components/games/WhackAMole.test.jsx`, `src/components/games/MemoryMatch.test.jsx`, and `src/components/games/SimonSays.test.jsx` to eliminate React 19 test environment warnings.
- **Verified**: Build, Lint, Format, and Tests passed cleanly.

## Session 21

- **Fixed Runtime Safety**: Added `cleanup()` from `@testing-library/react` to the `afterEach` hook before flushing timers in game component tests (`LightsOut`, `SnakeGame`, `TicTacToe`, `Minesweeper`, `SimonSays`, `MemoryMatch`, `WhackAMole`) to resolve remaining `not wrapped in act(...)` warnings.
- **Verified**: Build, Lint, Format, and Tests passed cleanly.

## Session 22

- **Fixed Dead Code**: Removed unused file `src/hooks/useViewTransitionActive.js` and its test file `src/hooks/useViewTransitionActive.test.js`. The hook was completely unimported and no longer used anywhere in the codebase.
- **Verified**: Build, Lint, Format, and Tests passed cleanly.
