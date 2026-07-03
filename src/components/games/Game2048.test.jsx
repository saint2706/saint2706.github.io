import React from 'react';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Game2048 from './Game2048';

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

describe('Game2048', () => {
  beforeEach(() => {
    localStorage.clear();
    // Deterministic tile spawning: always picks the first empty cell and value 2.
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the initial board with a starting score of 0', () => {
    render(<Game2048 />);
    expect(screen.getByRole('grid', { name: /2048 puzzle grid/i })).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    // With Math.random mocked to 0, two "2" tiles spawn deterministically.
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2);
  });

  it('merges tiles and updates score on ArrowLeft', () => {
    render(<Game2048 />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // The two adjacent 2s merge into a 4, awarding 4 points.
    const grid = screen.getByRole('grid', { name: /2048 puzzle grid/i });
    expect(within(grid).getByText('4')).toBeInTheDocument();
  });

  it('persists best score to localStorage after a merge', () => {
    render(<Game2048 />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(localStorage.getItem('game2048Best')).toBe('4');
  });

  it('ignores unrelated key presses', () => {
    render(<Game2048 />);
    const before = screen.getAllByText('2').length;
    fireEvent.keyDown(window, { key: 'q' });
    expect(screen.getAllByText('2').length).toBe(before);
  });

  it('resets the board and score when New Game is clicked', () => {
    render(<Game2048 />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    const grid = screen.getByRole('grid', { name: /2048 puzzle grid/i });
    expect(within(grid).getByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Start a new game/i }));
    expect(within(grid).queryByText('4')).not.toBeInTheDocument();
  });

  it('supports swipe gestures on touch devices', () => {
    render(<Game2048 />);
    const grid = screen.getByRole('grid', { name: /2048 puzzle grid/i });
    const board = grid.parentElement;

    fireEvent.touchStart(board, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(board, { changedTouches: [{ clientX: 0, clientY: 100 }] });

    // Swiping left should trigger the same merge as ArrowLeft.
    expect(within(grid).getByText('4')).toBeInTheDocument();
  });
});
