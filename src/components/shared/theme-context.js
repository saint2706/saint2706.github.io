import { createContext, useContext } from 'react';

export const ThemeContext = createContext({
  theme: 'neubrutalism',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
