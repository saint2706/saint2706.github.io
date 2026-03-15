import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { useTheme, THEMES } from './theme-context';

describe('theme-context', () => {
    it('has expected THEMES object', () => {
        expect(THEMES).toEqual({
            neubrutalism: 'neubrutalism',
            neubrutalismDark: 'neubrutalism-dark',
            liquid: 'liquid',
            liquidDark: 'liquid-dark',
        });
    });

    it('provides default context values', () => {
        const TestComponent = () => {
            const { theme, setTheme } = useTheme();
            return (
                <div>
                    <span data-testid="theme">{theme}</span>
                    <button data-testid="btn" onClick={() => setTheme(THEMES.liquid)}>Set Theme</button>
                </div>
            );
        };

        render(<TestComponent />);
        expect(screen.getByTestId('theme')).toHaveTextContent('neubrutalism');

        // Ensure default setTheme is a no-op function and doesn't crash
        const btn = screen.getByTestId('btn');
        btn.click();
    });
});
