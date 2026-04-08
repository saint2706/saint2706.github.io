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

  it('handles document being undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(supportsViewTransition()).toBe(false);
    vi.unstubAllGlobals();
  });

  it('handles startViewTransition not being a function', () => {
    const originalStart = document.startViewTransition;
    document.startViewTransition = 'not a function' as any;
    expect(supportsViewTransition()).toBe(false);
    document.startViewTransition = originalStart;
  });

  it('falls back to plain navigate when window.matchMedia is not a function', () => {
    const navigate = vi.fn();
    const startViewTransition = vi.fn(cb => cb());
    document.startViewTransition = startViewTransition;

    const originalMatchMedia = window.matchMedia;
    vi.stubGlobal('matchMedia', undefined);

    viewTransitionNavigate(navigate, '/projects');

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/projects', undefined);

    vi.unstubAllGlobals();
  });

  it('handles window being undefined for matchMedia fallback', () => {
    const navigate = vi.fn();
    const startViewTransition = vi.fn(cb => cb());
    document.startViewTransition = startViewTransition;

    vi.stubGlobal('window', undefined);

    viewTransitionNavigate(navigate, '/projects');

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/projects', undefined);

    vi.unstubAllGlobals();
  });

  it('handles keyboard activation early exits', () => {
    expect(shouldHandleClientNavigationKeydown(null)).toBe(false);
    expect(shouldHandleClientNavigationKeydown({ defaultPrevented: true })).toBe(false);
    expect(shouldHandleClientNavigationKeydown({ metaKey: true, key: 'Enter' })).toBe(false);
    expect(shouldHandleClientNavigationKeydown({ altKey: true, key: 'Enter' })).toBe(false);
    expect(shouldHandleClientNavigationKeydown({ ctrlKey: true, key: 'Enter' })).toBe(false);
    expect(shouldHandleClientNavigationKeydown({ shiftKey: true, key: 'Enter' })).toBe(false);
  });

  it('handles click activation early exits', () => {
    expect(shouldHandleClientNavigationClick(null)).toBe(false);
    expect(shouldHandleClientNavigationClick({ defaultPrevented: true })).toBe(false);
    expect(shouldHandleClientNavigationClick({ button: 0, metaKey: true })).toBe(false);
    expect(shouldHandleClientNavigationClick({ button: 0, altKey: true })).toBe(false);
    expect(shouldHandleClientNavigationClick({ button: 0, ctrlKey: true })).toBe(false);
    expect(shouldHandleClientNavigationClick({ button: 0, shiftKey: true })).toBe(false);
    expect(shouldHandleClientNavigationClick({ button: 0, currentTarget: {} })).toBe(true);
    expect(shouldHandleClientNavigationClick({ button: 0, currentTarget: { getAttribute: () => '_blank' } })).toBe(false);
  });

  it('handles disabled config or non-function navigate', () => {
    const startViewTransition = vi.fn(cb => cb());
    document.startViewTransition = startViewTransition;
    mockMatchMedia(query => query === '(prefers-reduced-motion: no-preference)');

    // Non-function navigate
    viewTransitionNavigate('not a function', '/projects');
    expect(startViewTransition).not.toHaveBeenCalled();

    // Disabled config
    const navigate = vi.fn();
    viewTransitionNavigate(navigate, '/projects', undefined, { disabled: true });
    expect(startViewTransition).not.toHaveBeenCalled();
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
