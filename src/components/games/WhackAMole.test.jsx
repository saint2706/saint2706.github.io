import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import WhackAMole from './WhackAMole';

// Mock matchMedia to prevent errors from framer-motion if any
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock dependencies
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => true), // Force reduced motion for deterministic tests
  };
});

vi.mock('lucide-react', () => ({
  Play: () => <div data-testid="icon-play" />,
  RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
  Trophy: () => <div data-testid="icon-trophy" />,
  Timer: () => <div data-testid="icon-timer" />,
}));

vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

describe('WhackAMole', () => {
  beforeEach(() => {
    // Mock localStorage
    const store = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<WhackAMole />);

    // Check status bar elements
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2); // Initial score and high score
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument(); // Initial time
    expect(screen.getByText('Best')).toBeInTheDocument();

    // Check game board
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const holes = screen.getAllByRole('button', { name: /Hole/i });
    expect(holes).toHaveLength(9);

    // Check start overlay
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Whack-a-Mole')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('starts game when start button is clicked', async () => {
    vi.useFakeTimers();
    render(<WhackAMole />);

    const startBtn = screen.getByRole('button', { name: /Start Game/i });

    await act(async () => {
      fireEvent.click(startBtn);
    });

    // Dialog should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Game/i })).not.toBeInTheDocument();

    // Advance timer and act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Timer should decrement
    expect(screen.getByText('29s')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('moles spawn and can be whacked', async () => {
    vi.useFakeTimers();
    render(<WhackAMole />);

    // Start game
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    await act(async () => {
      fireEvent.click(startBtn);
    });

    // Verify no score initially
    expect(screen.getAllByText('0')).toHaveLength(2); // Score and best

    // Advance time by SPAWN_INTERVAL (800ms) to trigger a spawn
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // Find the active mole (aria-label should include "Mole! Click to whack!")
    const activeMole = screen.getByRole('button', { name: /Mole! Click to whack!/i });
    expect(activeMole).toBeInTheDocument();

    // Whack it
    await act(async () => {
      fireEvent.click(activeMole);
    });

    // Score should be 1 now (the '0' length goes back to 1 for high score)
    expect(screen.getByText('1')).toBeInTheDocument();

    // The active mole should revert to regular hole
    expect(activeMole).not.toHaveAttribute('aria-label', expect.stringContaining('Mole!'));

    vi.useRealTimers();
  });

  it('game ends after 30 seconds and updates high score', async () => {
    vi.useFakeTimers();
    render(<WhackAMole />);

    // Start game
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    await act(async () => {
      fireEvent.click(startBtn);
    });

    // Score some points
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    let activeMole = screen.getByRole('button', { name: /Mole! Click to whack!/i });
    await act(async () => {
      fireEvent.click(activeMole);
    });

    // Advance to end of game (29 seconds more)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(29500);
    });

    // Game over dialog should appear
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();

    // Check score is 1 and displayed in game over
    expect(screen.getByText(/You whacked/i)).toBeInTheDocument();

    // Check local storage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('whackHighScore', '1');
    expect(screen.getByText('New High Score!')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
