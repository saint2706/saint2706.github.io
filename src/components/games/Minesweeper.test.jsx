import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      div: ({
        children,
        whileTap: _whileTap,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...props
      }) => <div {...props}>{children}</div>,

      button: ({
        children,
        whileTap: _whileTap,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...props
      }) => <button {...props}>{children}</button>,
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

    fireEvent.keyDown(grid, { key: 'f' });

    await waitFor(() => {
      expect(cells[10]).toHaveAttribute('aria-label', expect.stringContaining('flagged'));
    });
  });
});
