import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { safeGetLocalStorage, safeSetLocalStorage, safeSetDocumentTheme } from '../../utils/storage';
import { ThemeContext } from './theme-context';

const THEME_STORAGE_KEY = 'preferred_theme';
const THEMES = {
  neubrutalism: 'neubrutalism',
  liquid: 'liquid',
};

const normalizeTheme = theme => theme;

const isValidTheme = theme => [THEMES.neubrutalism, THEMES.liquid].includes(theme);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = safeGetLocalStorage(THEME_STORAGE_KEY, THEMES.neubrutalism);
    return isValidTheme(storedTheme) ? normalizeTheme(storedTheme) : THEMES.neubrutalism;
  });

  const setTheme = useCallback(nextTheme => {
    setThemeState(isValidTheme(nextTheme) ? normalizeTheme(nextTheme) : THEMES.neubrutalism);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === THEMES.neubrutalism ? THEMES.liquid : THEMES.neubrutalism));
  }, []);

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
