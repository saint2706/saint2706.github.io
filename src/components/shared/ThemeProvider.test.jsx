import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './theme-context';
import * as storage from '../../utils/storage';

// Mock storage utils
vi.mock('../../utils/storage', () => ({
  safeGetLocalStorage: vi.fn(),
  safeSetLocalStorage: vi.fn(),
  safeSetDocumentTheme: vi.fn(),
}));

const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('liquid')}>Set Liquid</button>
      <button onClick={() => setTheme('invalid')}>Set Invalid</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    storage.safeGetLocalStorage.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default theme if storage is empty', () => {
    storage.safeGetLocalStorage.mockReturnValue(null);
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
    expect(storage.safeSetDocumentTheme).toHaveBeenCalledWith('neubrutalism');
  });

  it('initializes with stored theme if valid', () => {
    storage.safeGetLocalStorage.mockReturnValue('liquid');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
    expect(storage.safeSetDocumentTheme).toHaveBeenCalledWith('liquid');
  });

  it('initializes with default theme if stored theme is invalid', () => {
    storage.safeGetLocalStorage.mockReturnValue('invalid-theme');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });

  it('toggles theme', () => {
    storage.safeGetLocalStorage.mockReturnValue('neubrutalism');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
    expect(storage.safeSetLocalStorage).toHaveBeenCalledWith('preferred_theme', 'liquid');
    expect(storage.safeSetDocumentTheme).toHaveBeenCalledWith('liquid');

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });

  it('sets theme using startViewTransition if available', async () => {
    // Mock startViewTransition
    document.startViewTransition = vi.fn(cb => cb());

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setBtn = screen.getByText('Set Liquid');
    fireEvent.click(setBtn);

    expect(document.startViewTransition).toHaveBeenCalled();
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');

    // Cleanup
    delete document.startViewTransition;
  });

  it('sets theme directly if startViewTransition is not available', () => {
    // Ensure startViewTransition is undefined
    const original = document.startViewTransition;
    document.startViewTransition = undefined;

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setBtn = screen.getByText('Set Liquid');
    fireEvent.click(setBtn);

    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');

    if (original) document.startViewTransition = original;
  });

  it('prevents setting invalid theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setInvalidBtn = screen.getByText('Set Invalid');
    fireEvent.click(setInvalidBtn);

    // Should default to neubrutalism if invalid passed
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });
});
