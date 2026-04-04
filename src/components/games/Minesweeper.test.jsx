import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import Minesweeper from './Minesweeper';
import { ThemeProvider } from '../shared/ThemeProvider';

// Mock dependencies
vi.mock('lucide-react', () => ({
  RotateCcw: () => <span data-testid="reset-icon">Reset</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  Flag: () => <span data-testid="flag-icon">Flag</span>,
  Bomb: () => <span data-testid="bomb-icon">Bomb</span>,
  Timer: () => <span data-testid="timer-icon">Timer</span>,
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }) => {
        const domProps = Object.keys(props).reduce((acc, key) => {
          if (
            ![
              'whileTap',
              'initial',
              'animate',
              'exit',
              'transition',
              'whileHover',
              'variants',
              'layoutId',
              'style',
              'drag',
              'dragConstraints',
              'dragElastic',
              'dragMomentum',
              'onUpdate',
            ].includes(key)
          ) {
            acc[key] = props[key];
          }
          return acc;
        }, {});
        return <div {...domProps}>{children}</div>;
      },
      button: ({ children, ...props }) => {
        const domProps = Object.keys(props).reduce((acc, key) => {
          if (
            ![
              'whileTap',
              'initial',
              'animate',
              'exit',
              'transition',
              'whileHover',
              'variants',
              'layoutId',
              'style',
              'drag',
              'dragConstraints',
              'dragElastic',
              'dragMomentum',
              'onUpdate',
            ].includes(key)
          ) {
            acc[key] = props[key];
          }
          return acc;
        }, {});
        return <button {...domProps}>{children}</button>;
      },
    },
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const renderWithTheme = component => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Minesweeper Game', () => {
  beforeEach(() => {
    localStorageMock.clear();
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

  it('renders initial game state', () => {
    renderWithTheme(<Minesweeper />);
    expect(screen.getByText(/Minesweeper ready/i)).toBeInTheDocument();
    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
    expect(cells).toHaveLength(81);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('starts game on first click', async () => {
    renderWithTheme(<Minesweeper />);
    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });
  });

  it('flags a cell on right click', async () => {
    renderWithTheme(<Minesweeper />);
    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
    const cell = cells[0];

    fireEvent.contextMenu(cell);

    await waitFor(() => {
      expect(cell).toHaveAttribute('aria-label', expect.stringContaining('flagged'));
    });

    expect(screen.getByText('9')).toBeInTheDocument();

    fireEvent.contextMenu(cell);

    await waitFor(() => {
      expect(cell).not.toHaveAttribute('aria-label', expect.stringContaining('flagged'));
    });

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles game over when hitting a mine', async () => {
    renderWithTheme(<Minesweeper />);

    let calls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      calls++;
      if (calls === 1) return 0;
      if (calls === 2) return 0.25;

      const i = Math.floor((calls - 3) / 2);
      const isRow = (calls - 3) % 2 === 0;
      const row = 5 + Math.floor(i / 9);
      const col = i % 9;

      if (isRow) return (row + 0.1) / 9;
      return (col + 0.1) / 9;
    });

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    fireEvent.click(cells[2]);

    await waitFor(() => {
      // Use getAllByText because "Game Over" appears in sr-only status and visible overlay
      const gameOvers = screen.getAllByText(/Game Over/i);
      expect(gameOvers.length).toBeGreaterThan(0);
    });
  });

  it('supports keyboard navigation', async () => {
    renderWithTheme(<Minesweeper />);
    const grid = screen.getByRole('grid');
    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    cells[0].focus();

    fireEvent.keyDown(grid, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(cells[1]).toHaveFocus();
    });

    fireEvent.keyDown(grid, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(cells[10]).toHaveFocus();
    });

    fireEvent.keyDown(grid, { key: 'ArrowLeft' });

    await waitFor(() => {
      expect(cells[9]).toHaveFocus();
    });

    fireEvent.keyDown(grid, { key: 'ArrowUp' });

    await waitFor(() => {
      expect(cells[0]).toHaveFocus();
    });

    fireEvent.keyDown(grid, { key: 'f' });

    await waitFor(() => {
      expect(cells[0]).toHaveAttribute('aria-label', expect.stringContaining('flagged'));
    });
  });

  it('simulates winning the game', async () => {
    renderWithTheme(<Minesweeper />);

    let calls = 0;
    // We will place all 10 mines on the first two rows (which has 18 cells total)
    // Actually, placeMines skips the clicked cell and its adjacent cells.
    // If we click (8, 8) at the bottom right, safe area is (7-8, 7-8).
    // We can place mines strictly on the top row (r=0, c=0..8) and (r=1, c=0).
    vi.spyOn(Math, 'random').mockImplementation(() => {
      // Return 0, 0, 0, 1/9, ... to place 10 mines deterministically
      const mineLocations = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
        [1, 0],
      ];
      if (calls >= 20) return 0.5; // fallback

      const idx = Math.floor(calls / 2);
      const isRow = calls % 2 === 0;
      calls++;

      if (idx < 10) {
        const val = mineLocations[idx][isRow ? 0 : 1];
        return (val + 0.1) / 9; // since there are 9 rows/cols
      }
      return 0.5;
    });

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    // First click bottom right (8, 8), which is cell 80
    fireEvent.click(cells[80]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    // We must reveal all non-mine cells. The mines are at indices 0..8 and 9.
    // Non-mine cells are indices 10 to 80. Many will be revealed by flood fill.
    // We just need to ensure all of them are clicked.
    for (let i = 10; i <= 80; i++) {
      fireEvent.click(cells[i]);
    }

    await waitFor(() => {
      const wins = screen.getAllByText(/You won in/i);
      expect(wins.length).toBeGreaterThan(0);
    });
  });

  it('renders correctly and increments TimerDisplay when playing', async () => {
    vi.useFakeTimers();
    // Use Date.now stub since the component relies on Date.now() for the timer.
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1000000000000);
    renderWithTheme(<Minesweeper />);

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    // Ensure timer is 0 initially
    expect(screen.getByText('0s')).toBeInTheDocument();

    // First click to start game
    await act(async () => {
      fireEvent.click(cells[0]);
    });

    // Since we mock Date.now, let's advance it explicitly and advance the timer so setInterval fires
    await act(async () => {
      dateSpy.mockReturnValue(1000000000000 + 2000);
      await vi.advanceTimersByTimeAsync(2000);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // We should see "2s" now
    expect(screen.getByText('2s')).toBeInTheDocument();
  });

  it('supports touch events for flagging', async () => {
    vi.useFakeTimers();
    renderWithTheme(<Minesweeper />);

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
    const cell = cells[0];

    // Simulating touchStart and immediately touchEnd shouldn't flag
    await act(async () => {
      fireEvent.touchStart(cell);
      fireEvent.touchEnd(cell);
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(cell).not.toHaveAttribute('aria-label', expect.stringContaining('flagged'));

    // Simulating touchStart and waiting > 500ms should flag
    await act(async () => {
      fireEvent.touchStart(cell);
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(cell).toHaveAttribute('aria-label', expect.stringContaining('flagged'));
  });

  it('restarts the game when clicking the reset button', async () => {
    renderWithTheme(<Minesweeper />);

    let calls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      calls++;
      if (calls === 1) return 0;
      if (calls === 2) return 0.25;

      const i = Math.floor((calls - 3) / 2);
      const isRow = (calls - 3) % 2 === 0;
      const row = 5 + Math.floor(i / 9);
      const col = i % 9;

      if (isRow) return (row + 0.1) / 9;
      return (col + 0.1) / 9;
    });

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    fireEvent.click(cells[2]);

    await waitFor(() => {
      const gameOvers = screen.getAllByText(/Game Over/i);
      expect(gameOvers.length).toBeGreaterThan(0);
    });

    // Reset button has test-id "reset-icon" (via our mock)
    const resetIcon = screen.getByTestId('reset-icon');
    const resetButton = resetIcon.closest('button');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Minesweeper ready/i)).toBeInTheDocument();
    });
  });

  it('displays the best time from localStorage', async () => {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'minesweeperBest') return '15';
      return null;
    });
    renderWithTheme(<Minesweeper />);

    await waitFor(() => {
      expect(screen.getByText('15s')).toBeInTheDocument();
    });

    localStorageMock.getItem.mockImplementation(_key => null);
  });

  it('selects a cell using Enter or Space via keyboard', async () => {
    renderWithTheme(<Minesweeper />);
    const grid = screen.getByRole('grid');
    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    cells[0].focus();

    // Start game
    fireEvent.keyDown(grid, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    // Move right and select with Space
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: ' ' });

    await waitFor(() => {
      // Since it's revealed, it either shows adjacent mines or empty (which doesn't have 'hidden' in aria-label anymore)
      expect(cells[1]).not.toHaveAttribute('aria-label', expect.stringContaining('hidden'));
    });
  });
});
