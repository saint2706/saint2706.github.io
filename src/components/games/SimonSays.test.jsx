import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SimonSays from './SimonSays';

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

describe('SimonSays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // Spy on Math.random to always pick a specific button first for predictability
    vi.spyOn(Math, 'random').mockReturnValue(0); // This should correspond to index 0
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders idle state correctly', () => {
    render(<SimonSays />);
    expect(screen.getByText('Simon Says ready. Press Start to begin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('starts the game and plays sequence', async () => {
    render(<SimonSays />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    // Fast forward timeouts in startGame and playSequence
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100); // Wait for startGame timeout
      await vi.advanceTimersByTimeAsync(500); // Wait for playSequence initial delay
      await vi.advanceTimersByTimeAsync(200); // Wait for flash
    });

    expect(screen.getByText('Your turn! Repeat the pattern. Round 1.')).toBeInTheDocument();
    const scoreElements = screen.getAllByText('0');
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('handles player input correctly', async () => {
    render(<SimonSays />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); // Let initial setup settle
    });

    // We mocked Math.random() to return 0, so the sequence should be just [0]
    const button0 = screen.getByRole('button', { name: /Yellow button \(key 1\)/i });

    fireEvent.click(button0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800); // Let the sequence processing finish
    });

    // It should have incremented the score and advanced sequence
    // The sequence advances after next delay
    const scoreElements = screen.getAllByText('1');
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('handles incorrect input correctly (Game Over)', async () => {
    render(<SimonSays />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Sequence is [0] (Yellow), so if we click Pink (1), we lose.
    const button1 = screen.getByRole('button', { name: /Pink button \(key 2\)/i });

    fireEvent.click(button1);

    const gameOvers = screen.getAllByText(/Game Over!/i);
    expect(gameOvers.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
  });

  it('supports keyboard inputs', async () => {
    render(<SimonSays />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Press '1'
    fireEvent.keyDown(window, { key: '1' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // Score goes to 1
    const scoreElements = screen.getAllByText('1');
    expect(scoreElements.length).toBeGreaterThan(0);
  });
});
