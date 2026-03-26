import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  shouldHandleClientNavigationClick,
  shouldHandleClientNavigationKeydown,
  supportsViewTransition,
  viewTransitionNavigate,
} from './viewTransitionNavigate';

describe('viewTransitionNavigate helpers', () => {

const mockMatchMedia = matcher => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: matcher(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses startViewTransition only when supported and allowed', () => {
    const navigate = vi.fn();
    const startViewTransition = vi.fn(cb => cb());
    document.startViewTransition = startViewTransition;

    mockMatchMedia(query => query === '(prefers-reduced-motion: no-preference)');

    expect(supportsViewTransition()).toBe(true);
    viewTransitionNavigate(navigate, '/projects');

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/projects', undefined);
  });

  it('falls back to plain navigate when View Transitions API is unavailable', () => {
    const navigate = vi.fn();
    delete document.startViewTransition;

    mockMatchMedia(query => query === '(prefers-reduced-motion: no-preference)');

    expect(supportsViewTransition()).toBe(false);

    viewTransitionNavigate(navigate, '/projects');

    expect(navigate).toHaveBeenCalledWith('/projects', undefined);
  });

  it('falls back to plain navigate when reduced motion is enabled', () => {
    const navigate = vi.fn();
    const startViewTransition = vi.fn(cb => cb());
    document.startViewTransition = startViewTransition;

    mockMatchMedia(query => query === '(prefers-reduced-motion: reduce)');

    viewTransitionNavigate(navigate, '/projects');

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/projects', undefined);
  });

  it('handles keyboard activation keys consistently', () => {
    expect(shouldHandleClientNavigationKeydown({ key: 'Enter' })).toBe(true);
    expect(shouldHandleClientNavigationKeydown({ key: ' ' })).toBe(true);
    expect(shouldHandleClientNavigationKeydown({ key: 'Tab' })).toBe(false);
  });

  it('ignores non-primary or modified clicks for client navigation', () => {
    expect(
      shouldHandleClientNavigationClick({
        defaultPrevented: false,
        button: 0,
        metaKey: false,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        currentTarget: { getAttribute: () => '_self' },
      })
    ).toBe(true);

    expect(
      shouldHandleClientNavigationClick({
        defaultPrevented: false,
        button: 1,
        metaKey: false,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        currentTarget: { getAttribute: () => null },
      })
    ).toBe(false);
  });
});
