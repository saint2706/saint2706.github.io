import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when window.scrollY <= 300', () => {
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    render(<ScrollToTop />);

    // Simulate scroll event
    fireEvent.scroll(window);

    const button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).not.toBeInTheDocument();
  });

  it('renders when window.scrollY > 300', () => {
    Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
    render(<ScrollToTop />);

    // Simulate scroll event
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
    render(<ScrollToTop />);

    fireEvent.scroll(window);
    const button = screen.getByRole('button', { name: /scroll to top/i });

    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
