import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TicTacToe from './TicTacToe';

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

describe('TicTacToe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Spy on Math.random to make AI's random moves deterministic
    // We will make it return 0, so it picks the first empty slot.
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial game state', () => {
    render(<TicTacToe />);

    expect(screen.getByText('Your turn')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Select difficulty level/i })).toBeInTheDocument();

    // There should be 9 empty cells
    const cells = screen.getAllByRole('button', { name: /empty/i });
    expect(cells).toHaveLength(9);
  });

  it('handles player moves and easy AI moves', async () => {
    render(<TicTacToe />);

    // Switch to easy mode
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }));

    // Play a move
    // The easiest way is to query by aria-label.
    const emptyCells = screen.getAllByRole('button', { name: /empty/i });

    // Click middle cell (index 4)
    fireEvent.click(emptyCells[4]);

    // Now cell 4 should be marked by player
    expect(screen.getByRole('button', { name: /Row 2, Column 2, marked by you/i })).toBeInTheDocument();

    // AI thinks
    const aiThinkingMessages = screen.getAllByText('AI is thinking...');
    expect(aiThinkingMessages.length).toBeGreaterThan(0);

    // Advance timers for AI
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // AI (using deterministic random 0) will pick the first empty slot, which is index 0.
    expect(screen.getByRole('button', { name: /Row 1, Column 1, marked by AI/i })).toBeInTheDocument();

    // Back to player's turn
    expect(screen.getByText('Your turn')).toBeInTheDocument();
  });

  it('detects a player win', async () => {
    render(<TicTacToe />);
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }));

    const getCell = (index) => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // P X(4) -> AI O(0)
    fireEvent.click(getCell(4));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });

    // P X(1) -> AI O(2)
    fireEvent.click(getCell(1));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });

    // P X(7) -> win line 1,4,7
    fireEvent.click(getCell(7));

    const winMessages = screen.getAllByText('You Won!');
    expect(winMessages.length).toBeGreaterThan(0);
  });

  it('handles game reset', async () => {
    render(<TicTacToe />);
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }));

    const getCell = (index) => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    fireEvent.click(getCell(4));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    fireEvent.click(getCell(1));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    fireEvent.click(getCell(7));

    // Restart
    const playAgainButton = screen.getByRole('button', { name: /Play Again/i });
    fireEvent.click(playAgainButton);

    // Cells should be empty again
    const emptyCells = screen.getAllByRole('button', { name: /empty/i });
    expect(emptyCells).toHaveLength(9);
  });
});
