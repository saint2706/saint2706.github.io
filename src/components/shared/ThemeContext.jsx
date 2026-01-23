import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'portfolio_theme';
const CLASSIC_KEY = 'classic_mode';

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // 'light' or 'dark' for Neubrutalism variants
    const [theme, setTheme] = useState('light');
    // classic mode is the old glassmorphism theme (triggered by Konami Code)
    const [isClassic, setIsClassic] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const savedClassic = localStorage.getItem(CLASSIC_KEY) === 'true';

        if (savedClassic) {
            setIsClassic(true);
        }

        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Check system preference for dark/light
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme classes to document root
    useEffect(() => {
        const root = document.documentElement;

        // Remove all theme classes first
        root.classList.remove('light', 'dark', 'classic');

        if (isClassic) {
            // Classic mode (old theme)
            root.classList.add('classic');
            if (theme === 'light') {
                root.classList.add('light');
            }
        } else {
            // Neubrutalism mode (default)
            if (theme === 'dark') {
                root.classList.add('dark');
            }
            // light mode is default (no class needed)
        }

        // Save to localStorage
        localStorage.setItem(THEME_KEY, theme);
        localStorage.setItem(CLASSIC_KEY, isClassic.toString());
    }, [theme, isClassic]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Only auto-switch if user hasn't explicitly set a preference
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const toggleClassic = () => {
        setIsClassic(prev => !prev);
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        isClassic,
        toggleClassic,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
