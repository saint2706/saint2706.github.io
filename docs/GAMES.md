# Adding New Games

The portfolio is designed to be a playground for interactive experiments. Adding a new game is straightforward thanks to the modular architecture and shared theming utilities.

## Step-by-Step Guide

### 1. Create the Game Component
Create a new file in `src/components/games/`, e.g., `MyNewGame.jsx`.

```jsx
import React, { useState, useMemo } from 'react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

const MyNewGame = () => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  // 1. Get theme styles
  const ui = useMemo(() => getGameThemeStyles(isLiquid), [isLiquid]);

  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 2. Use shared scoreboard styles */}
      <div className={ui.scoreboard} style={ui.style.raised}>
        <span className="font-heading font-bold">Score: {score}</span>
      </div>

      {/* 3. Game Board */}
      <div className={ui.boardShell} style={ui.style.board}>
        {/* Game logic here */}
        <button
          className={ui.buttonPrimary}
          onClick={() => setScore(s => s + 1)}
        >
          Click Me
        </button>
      </div>
    </div>
  );
};

export default MyNewGame;
```

### 2. Use Shared Hooks
Leverage shared hooks for consistent behavior:
-   `useReducedMotion`: From `framer-motion` to respect accessibility settings.
-   `useFocusTrap`: If your game has modals or overlays.
-   `useIsMounted`: If you have async game logic.

### 3. Register the Game
1.  Import your game in `src/components/pages/Games.jsx`.
2.  Add it to the `GAMES_CONFIG` array.

```javascript
// src/components/pages/Games.jsx
import MyNewGame from '../games/MyNewGame';

const GAMES_CONFIG = [
  // ... existing games
  {
    id: 'my-new-game',
    title: 'My New Game',
    description: 'A description of the game.',
    component: MyNewGame,
    icon: MyGameIcon, // Import an icon from lucide-react
    color: 'text-fun-pink' // or text-accent, text-fun-yellow
  }
];
```

### 4. Testing
-   Add unit tests in `src/components/games/MyNewGame.test.jsx`.
-   Verify accessibility (keyboard navigation, ARIA labels).
-   Test in both themes to ensure styles look correct.

## Best Practices
-   **Performance**: Use `React.memo` for game pieces (tiles, cells) to prevent re-rendering the entire board on every state change. See `SnakeGame.jsx` or `Minesweeper.jsx` for examples.
-   **Accessibility**: Ensure all interactive elements are keyboard accessible (`tabIndex={0}`, `onKeyDown`). Provide screen-reader-only text for visual-only updates.
-   **State Management**: Keep game state local to the component unless it needs to persist (use `localStorage` for high scores).
