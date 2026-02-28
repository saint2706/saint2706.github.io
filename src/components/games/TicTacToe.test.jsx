import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import TicTacToe from './TicTacToe';

// Mock dependencies
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => true),
  };
});

vi.mock('lucide-react', () => ({
  RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
  Trophy: () => <div data-testid="icon-trophy" />,
  Cpu: () => <div data-testid="icon-cpu" />,
  User: () => <div data-testid="icon-user" />,
}));

vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

describe('TicTacToe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<TicTacToe />);

    // Check status announcements
    expect(
      screen.getByText('Your turn. Select an empty cell to place your X.')
    ).toBeInTheDocument();

    // Check difficulty selectors
    expect(screen.getByRole('button', { name: 'Easy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hard' })).toBeInTheDocument();

    // Check scoreboard
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Draws')).toBeInTheDocument();

    // Check grid
    const cells = screen.getAllByRole('button', { name: /Row \d, Column \d, empty/ });
    expect(cells).toHaveLength(9);
  });

  it('player can make a move', async () => {
    render(<TicTacToe />);

    // Click the top-left cell
    const cell0 = screen.getByRole('button', { name: 'Row 1, Column 1, empty' });
    await act(async () => {
      fireEvent.click(cell0);
    });

    // Verify cell is marked by player ('X')
    expect(
      screen.getByRole('button', { name: 'Row 1, Column 1, marked by you' })
    ).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('AI makes a move after player', async () => {
    vi.useFakeTimers();
    render(<TicTacToe />);

    // Set to Easy mode to avoid slow minimax calculations and make moves predictable enough
    const easyBtn = screen.getByRole('button', { name: 'Easy' });
    await act(async () => {
      fireEvent.click(easyBtn);
    });

    // Mock Math.random to make AI pick the first available empty cell deterministically
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // Click the top-left cell
    const cell0 = screen.getByRole('button', { name: 'Row 1, Column 1, empty' });
    await act(async () => {
      fireEvent.click(cell0);
    });

    // Verify "AI is thinking..." is shown
    expect(screen.getAllByText('AI is thinking...')).not.toHaveLength(0);

    // Advance timers by 500ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // AI should pick the next available cell (index 1) because of Math.random mock
    expect(
      screen.getByRole('button', { name: 'Row 1, Column 2, marked by AI' })
    ).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('player can win', async () => {
    vi.useFakeTimers();
    render(<TicTacToe />);

    // Set to Easy mode to avoid slow minimax calculations
    const easyBtn = screen.getByRole('button', { name: 'Easy' });
    await act(async () => {
      fireEvent.click(easyBtn);
    });

    // Mock Math.random to make AI pick sequential empty cells
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // To reliably win against easy AI that picks 0, we need to pick cells that don't overlap with what Math.random(0) produces
    // Math.random(0) picks the *first* available empty cell.
    // Turn 1: Player picks cell 4 (center). Empty cells: 0,1,2,3,5,6,7,8. AI picks 0.
    // Turn 2: Player picks cell 3 (middle left). Empty cells: 1,2,5,6,7,8. AI picks 1.
    // Turn 3: Player picks cell 5 (middle right). Win!

    // Turn 1
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Row 2, Column 2, empty' })); // Cell 4
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500); // AI picks cell 0
    });

    // Turn 2
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Row 2, Column 1, empty' })); // Cell 3
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500); // AI picks cell 1
    });

    // Turn 3
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Row 2, Column 3, empty' })); // Cell 5
    });
    // No AI turn since player wins immediately

    // Check if won
    expect(screen.getByText('You Won!')).toBeInTheDocument();

    // Check if score is updated (1 for Player, 0 for AI, 0 for Draws)
    const scoreboardPlayerScore = screen.getByText('You').nextElementSibling;
    expect(scoreboardPlayerScore.textContent).toBe('1');

    vi.useRealTimers();
  });

  it('game can end in a draw', async () => {
    vi.useFakeTimers();
    render(<TicTacToe />);

    // Set to Easy mode
    const easyBtn = screen.getByRole('button', { name: 'Easy' });
    await act(async () => {
      fireEvent.click(easyBtn);
    });

    // We want a draw.
    // X O X  (0, 1, 2)
    // O X O  (3, 4, 5)
    // O X O  (6, 7, 8)

    // Math.random will be called and multiplied by emptyIndices.length
    // We can just spy on the `minimax` or `getAIMove` but since they are private,
    // we have to manipulate Math.random to return the right index.

    // We'll mock it such that it picks the exact index we want from the `emptyIndices` array.
    vi.spyOn(Math, 'random').mockImplementation(() => {
      // Need to figure out the emptyIndices array to give the right float
      // Or better yet, just let the AI pick whatever if we can find a draw sequence.
      // Easiest is to force AI to pick the *first* empty cell by returning 0, and we play around it.
      return 0;
    });

    // If AI always picks first empty cell:
    // Turn 1: Player picks 4 (center). Empty: 0,1,2,3,5,6,7,8. AI picks 0 (Top Left).
    // Board:
    // O . .
    // . X .
    // . . .

    // Turn 2: Player picks 1 (Top Middle). Empty: 2,3,5,6,7,8. AI picks 2 (Top Right).
    // Board:
    // O X O
    // . X .
    // . . .

    // Turn 3: Player picks 7 (Bottom Middle). Empty: 3,5,6,8. AI picks 3 (Middle Left).
    // Board:
    // O X O
    // O X .
    // . X . -> Wait, this is a win for Player.

    // Let's try to get a draw with AI picking 0:
    // Turn 1: Player picks 4. AI -> 0
    // Turn 2: Player picks 8. AI -> 1
    // Turn 3: Player picks 2. AI -> 3
    // Turn 4: Player picks 6. AI -> 5
    // Turn 5: Player picks 7.

    // Let's trace it:
    // T1: P:4 (O:0)
    // O . .
    // . X .
    // . . .

    // T2: P:8 (O:1) -> Empty: 1,2,3,5,6,7. AI picks 1.
    // O O .
    // . X .
    // . . X

    // T3: P:2 (O:3) -> Empty: 2,3,5,6,7. AI picks 2. Wait, 2 is filled by player now? No.
    // Turn 2 AI picks 1.
    // Turn 3 Player picks 2. Empty after P3: 3,5,6,7. AI picks 3.
    // O O X
    // O X .
    // . . X

    // T4: P:6 (O:5) -> Empty: 5,7. AI picks 5.
    // O O X
    // O X O
    // X . X

    // T5: P:7 -> Empty: none.
    // O O X
    // O X O
    // X X X -> Wait, player wins on bottom row! (6,7,8).

    // Let's modify Turn 4/5.
    // T1: P:4 (O:0)
    // T2: P:1 (O:2) -> Empty before P2: 1,2,3,5,6,7,8. Player picks 1. Empty: 2,3,5,6,7,8. AI picks 2.
    // O X O
    // . X .
    // . . .

    // T3: P:6 (O:3) -> Empty before P3: 3,5,6,7,8. Player picks 6. Empty: 3,5,7,8. AI picks 3.
    // O X O
    // O X .
    // X . .

    // T4: P:5 (O:7) -> Empty before P4: 5,7,8. Player picks 5. Empty: 7,8. AI picks 7.
    // O X O
    // O X X
    // X O .

    // T5: P:8 -> Empty: none.
    // O X O
    // O X X
    // X O X
    // No winners! Draw!

    const moves = [
      { player: 'Row 2, Column 2, empty' }, // 4
      { player: 'Row 1, Column 2, empty' }, // 1
      { player: 'Row 3, Column 1, empty' }, // 6
      { player: 'Row 2, Column 3, empty' }, // 5
      { player: 'Row 3, Column 3, empty' }, // 8
    ];

    for (let i = 0; i < moves.length; i++) {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: moves[i].player }));
      });

      if (i < 4) {
        // AI moves 4 times
        await act(async () => {
          await vi.advanceTimersByTimeAsync(500);
        });
      }
    }

    // Check if draw
    expect(screen.getByText("It's a Draw!")).toBeInTheDocument();

    // Check if score is updated
    const scoreboardDraws = screen.getByText('Draws').nextElementSibling;
    expect(scoreboardDraws.textContent).toBe('1');

    vi.useRealTimers();
  });

  it('difficulty changes reset the game', async () => {
    vi.useFakeTimers();
    render(<TicTacToe />);

    // Set to Easy mode initially
    const easyBtn = screen.getByRole('button', { name: 'Easy' });
    await act(async () => {
      fireEvent.click(easyBtn);
    });

    // Make a move
    const cell0 = screen.getByRole('button', { name: 'Row 1, Column 1, empty' });
    await act(async () => {
      fireEvent.click(cell0);
    });

    // Verify cell is marked
    expect(
      screen.getByRole('button', { name: 'Row 1, Column 1, marked by you' })
    ).toBeInTheDocument();

    // Give AI a score to verify reset (using previous mock for win)
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // Change to hard
    const hardBtn = screen.getByRole('button', { name: 'Hard' });
    await act(async () => {
      fireEvent.click(hardBtn);
    });

    // Verify board is cleared (cell 0 should be empty again)
    expect(screen.getByRole('button', { name: 'Row 1, Column 1, empty' })).toBeInTheDocument();

    // Verify hard mode is selected
    expect(hardBtn).toHaveAttribute('aria-pressed', 'true');
    expect(easyBtn).toHaveAttribute('aria-pressed', 'false');

    vi.useRealTimers();
  });
});
