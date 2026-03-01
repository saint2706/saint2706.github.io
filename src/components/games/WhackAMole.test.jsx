import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WhackAMole from './WhackAMole';

// Mock theme context
vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      // eslint-disable-next-line no-unused-vars
      const { initial, animate, exit, transition, whileTap, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
    button: ({ children, ...props }) => {
      // eslint-disable-next-line no-unused-vars
      const { initial, animate, exit, transition, whileTap, ...domProps } = props;
      return <button {...domProps}>{children}</button>;
    },
    span: ({ children, ...props }) => {
      // eslint-disable-next-line no-unused-vars
      const { initial, animate, exit, transition, whileTap, ...domProps } = props;
      return <span {...domProps}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: vi.fn().mockReturnValue(true),
}));

describe('WhackAMole', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Spy on Math.random to make the first mole always spawn in hole 0
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state', () => {
    render(<WhackAMole />);
    expect(screen.getByText(/Whack-a-Mole ready/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();

    // Check scoreboard
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    const scoreElements = screen.getAllByText('0');
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('starts the game and spawns moles', async () => {
    render(<WhackAMole />);

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    // Status text update
    expect(screen.getByText(/Score: 0. Time left: 30 seconds./i)).toBeInTheDocument();

    // Advance timers by SPAWN_INTERVAL (800ms) to trigger first mole
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // Mole should appear in hole 0
    const activeHole = screen.getByRole('button', { name: 'Hole 1 — Mole! Click to whack!' });
    expect(activeHole).toBeInTheDocument();

    // The visual mole representation
    const moles = screen.getAllByText('🐹');
    expect(moles.length).toBeGreaterThan(0);
  });

  it('handles whacking a mole', async () => {
    render(<WhackAMole />);

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    const activeHole = screen.getByRole('button', { name: 'Hole 1 — Mole! Click to whack!' });

    // Whack it!
    fireEvent.click(activeHole);

    // Check score updated (we'll see multiple '1's likely, but let's check scoreboard)
    // The screen reader text updates to score 1
    // Timers handle the state update asynchronously sometimes
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Check scoreboard for score '1'
    const scores = screen.getAllByText('1');
    expect(scores.length).toBeGreaterThan(0);

    // We should see hit feedback briefly
    const hits = screen.getAllByText('💥');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('handles game over (time runs out)', async () => {
    render(<WhackAMole />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    // Fast forward 30 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    const timeUps = screen.getAllByText(/Time's Up!/i);
    expect(timeUps.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
  });

  it('supports keyboard play', async () => {
    render(<WhackAMole />);

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800); // Wait for spawn at hole 0
    });

    // Whack hole 0 using key '1'
    fireEvent.keyDown(window, { key: '1' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const scores = screen.getAllByText('1');
    expect(scores.length).toBeGreaterThan(0);
  });
});
