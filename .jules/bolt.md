# Bolt Optimization Log

## Optimizations

### Frontend

- **Hero Component Memoization**: Wrapped the `Hero` component (`src/components/home/Hero.jsx`) in `React.memo` to prevent unnecessary re-renders when parent states change, especially given its position as the main landing page element and its relatively large UI tree. This is an initial defensive optimization to ensure the landing page remains snappy.

- **Playground Memoization**: Memoized `filteredSnippets` and `filters` array. Wrapped `SnippetCard` and `LivePreview` components in `React.memo`, passing `isCopied` directly to prevent unaffected cards from re-rendering when a snippet is copied.
- **Blog Memoization**: Extracted the blog card rendering logic into a new `BlogCard` component wrapped in `React.memo` to prevent re-rendering all blog cards when search or pagination state updates.
- **Projects Memoization**: Extracted static `cardColors` and `shadowColors` arrays into `useMemo` so they aren't instantiated on every render.
- **Games Memoization**: Extracted the static `games` configuration array into `useMemo` to prevent object recreation on every render.
- **Resume Memoization**: Wrapped the `Section` and `TimelineCard` components with `React.memo` to prevent unnecessary re-rendering during state updates like section toggling.
- **Chatbot Memoization**: Wrapped the `Chatbot` and `LoadingDialog` components with `React.memo` to prevent them from re-rendering unnecessarily during layout state changes.
- **Playground Memoization**: Extracted `cardColors` static array outside of `Playground` component to prevent recreation on every render.
- **Contact Memoization**: Wrapped static metadata like `description`, `title`, and `contactSchemas` in `useMemo` hooks to prevent recreation on every render.

## ⚡ Bolt Optimizations

1. **Blog.jsx:** Extracted static pure functions (`formatDate`, `getSourceColor`, `getSourceTextColor`) outside the component scope to avoid recreation on every render.
2. **Games.jsx:** Wrapped `GameTabButton` in `React.memo` and memoized `handleGameSelect` with `useCallback` to prevent unnecessary re-renders of the game tabs.
3. **Projects.jsx:** Wrapped `ProjectCard` in `React.memo` and refactored `handleCardClick` with `useCallback` to ensure stable references and avoid re-rendering the entire project grid when state changes.
4. **Contact.jsx:** Wrapped `handleChange` and `handleSubmit` in `useCallback` to ensure stable references for the form inputs.
5. **Hero.jsx:** Removed unnecessary `useMemo` wrapping around static strings that hurt performance.

6. **TicTacToe.jsx:** Extracted `TicTacToeCell` into a new component and wrapped it in `React.memo`. Memoized `getCellLabel` with `useCallback`. This prevents all 9 grid cells from re-rendering when a single cell is clicked or game state updates.
7. **MemoryMatch.jsx:** Extracted `MemoryMatchCard` into a new component and wrapped it in `React.memo`. This prevents all 16 cards from re-rendering every time a card is flipped or a match is found.
8. **WhackAMole.jsx:** Extracted `MoleHole` into a new component and wrapped it in `React.memo`. This avoids unnecessary re-rendering of all 9 holes whenever the timer counts down or a mole pops up/is whacked.

9. **SimonSays.jsx:** Extracted `SimonButton` component and wrapped it in `React.memo` to prevent re-rendering all 4 buttons whenever the game's state (such as the active sequence or current user turn) changes.
10. **Playground.jsx & Resume.jsx**: Wrapped top-level components in `React.memo` to prevent unnecessary re-renders when parent layout states change (e.g. from Custom Cursor updates). Also memoized `handlePrint` with `useCallback` to ensure a stable function reference.
11. **Navbar.jsx:** Extracted `DesktopNavItem` and `MobileNavItem` components and wrapped them in `React.memo` to prevent re-rendering unchanged links when the navbar state (like `isMenuOpen` or `isScrolled`) changes.
12. **SnakeGame.jsx:** Wrapped `handleTouchStart` and `handleTouchEnd` in `useCallback` to prevent redefining them on every render, ensuring stable function references for the game board container.
    \n## Added React.memo to root page components\nWrapped top-level page components (`Blog`, `Contact`, `Games`, `Projects`) in `React.memo()` and explicitly set `displayName`. This prevents full page re-renders when parent layout state (such as custom cursor or focus states) updates.
