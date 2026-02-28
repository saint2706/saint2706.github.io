import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSafeTimeout } from './useSafeTimeout';

describe('useSafeTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('registers and executes timeouts', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useSafeTimeout());

    act(() => {
      result.current.setSafeTimeout(cb, 200);
      vi.advanceTimersByTime(199);
    });
    expect(cb).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('supports clear(id) and clearAll()', () => {
    const first = vi.fn();
    const second = vi.fn();
    const third = vi.fn();
    const { result } = renderHook(() => useSafeTimeout());

    let firstId;
    act(() => {
      firstId = result.current.setSafeTimeout(first, 100);
      result.current.setSafeTimeout(second, 100);
      result.current.clear(firstId);
      result.current.clearAll();
      result.current.setSafeTimeout(third, 100);
      vi.advanceTimersByTime(100);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    expect(third).toHaveBeenCalledTimes(1);
  });

  it('clears pending timeouts on unmount', () => {
    const cb = vi.fn();
    const { result, unmount } = renderHook(() => useSafeTimeout());

    act(() => {
      result.current.setSafeTimeout(cb, 100);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(cb).not.toHaveBeenCalled();
  });
});
