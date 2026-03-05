# Bolt Optimization Log

## Optimizations

### Frontend

- **Hero Component Memoization**: Wrapped the `Hero` component (`src/components/home/Hero.jsx`) in `React.memo` to prevent unnecessary re-renders when parent states change, especially given its position as the main landing page element and its relatively large UI tree. This is an initial defensive optimization to ensure the landing page remains snappy.

- **Playground Memoization**: Memoized `filteredSnippets` and `filters` array. Wrapped `SnippetCard` and `LivePreview` components in `React.memo`, passing `isCopied` directly to prevent unaffected cards from re-rendering when a snippet is copied.
- **Blog Memoization**: Extracted the blog card rendering logic into a new `BlogCard` component wrapped in `React.memo` to prevent re-rendering all blog cards when search or pagination state updates.
- **Projects Memoization**: Extracted static `cardColors` and `shadowColors` arrays into `useMemo` so they aren't instantiated on every render.
- **Games Memoization**: Extracted the static `games` configuration array into `useMemo` to prevent object recreation on every render.
- **Resume Memoization**: Wrapped the `Section` and `TimelineCard` components with `React.memo` to prevent unnecessary re-rendering during state updates like section toggling.

## ⚡ Bolt Optimizations

1. **Blog.jsx:** Extracted static pure functions (`formatDate`, `getSourceColor`, `getSourceTextColor`) outside the component scope to avoid recreation on every render.
2. **Games.jsx:** Wrapped `GameTabButton` in `React.memo` and memoized `handleGameSelect` with `useCallback` to prevent unnecessary re-renders of the game tabs.
3. **Projects.jsx:** Wrapped `ProjectCard` in `React.memo` and refactored `handleCardClick` with `useCallback` to ensure stable references and avoid re-rendering the entire project grid when state changes.
4. **Contact.jsx:** Wrapped `handleChange` and `handleSubmit` in `useCallback` to ensure stable references for the form inputs.
5. **Hero.jsx:** Removed unnecessary `useMemo` wrapping around static strings that hurt performance.
