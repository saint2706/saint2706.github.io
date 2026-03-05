import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
      // eslint-disable-next-line no-unused-vars
      div: ({ children, whileTap, initial, animate, exit, transition, ...props }) => (
        <div {...props}>{children}</div>
      ),
      // eslint-disable-next-line no-unused-vars
      button: ({ children, whileTap, initial, animate, exit, transition, ...props }) => (
        <button {...props}>{children}</button>
      ),
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
    const mathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
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

    mathRandomSpy.mockRestore();
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

    // Test pressing Enter to reveal a cell
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    await waitFor(() => expect(cells[1]).toHaveFocus());

    fireEvent.keyDown(grid, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    // Test pressing Space on an already revealed cell does not crash
    fireEvent.keyDown(grid, { key: ' ' });

    // Ignore irrelevant keys
    fireEvent.keyDown(grid, { key: 'a' });
  });

  it('handles touch long press to flag', async () => {
    // We MUST use vi.useFakeTimers() here, but we also MUST run all promises and restore real timers BEFORE any subsequent tests
    vi.useFakeTimers();
    try {
      renderWithTheme(<Minesweeper />);

      const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });
      const cell = cells[0];

      // Start touch
      fireEvent.touchStart(cell);

      // Advance timer to trigger long press (500ms)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Because we're using fake timers, standard async testing library utilities like waitFor might break
      // Let's use assertion directly or act
      expect(cell).toHaveAttribute('aria-label', expect.stringContaining('flagged'));

      // End touch
      fireEvent.touchEnd(cell);

      // Second touch start but move/cancel before timeout
      fireEvent.touchStart(cell);
      fireEvent.touchMove(cell);
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Should still be flagged, not unflagged
      expect(cell).toHaveAttribute('aria-label', expect.stringContaining('flagged'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('detects a win condition', async () => {
    renderWithTheme(<Minesweeper />);

    // Need exactly 10 mines
    let calls = 0;
    const mathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
      calls++;

      // Fixed cells for the 10 mines:
      // (8,0), (8,1), (8,2), (8,3), (8,4), (8,5), (8,6), (8,7), (8,8), (7,8)
      if (calls === 1) return 8 / 9; if (calls === 2) return 0 / 9; // Mine 1: (8, 0)
      if (calls === 3) return 8 / 9; if (calls === 4) return 1 / 9; // Mine 2: (8, 1)
      if (calls === 5) return 8 / 9; if (calls === 6) return 2 / 9; // Mine 3: (8, 2)
      if (calls === 7) return 8 / 9; if (calls === 8) return 3 / 9; // Mine 4: (8, 3)
      if (calls === 9) return 8 / 9; if (calls === 10) return 4 / 9; // Mine 5: (8, 4)
      if (calls === 11) return 8 / 9; if (calls === 12) return 5 / 9; // Mine 6: (8, 5)
      if (calls === 13) return 8 / 9; if (calls === 14) return 6 / 9; // Mine 7: (8, 6)
      if (calls === 15) return 8 / 9; if (calls === 16) return 7 / 9; // Mine 8: (8, 7)
      if (calls === 17) return 8 / 9; if (calls === 18) return 8 / 9; // Mine 9: (8, 8)
      if (calls === 19) return 7 / 9; if (calls === 20) return 8 / 9; // Mine 10: (7, 8)

      // Fallback
      return 0.99;
    });

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    // Click top-left cell to start
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    // Reveal all remaining safe cells. The flood reveal from clicking (0,0) will reveal
    // rows 0-6. Only row 7 needs careful clicking to avoid mines.
    // The only mine not in row 8 is (7,8)
    for (let c = 0; c <= 7; c++) {
      const index = 7 * 9 + c;
      if (cells[index].getAttribute('aria-label').includes('hidden')) {
          fireEvent.click(cells[index]);
      }
    }

    await waitFor(() => {
      // Use getAllByText because "You Win!" appears in sr-only status and visible overlay
      const wins = screen.getAllByText(/You Win/i);
      expect(wins.length).toBeGreaterThan(0);
    });

    // Verify best time was saved
    expect(localStorageMock.setItem).toHaveBeenCalledWith('minesweeperBest', expect.any(String));

    // Reset game and verify
    const resetBtn = screen.getByRole('button', { name: /Play Again/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Minesweeper ready/i)).toBeInTheDocument();
    });

    mathRandomSpy.mockRestore();
  });

  it('handles flood reveal correctly', async () => {
    renderWithTheme(<Minesweeper />);

    // Need exactly 10 mines
    let calls = 0;
    const mathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
      calls++;

      // Each mine placement calls random() twice (row, col)
      // Return fixed cells for the 10 mines:
      // (8,0), (8,1), (8,2), (8,3), (8,4), (8,5), (8,6), (8,7), (8,8), (7,8)
      if (calls === 1) return 8 / 9; if (calls === 2) return 0 / 9; // Mine 1: (8, 0)
      if (calls === 3) return 8 / 9; if (calls === 4) return 1 / 9; // Mine 2: (8, 1)
      if (calls === 5) return 8 / 9; if (calls === 6) return 2 / 9; // Mine 3: (8, 2)
      if (calls === 7) return 8 / 9; if (calls === 8) return 3 / 9; // Mine 4: (8, 3)
      if (calls === 9) return 8 / 9; if (calls === 10) return 4 / 9; // Mine 5: (8, 4)
      if (calls === 11) return 8 / 9; if (calls === 12) return 5 / 9; // Mine 6: (8, 5)
      if (calls === 13) return 8 / 9; if (calls === 14) return 6 / 9; // Mine 7: (8, 6)
      if (calls === 15) return 8 / 9; if (calls === 16) return 7 / 9; // Mine 8: (8, 7)
      if (calls === 17) return 8 / 9; if (calls === 18) return 8 / 9; // Mine 9: (8, 8)
      if (calls === 19) return 7 / 9; if (calls === 20) return 8 / 9; // Mine 10: (7, 8)

      // Fallback
      return 0.99;
    });

    const cells = screen.getAllByRole('button', { name: /Row \d+, Column \d+/i });

    // Click top-left cell (0, 0), which should have 0 adjacent mines and trigger flood reveal
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Minesweeper ready/i)).not.toBeInTheDocument();
    });

    // Check that multiple cells have been revealed
    await waitFor(() => {
      // At least the top-left 3x3 block should be revealed
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const index = r * 9 + c;
          // Look for 'empty' or an adjacent count in the label
          expect(cells[index].getAttribute('aria-label')).toMatch(/empty|adjacent mines/);
        }
      }
    });

    mathRandomSpy.mockRestore();
  });
});
