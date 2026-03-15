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
