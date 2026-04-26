import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme, THEMES } from './theme-context';
import * as storage from '../../utils/storage';

// Mock storage
vi.mock('../../utils/storage', () => ({
  safeGetLocalStorage: vi.fn(),
  safeSetLocalStorage: vi.fn(),
  safeSetDocumentTheme: vi.fn(),
}));

const TestConsumer = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => setTheme(THEMES.liquid)}>Set Liquid</button>
      <button onClick={() => setTheme(THEMES.neubrutalism)}>Set Neubrutalism</button>
      <button onClick={() => setTheme(THEMES.neubrutalismDark)}>Set Neubrutalism Dark</button>
      <button onClick={() => setTheme(THEMES.liquidDark)}>Set Liquid Dark</button>
      <button onClick={() => setTheme('invalid')}>Set Invalid</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  const originalStartViewTransition = document.startViewTransition;

  beforeEach(() => {
    vi.clearAllMocks();
    storage.safeGetLocalStorage.mockReturnValue(null);
    document.startViewTransition = vi.fn(cb => { cb(); return { finished: Promise.resolve() }; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.startViewTransition = originalStartViewTransition;
  });

  it('renders children and provides default theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
    expect(storage.safeSetDocumentTheme).toHaveBeenCalledWith('neubrutalism');
  });

  it('initializes with stored theme if valid', () => {
    storage.safeGetLocalStorage.mockReturnValue('liquid');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
  });

  it('initializes with neubrutalism-dark if stored', () => {
    storage.safeGetLocalStorage.mockReturnValue('neubrutalism-dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism-dark');
  });

  it('initializes with liquid-dark if stored', () => {
    storage.safeGetLocalStorage.mockReturnValue('liquid-dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid-dark');
  });

  it('falls back to default if stored theme is invalid', () => {
    storage.safeGetLocalStorage.mockReturnValue('dark-mode-9000');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });

  it('sets specific theme correctly', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Liquid'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
    expect(storage.safeSetLocalStorage).toHaveBeenCalledWith('preferred_theme', 'liquid');

    fireEvent.click(screen.getByText('Set Neubrutalism'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');

    fireEvent.click(screen.getByText('Set Neubrutalism Dark'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism-dark');

    fireEvent.click(screen.getByText('Set Liquid Dark'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid-dark');
  });

  it('ignores invalid theme setting', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Invalid'));
    // Should remain on default (neubrutalism)
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });

  it('uses view transitions when available', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Liquid'));
    expect(document.startViewTransition).toHaveBeenCalled();
  });

  it('falls back when view transitions are unavailable', () => {
    delete document.startViewTransition;

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Liquid'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
    expect(storage.safeSetLocalStorage).toHaveBeenCalledWith('preferred_theme', 'liquid');
  });
});
