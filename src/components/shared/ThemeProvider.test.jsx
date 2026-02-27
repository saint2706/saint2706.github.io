import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './theme-context';
import * as storage from '../../utils/storage';

// Mock storage
vi.mock('../../utils/storage', () => ({
  safeGetLocalStorage: vi.fn(),
  safeSetLocalStorage: vi.fn(),
  safeSetDocumentTheme: vi.fn(),
}));

// Mock View Transition
document.startViewTransition = vi.fn(cb => cb());

const TestConsumer = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('liquid')}>Set Liquid</button>
      <button onClick={() => setTheme('neubrutalism')}>Set Neubrutalism</button>
      <button onClick={() => setTheme('invalid')}>Set Invalid</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.safeGetLocalStorage.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('falls back to default if stored theme is invalid', () => {
    storage.safeGetLocalStorage.mockReturnValue('dark-mode-9000');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
  });

  it('toggles theme correctly', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle');

    // Toggle to liquid
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme-value')).toHaveTextContent('liquid');
    expect(storage.safeSetLocalStorage).toHaveBeenCalledWith('preferred_theme', 'liquid');
    expect(storage.safeSetDocumentTheme).toHaveBeenCalledWith('liquid');

    // Toggle back to neubrutalism
    fireEvent.click(toggleBtn);
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

    fireEvent.click(screen.getByText('Set Neubrutalism'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('neubrutalism');
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
});
