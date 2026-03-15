import { createContext, useContext } from 'react';

/**
 * Available theme names mapping.
 * @constant {Object}
 */
export const THEMES = {
  neubrutalism: 'neubrutalism',
  neubrutalismDark: 'neubrutalism-dark',
  liquid: 'liquid',
  liquidDark: 'liquid-dark',
};

/**
 * Theme Context
 * Provides the current theme and a function to change it.
 */
export const ThemeContext = createContext({
  theme: THEMES.neubrutalism,
  setTheme: () => {},
});

/**
 * Hook to access the ThemeContext easily.
 * @returns {Object} { theme, setTheme }
 */
export const useTheme = () => useContext(ThemeContext);
