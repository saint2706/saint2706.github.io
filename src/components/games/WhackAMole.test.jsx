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

describe('WhackAMole', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Spy on Math.random to make the first mole always spawn in hole 0
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // ignore
    }
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

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    // Status text update
    expect(screen.getByText(/Score: 0. Time left: 30 seconds./i)).toBeInTheDocument();

    // Advance timers by SPAWN_INTERVAL (800ms) to trigger first mole
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await vi.advanceTimersByTimeAsync(0);
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

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await vi.advanceTimersByTimeAsync(0);
    });

    const activeHole = screen.getByRole('button', { name: 'Hole 1 — Mole! Click to whack!' });

    // Whack it!
    await act(async () => {
      fireEvent.click(activeHole);
      await vi.advanceTimersByTimeAsync(0);
    });

    // Check score updated (we'll see multiple '1's likely, but let's check scoreboard)
    // The screen reader text updates to score 1
    // Timers handle the state update asynchronously sometimes

    // Check scoreboard for score '1'
    const scores = screen.getAllByText('1');
    expect(scores.length).toBeGreaterThan(0);

    // We should see hit feedback briefly
    const hits = screen.getAllByText('💥');
    expect(hits.length).toBeGreaterThan(0);

    // Advance 200ms to clear hit feedback
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
      await vi.advanceTimersByTimeAsync(0);
    });
    const remainingHits = screen.queryAllByText('💥');
    expect(remainingHits.length).toBe(0);
  });

  it('handles game over (time runs out)', async () => {
    render(<WhackAMole />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    // Fast forward 30 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
      await vi.advanceTimersByTimeAsync(0);
    });

    const timeUps = screen.getAllByText(/Time's Up!/i);
    expect(timeUps.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
  });

  it('supports keyboard play', async () => {
    render(<WhackAMole />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800); // Wait for spawn at hole 0
    });

    // Whack hole 0 using key '1'
    await act(async () => {
      fireEvent.keyDown(window, { key: '1' });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const scores = screen.getAllByText('1');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('ignores clicks and key presses when not playing or hole is inactive', async () => {
    render(<WhackAMole />);

    // Game is idle. Try whacking via click on hole 0
    const inactiveHole = screen.getByRole('button', { name: 'Hole 1' });
    await act(async () => {
      fireEvent.click(inactiveHole);
    });

    // Try whacking via keyboard
    await act(async () => {
      fireEvent.keyDown(window, { key: '1' });
      await vi.advanceTimersByTimeAsync(0);
    });

    // Score should still be 0
    const scores = screen.getAllByText('0');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('ignores clicks on inactive holes while playing', async () => {
    render(<WhackAMole />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800); // Wait for spawn at hole 0
    });

    // Try clicking hole 1 (inactive)
    const inactiveHole = screen.getByRole('button', { name: 'Hole 2' });
    await act(async () => {
      fireEvent.click(inactiveHole);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Score should still be 0
    const scores = screen.getAllByText('0');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('handles filling up all holes (no available holes to spawn)', async () => {
    render(<WhackAMole />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    });

    // Wait enough time for all 9 holes to be filled.
    // Since we mock Math.random to always pick the first available hole,
    // advancing by 9 * 800ms will spawn moles in holes 0 to 8.
    // Advancing one more interval (800ms) will attempt to spawn when no holes are available.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 800);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Ensure at least some moles spawned
    const activeHoles = screen.getAllByRole('button', { name: /Mole! Click to whack!/ });
    expect(activeHoles.length).toBeGreaterThan(0);
  });

  it('records a new high score correctly', async () => {
    render(<WhackAMole />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    // Spawn and whack one mole to get a score of 1
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await vi.advanceTimersByTimeAsync(0);
    });

    const activeHole = screen.getByRole('button', { name: 'Hole 1 — Mole! Click to whack!' });
    await act(async () => {
      fireEvent.click(activeHole);
      await vi.advanceTimersByTimeAsync(0);
    });

    // Fast forward to game over
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
      await vi.advanceTimersByTimeAsync(0);
    });

    // Verify local storage is updated and high score is shown
    expect(localStorage.getItem('whackHighScore')).toBe('1');
    expect(screen.getAllByText(/New High Score!/i).length).toBeGreaterThan(0);
  });

  it('does not record a new high score if score is not strictly greater', async () => {
    // Preset high score to 10
    localStorage.setItem('whackHighScore', '10');
    render(<WhackAMole />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    // Fast forward to game over with 0 score
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
      await vi.advanceTimersByTimeAsync(0);
    });

    // Local storage should still be 10, not 0
    expect(localStorage.getItem('whackHighScore')).toBe('10');
    expect(screen.queryByText(/New High Score!/i)).not.toBeInTheDocument();
  });
});
