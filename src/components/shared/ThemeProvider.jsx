import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeSetDocumentTheme,
} from '../../utils/storage';
import { ThemeContext } from './theme-context';

const THEME_STORAGE_KEY = 'preferred_theme';
const THEMES = {
  neubrutalism: 'neubrutalism',
  liquid: 'liquid',
};

const isValidTheme = theme => [THEMES.neubrutalism, THEMES.liquid].includes(theme);

/**
 * Provides the application theme context to its children.
 * Handles theme retrieval, persistence, toggling, and View Transitions API.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to wrap.
 * @returns {JSX.Element} The ThemeContext provider.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = safeGetLocalStorage(THEME_STORAGE_KEY, THEMES.neubrutalism);
    return isValidTheme(storedTheme) ? storedTheme : THEMES.neubrutalism;
  });

  const applyTheme = useCallback(nextTheme => {
    setThemeState(isValidTheme(nextTheme) ? nextTheme : THEMES.neubrutalism);
  }, []);

  const setTheme = useCallback(
    nextTheme => {
      if (document.startViewTransition) {
        document.startViewTransition(() => applyTheme(nextTheme));
      } else {
        applyTheme(nextTheme);
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const next = theme === THEMES.neubrutalism ? THEMES.liquid : THEMES.neubrutalism;
    setTheme(next);
  }, [theme, setTheme]);

  useEffect(() => {
    safeSetDocumentTheme(theme);
    safeSetLocalStorage(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
