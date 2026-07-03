import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConnectFour from './ConnectFour';

vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

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
      ].forEach(k => delete domProps[k]);
      return <span {...domProps}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: vi.fn().mockReturnValue(true),
}));

describe('ConnectFour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Easy AI picks the leftmost valid column deterministically with this mock.
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

  it('renders a 7x6 board and default score board', () => {
    render(<ConnectFour />);
    const grid = screen.getByRole('grid', { name: /Connect Four game board/i });
    expect(grid).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Row \d, Column \d/i })).toHaveLength(42);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Draws')).toBeInTheDocument();
  });

  it('drops a player piece to the lowest empty row and hands off to the AI', async () => {
    render(<ConnectFour />);
    const topCell = screen.getByRole('button', { name: /Row 1, Column 1, empty/i });
    fireEvent.click(topCell);

    // The piece should land in the bottom row (Row 6) of column 1.
    expect(
      screen.getByRole('button', { name: /Row 6, Column 1, your piece/i })
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // AI (medium, minimax) should have played somewhere on the board.
    const aiPieces = screen.getAllByRole('button', { name: /AI piece/i });
    expect(aiPieces.length).toBeGreaterThan(0);
  });

  it('supports dropping a piece via number keys', () => {
    render(<ConnectFour />);
    const grid = screen.getByRole('grid', { name: /Connect Four game board/i });
    fireEvent.keyDown(grid, { key: '4' });

    expect(
      screen.getByRole('button', { name: /Row 6, Column 4, your piece/i })
    ).toBeInTheDocument();
  });

  it('resets scores when difficulty changes', () => {
    render(<ConnectFour />);
    fireEvent.click(screen.getByRole('button', { name: /Row 1, Column 1, empty/i }));
    fireEvent.click(screen.getByRole('button', { name: /Set difficulty to Hard/i }));

    // Board should be cleared after switching difficulty.
    expect(
      screen.queryByRole('button', { name: /Row 6, Column 1, your piece/i })
    ).not.toBeInTheDocument();
  });

  it('detects a vertical win for the player', async () => {
    render(<ConnectFour />);
    fireEvent.click(screen.getByRole('button', { name: /Set difficulty to Easy/i }));

    const topCellCol7 = () => screen.getByRole('button', { name: /Row 1, Column 7, empty/i });

    for (let i = 0; i < 3; i++) {
      fireEvent.click(topCellCol7());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
    }
    // Fourth drop connects four vertically before the AI gets to respond.
    fireEvent.click(topCellCol7());

    expect(screen.getByText('You Won!')).toBeInTheDocument();
  });
});
