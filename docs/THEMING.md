# Theming System

The Rishabh Portfolio features a unique dual-theme system that allows users to toggle between two distinct visual styles: **Neubrutalism** and **Liquid**.

## Core Concepts

### 1. Theme Context
The active theme is managed by `ThemeContext` (`src/components/shared/theme-context.js`).
-   `theme`: Current theme string ('neubrutalism' | 'liquid').
-   `toggleTheme`: Function to switch themes.

### 2. CSS Variables & Tailwind
The application uses Tailwind CSS v4. Theme-specific styles are applied using:
-   **CSS Variables**: Defined in `index.css`, these variables change values based on the `[data-theme]` attribute on the root element.
-   **Tailwind Classes**: Components conditionally apply different Tailwind classes based on the `theme` value from the context.

## Theme Characteristics

### Neubrutalism (`neubrutalism`)
-   **Aesthetic**: Bold, raw, high-contrast, "web 1.0" vibes.
-   **Key Features**:
    -   Thick black borders (`border-nb`, `border-2`, `border-black`).
    -   Hard shadows (`box-shadow: 4px 4px 0px #000`).
    -   Vibrant, flat colors (Yellow, Pink, Blue).
    -   Monospace and strong sans-serif typography.
    -   Rectangular shapes with minimal rounding.

### Liquid (`liquid`)
-   **Aesthetic**: Soft, ethereal, translucent, "glassmorphism".
-   **Key Features**:
    -   Glass effects (`backdrop-blur`, `bg-white/10`).
    -   Soft gradients and glows.
    -   Rounded corners (`rounded-2xl`, `rounded-full`).
    -   Fluid animations and transitions.
    -   Subtle, colored shadows.

## Styling Components

### Using `useTheme`
Most components should consume the theme context directly:

```jsx
import { useTheme } from '../shared/theme-context';

const MyComponent = () => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  return (
    <div className={isLiquid ? 'bg-glass rounded-xl' : 'border-2 border-black bg-white'}>
      Content
    </div>
  );
};
```

### Shared Utilities
For common UI patterns, use the shared utilities to avoid code duplication.

#### `getOverlayShell`
Generates the container styles for modals, cards, and floating elements.
Located in `src/components/shared/ThemedPrimitives.utils.js`.

```javascript
import { getOverlayShell } from '../shared/ThemedPrimitives.utils';

const shell = getOverlayShell({ theme, tone: 'card', depth: 'hover' });

return (
  <div className={shell.className} style={shell.style}>
    ...
  </div>
);
```

#### `gameThemeStyles`
 centralized styles for game components (scoreboards, tiles, overlays).
Located in `src/components/games/gameThemeStyles.js`.

```javascript
import { getGameThemeStyles } from './gameThemeStyles';

const ui = getGameThemeStyles(isLiquid);

return (
  <div className={ui.scoreboard}>
    <span className={ui.text}>Score: 100</span>
  </div>
);
```

### Animation (`themeMotion.js`)
Use `getLiquidRevealVariant` from `src/components/shared/themeMotion.js` for theme-aware entry animations, especially for the "Liquid" theme which relies heavily on fluid motion.

## Adding a New Theme
Currently, the system is designed for two specific themes. Adding a third would require:
1.  Updating `ThemeContext` types.
2.  Adding new CSS variable definitions in `index.css`.
3.  Updating `ThemedPrimitives.utils.js` and `gameThemeStyles.js` to handle the new case.
4.  Auditing all components that conditionally render based on `isLiquid`.
