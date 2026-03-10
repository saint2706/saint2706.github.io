import { createContext, useContext } from 'react';

/**
 * Theme identifiers for all 4 available themes.
 * Used for validation and theme picker rendering.
 */
export const THEMES = {
  neubrutalism: 'neubrutalism',
  neubrutalismDark: 'neubrutalism-dark',
  liquid: 'liquid',
  liquidDark: 'liquid-dark',
};

/**
 * Context for managing the application theme.
 * Provides the current theme and a function to set the theme.
 */
export const ThemeContext = createContext({
  theme: THEMES.neubrutalism,
  setTheme: () => {},
});

/**
 * Custom hook to access the theme context.
 * @returns {{theme: string, setTheme: Function}} The theme context value.
 */
export const useTheme = () => useContext(ThemeContext);
