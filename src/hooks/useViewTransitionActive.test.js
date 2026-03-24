import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewTransitionActive } from './useViewTransitionActive';

describe('useViewTransitionActive', () => {
  let originalStartViewTransition;

  beforeEach(() => {
    originalStartViewTransition = document.startViewTransition;
  });

  afterEach(() => {
    if (originalStartViewTransition) {
      document.startViewTransition = originalStartViewTransition;
    } else {
      delete document.startViewTransition;
    }
  });

  it('returns false when View Transitions API is unsupported', () => {
    delete document.startViewTransition;
    const { result } = renderHook(() => useViewTransitionActive());
    expect(result.current).toBe(false);
  });

  it('returns true during a transition and false after it finishes', async () => {
    let resolveFinished;
    const finishedPromise = new Promise(resolve => {
      resolveFinished = resolve;
    });

    document.startViewTransition = vi.fn(callback => {
      callback();
      return { finished: finishedPromise };
    });

    const { result } = renderHook(() => useViewTransitionActive());
    expect(result.current).toBe(false);

    // Trigger a transition
    act(() => {
      document.startViewTransition(() => {});
    });

    expect(result.current).toBe(true);

    // Finish the transition
    await act(async () => {
      resolveFinished();
      await finishedPromise;
    });

    expect(result.current).toBe(false);
  });
});
