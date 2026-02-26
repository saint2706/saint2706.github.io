import { createContext, useContext } from 'react';

/**
 * Context for managing the application theme.
 * Provides the current theme, a function to set the theme, and a function to toggle between themes.
 */
export const ThemeContext = createContext({
  theme: 'neubrutalism',
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * Custom hook to access the theme context.
 * @returns {{theme: string, setTheme: Function, toggleTheme: Function}} The theme context value.
 */
export const useTheme = () => useContext(ThemeContext);