13. **ChatInterface.jsx:** Wrapped `handleSendMessage`, `handleSubmit`, and `handleClearClick` in `useCallback` to prevent redefining these functions on every render.
    \n14. **ChatInterface.jsx:** Extracted `scrollToBottom` logic directly into `useEffect` and memoized the quick reply click handler with `useCallback` to prevent unnecessary function allocations on every render for each quick reply button.
14. **Chatbot.jsx:** Wrapped `openChat` and `openRoast` handlers in `useCallback` to prevent unnecessary re-creations on every render.

## TerminalMode Optimization (Date: 2023-10-27)

- **Bottleneck:** The `TerminalMode` component rendered an array of `<pre>` tags based on the `history` state. As the user typed in the `input` state, the entire `history` array was forced to re-render on every keystroke.
- **Improvement:** Extracted the output lines into a new `TerminalLine` component wrapped in `React.memo()`. I also wrapped the entire `TerminalMode` component in `React.memo()`. Furthermore, I extracted the `lineColor` configuration object out of the component to prevent it from being re-created on each render.
- **Metrics:** Reduced O(N) re-renders (where N is the number of terminal lines in the history buffer) down to O(1) during user typing, significantly improving input latency and overall interface responsiveness.

- **[PERF] Optimized \`MarqueeTicker\` props in \`Footer.jsx\`**: Extracted the inline \`items\` array into a memoized variable using \`useMemo\`. This prevents the array from being recreated on every re-render of the \`Footer\` component, which is particularly beneficial given the frequent Layout state updates (e.g., custom cursor mouse movements).

## Static Configuration Extraction (Date: 2024-03-XX)

- **Bottleneck:** Components like `CustomCursor` and `NbDecorative` (`TapeStrip`, `StampBadge`, `DoodleDivider`) contained static configuration objects (e.g., color maps, spring configurations, variants) defined directly within their render functions. This caused unnecessary memory allocations and potential reference-equality breakages on every render cycle.
- **Improvement:** ⚡ Bolt: Extracted static configuration objects outside of components to prevent unnecessary memory allocations on every render cycle. Created a memoized-like pure function `getVariants(isLiquid)` for variants that depend on theme state.
- **Metrics:** Reduced garbage collection pressure and eliminated unnecessary re-instantiations of objects like `springConfig` passed into hooks, improving the smoothness of continuous interactions like mouse movements.

- **[PERF] Extracted static style and animation objects in Hero and HeroBackground**: Extracted static `style` objects, `initial`, `animate`, and `transition` objects passed to `motion` elements into constants defined outside the `Hero` and `HeroBackground` components. This prevents these objects from being recreated on every render cycle, reducing memory allocations and garbage collection overhead.

- **[PERF] Optimized rendering in CommandPalette**: Extracted `CommandItem` into a separate memoized component (`React.memo`) in `src/components/shared/CommandPalette.jsx`. This prevents the entire command list from re-rendering on every keystroke or selection change.
- **[PERF] Extracted static array in NotFound**: Extracted the `QUICK_LINKS` array out of the `NotFound` component rendering logic in `src/components/pages/NotFound.jsx` to avoid reallocating memory on every re-render.
- **[PERF] Optimized routes rendering in App**: Wrapped `ScrollToTopHelper` and `AnimatedRoutes` components with `React.memo` in `src/App.jsx` to prevent them from re-rendering unnecessarily during broader app state updates.

- Moved static array (`QUICK_LINKS`) from `import` declaration in `NotFound.jsx` to correctly resolve `import/first` lint error. Removed testing artifacts from repository to ensure code cleanliness.
  ⚡ Bolt: Optimized React.memo array creations in pages

- **[PERF] Optimized event handlers in Navbar**: Wrapped `handleCloseMenu` in `useCallback` to stabilize its reference. Replaced inline arrow functions for `MobileNavItem` click and keydown handlers with memoized functions `handleMobileNavLinkClick` and `handleMobileNavLinkKeydown` to prevent re-renders in child components on every render cycle.

- **[PERF] Extracted animation variants in Playground**: Extracted the `container` and `item` motion variant objects in `src/components/pages/Playground.jsx` into `useMemo` hooks. This prevents them from being unnecessarily re-allocated and re-created during each render cycle, improving the React tree reconciliation performance.
- **[PERF] Memoized Markdown node renderers in ChatInterface**: Wrapped the `LinkRenderer`, `ImageRenderer`, and `CodeRenderer` component definitions inside `src/components/shared/ChatInterface.jsx` with `React.memo()`. This prevents them from re-rendering unless their specific props change, significantly reducing computational overhead during the otherwise-expensive dynamic rendering of the `ReactMarkdown` tree.
- [PERF] Optimized `mainFabShell`, `roastFabShell`, and `chatFabShell` objects in `Chatbot.jsx` by wrapping their creation in `React.useMemo`. This prevents these objects from being recreated on every render cycle and reduces memory allocations.

- **[PERF] Extracted animation variants in Modal**: Extracted `backdropVariants`, `modalVariants`, `backdropTransition`, and `modalTransition` objects outside of the `Modal` functional component in `src/components/shared/Modal.jsx`. Wrapped `Modal` in `React.memo` and explicitly set its `displayName`. This prevents unnecessary memory allocations of static motion properties and prevents re-renders when parent states change, improving overall app responsiveness.

- **[PERF] Extracted static style objects across pages**: Extracted inline `style` objects passed to components (e.g. `ThemedCard`, `ThemedChip`, `ThemedButton`) into constants outside of the render function in `src/components/home/Hero.jsx`, `src/components/pages/Playground.jsx`, `src/components/pages/Projects.jsx`, `src/components/pages/Contact.jsx`, and `src/components/pages/Resume.jsx`. This prevents React from re-allocating new objects on every render cycle, reducing memory garbage collection overhead and preventing unnecessary child re-renders.
- **[PERF] Optimized lazy loading in Layout**: Conditionally wrapped `<CommandPalette>` and `<TerminalMode>` inside the `<Suspense>` boundary in `src/components/layout/Layout.jsx` so they only render when `isCommandPaletteOpen` or `isTerminalOpen` is true. This prevents the browser from immediately fetching these lazy-loaded chunks when the layout mounts, significantly improving initial bundle load performance.

- **[PERF] Extracted static complex components in `React.memo`**: Wrapped `Minesweeper`, `SimonSays`, `WhackAMole`, `SnakeGame`, `LightsOut`, `MemoryMatch`, `TicTacToe`, and `ScrollToTop` inside `React.memo()`. As these components have a lot of complex internal states and nested DOM elements, applying `React.memo()` prevents them from unnecessary re-rendering whenever parent components change (like layout shifts, theme toggle, or navigation).

## Extracted Static Animation Variants

- **Problem:** Inline animation variants defined inside a React component (e.g. `initial={{ opacity: 0 }}`) cause new object references to be created on every render. This forces React (and Framer Motion) to perform unnecessary diffing and can trigger re-renders in deep component trees, wasting CPU cycles and garbage collection overhead.
- **Solution:** I extracted the `emptyStateVariants` object statically outside the `Playground` component so the reference is stable across renders. I then referred to it using the standard `variants={emptyStateVariants}` pattern with string references for states (`initial="initial"`).
- **Files Modified:** `src/components/pages/Playground.jsx`
- **Impact:** Reduces object allocation and unnecessary render work when the Playground component mounts or re-renders.
  > > [PERF] Lazy load SettingsModal to reduce initial bundle size
- **[PERF] Throttled scroll event in Navbar**: Replaced the direct `window.addEventListener('scroll', handleScroll)` approach in `src/components/layout/Navbar.jsx` with a `requestAnimationFrame` throttled event handler. This significantly reduces the frequency of state updates and re-renders while scrolling in the Liquid theme, preventing layout thrashing and improving scroll frame rates.
- Avoid wrapping simple string concatenations (like generating class names) in `useCallback`. The hook execution and dependency tracking overhead exceeds the cost of native string evaluation and garbage collection.

- Reduced main thread blocking and React render allocations by migrating the scroll listener in `ScrollToTop` from `setTimeout` throttling to `requestAnimationFrame` gating, and extracting Framer Motion variants into static constants.

- **[PERF] Extracted simple strings and string returns from useCallback and useMemo**: Extracted `getCellLabel` outside of `TicTacToe` and `description` / `title` strings outside of `Contact` components. This removes the hook's execution and dependency tracking overhead which exceeded the cost of native evaluation and garbage collection.

## ⚡ Bolt Learnings:

- **Optimization Strategy**: Removed `useMemo` and state allocations for static constants like `cardColors` and `shadowColors` in `src/components/pages/Projects.jsx`.
- **Result**: Reduced memory allocation and component initialization time on re-renders, further optimizing the component tree since the data never changes.
