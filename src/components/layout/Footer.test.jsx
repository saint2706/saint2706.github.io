import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Footer from './Footer';
import { ThemeProvider } from '../shared/ThemeProvider';

const renderFooter = () =>
  render(
    <ThemeProvider>
      <Footer />
    </ThemeProvider>
  );

describe('Footer', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    global.IntersectionObserver = MockIntersectionObserver;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('hides confetti after timeout once easter egg is unlocked', () => {
    const { container } = renderFooter();
    const likeButton = screen.getByRole('button', { name: 'Give a like' });

    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(likeButton);
    }

    expect(screen.getByText('You found a secret! ❤️')).toBeInTheDocument();
    expect(container.querySelectorAll('.confetti-piece')).toHaveLength(30);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(container.querySelector('.confetti-piece')).not.toBeInTheDocument();
  });
});
