import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LightsOut from './LightsOut';

// Mock theme context
vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const domProps = { ...props };
      [
        'initial',
        'animate',
        'exit',
        'transition',
        'whileTap',
        'whileHover',
        'variants',
        'layoutId',
        'style',
        'drag',
        'dragConstraints',
        'dragElastic',
        'dragMomentum',
        'onUpdate',
      ].forEach(k => delete domProps[k]);
      return <div {...domProps}>{children}</div>;
    },
    button: ({ children, ...props }) => {
      const domProps = { ...props };
      [
        'initial',
        'animate',
        'exit',
        'transition',
        'whileTap',
        'whileHover',
        'variants',
        'layoutId',
        'style',
        'drag',
        'dragConstraints',
        'dragElastic',
        'dragMomentum',
        'onUpdate',
      ].forEach(k => delete domProps[k]);
      return <button {...domProps}>{children}</button>;
    },
    span: ({ children, ...props }) => {
      const domProps = { ...props };
      [
        'initial',
        'animate',
        'exit',
        'transition',
        'whileTap',
        'whileHover',
        'variants',
        'layoutId',
        'style',
        'drag',
        'dragConstraints',
        'dragElastic',
        'dragMomentum',
        'onUpdate',
      ].forEach(k => delete domProps[k]);
      return <span {...domProps}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: vi.fn().mockReturnValue(true),
}));

describe('LightsOut', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Spy on Math.random to make the puzzle generation deterministic
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // ignore
    }
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<LightsOut />);
    expect(screen.getByText(/Lights Out puzzle ready/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Puzzle/i })).toBeInTheDocument();
  });

  it('starts the puzzle when Start is clicked', () => {
    render(<LightsOut />);
    fireEvent.click(screen.getByRole('button', { name: /Start Puzzle/i }));

    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons).toHaveLength(25); // 5x5 grid

    // Check reset button
    expect(screen.getByRole('button', { name: /Reset Puzzle/i })).toBeInTheDocument();
  });

  it('toggles lights correctly on click', () => {
    render(<LightsOut />);
    fireEvent.click(screen.getByRole('button', { name: /Start Puzzle/i }));

    const btn00 = screen.getByRole('button', { name: /Row 1, Column 1/i });
    const initialState = btn00.getAttribute('aria-pressed') === 'true';

    fireEvent.click(btn00);

    const newState = btn00.getAttribute('aria-pressed') === 'true';
    expect(newState).toBe(!initialState);
  });

  it('resets the puzzle when Reset is clicked', () => {
    render(<LightsOut />);
    fireEvent.click(screen.getByRole('button', { name: /Start Puzzle/i }));

    const btn00 = screen.getByRole('button', { name: /Row 1, Column 1/i });
    fireEvent.click(btn00);

    expect(screen.getByText('1')).toBeInTheDocument(); // 1 move

    fireEvent.click(screen.getByRole('button', { name: /Reset Puzzle/i }));

    expect(screen.getAllByText('0').length).toBeGreaterThan(0); // 0 moves
  });

  it('detects a win when all lights are off', async () => {
    render(<LightsOut />);
    fireEvent.click(screen.getByRole('button', { name: /Start Puzzle/i }));

    // We mocked random to return 0, which toggles the top-left cell 8 times.
    // If it toggles it an even number of times, it ends up 'false'.
    // If it ends up all false, the center cell (2,2) and its neighbors are toggled ON.
    // So to win, we must toggle (2,2) and its neighbors.
    // BUT wait, if we toggle (2,2), it toggles itself AND its neighbors!
    // So toggling (2,2) ONCE will turn OFF all the center cells!
    // Let's test this.

    const centerBtn = screen.getByRole('button', { name: /Row 3, Column 3/i });
    fireEvent.click(centerBtn);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const winMessages = screen.getAllByText(/Lights Out! 🎉/i);
    expect(winMessages.length).toBeGreaterThan(0);
  });

  it('supports keyboard navigation', () => {
    render(<LightsOut />);
    fireEvent.click(screen.getByRole('button', { name: /Start Puzzle/i }));

    const grid = screen.getByRole('grid');

    // Initial focus is on (0, 0)
    let buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons[0]).toHaveAttribute('tabIndex', '0');

    // ArrowRight -> (0, 1)
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
    expect(buttons[1]).toHaveAttribute('tabIndex', '0');

    // ArrowDown -> (1, 1)
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
    expect(buttons[6]).toHaveAttribute('tabIndex', '0'); // index 1*5 + 1 = 6

    // ArrowLeft -> (1, 0)
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons[6]).toHaveAttribute('tabIndex', '-1');
    expect(buttons[5]).toHaveAttribute('tabIndex', '0');

    // ArrowUp -> (0, 0)
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    buttons = screen.getAllByRole('button', { name: /Row/i });
    expect(buttons[5]).toHaveAttribute('tabIndex', '-1');
    expect(buttons[0]).toHaveAttribute('tabIndex', '0');

    // Enter to toggle (0, 0)
    const btn00 = buttons[0];
    const initialState = btn00.getAttribute('aria-pressed') === 'true';
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(btn00.getAttribute('aria-pressed')).toBe(initialState ? 'false' : 'true');

    // Space to toggle (0, 0)
    fireEvent.keyDown(grid, { key: ' ' });
    expect(btn00.getAttribute('aria-pressed')).toBe(initialState ? 'true' : 'false');
  });

  it('ignores keyboard navigation when not playing', () => {
    render(<LightsOut />);
    const gridDiv = screen.getByLabelText('Lights Out puzzle grid');
    fireEvent.keyDown(gridDiv, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /Start Puzzle/i })).toBeInTheDocument();
  });
});
