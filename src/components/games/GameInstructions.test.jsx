import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GameInstructions from './GameInstructions';
import { GAME_INSTRUCTIONS } from './gameInstructionsData';

// Mock theme context
vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

// Mock framer-motion to bypass animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const domProps = { ...props };
      ['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'variants'].forEach(
        k => delete domProps[k]
      );
      return <div {...domProps}>{children}</div>;
    },
    span: ({ children, ...props }) => {
      const domProps = { ...props };
      ['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'variants'].forEach(
        k => delete domProps[k]
      );
      return <span {...domProps}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: () => true,
}));

afterEach(() => {
  cleanup();
});

describe('GameInstructions', () => {
  it('renders a collapsed disclosure button for the given game', () => {
    render(<GameInstructions gameId="snake" />);
    const button = screen.getByRole('button', { name: /how to play snake/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('expands to show goal and steps when clicked', () => {
    render(<GameInstructions gameId="snake" />);
    const button = screen.getByRole('button', { name: /how to play snake/i });
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const region = screen.getByRole('region', { name: /how to play snake/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText(/eat as much food as you can/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(GAME_INSTRUCTIONS.snake.steps.length);
  });

  it('collapses again when clicked twice', () => {
    render(<GameInstructions gameId="tictactoe" />);
    const button = screen.getByRole('button', { name: /how to play tic tac toe/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('renders nothing for an unknown game id', () => {
    const { container } = render(<GameInstructions gameId="unknown-game" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has instructions with a goal and steps for every game', () => {
    const gameIds = [
      'tictactoe',
      'snake',
      'memory',
      'minesweeper',
      'simon',
      'whack',
      'lightsout',
      '2048',
      'connectfour',
    ];
    gameIds.forEach(id => {
      const entry = GAME_INSTRUCTIONS[id];
      expect(entry, `missing instructions for ${id}`).toBeDefined();
      expect(entry.title).toBeTruthy();
      expect(entry.goal).toBeTruthy();
      expect(entry.steps.length).toBeGreaterThan(0);
    });
  });
});
