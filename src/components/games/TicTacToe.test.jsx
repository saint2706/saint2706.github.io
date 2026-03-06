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
        'drag',
        'dragConstraints',
        'dragElastic',
        'dragMomentum',
        'onUpdate',
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
        'drag',
        'dragConstraints',
        'dragElastic',
        'dragMomentum',
        'onUpdate',
      ].forEach(k => delete domProps[k]);
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
    fireEvent.click(screen.getByRole('button', { name: 'Set difficulty to Easy' }));

    // Play a move
    // The easiest way is to query by aria-label.
    const emptyCells = screen.getAllByRole('button', { name: /empty/i });

    // Click middle cell (index 4)
    fireEvent.click(emptyCells[4]);

    // Now cell 4 should be marked by player
    expect(
      screen.getByRole('button', { name: /Row 2, Column 2, marked by you/i })
    ).toBeInTheDocument();

    // AI thinks
    const aiThinkingMessages = screen.getAllByText('AI is thinking...');
    expect(aiThinkingMessages.length).toBeGreaterThan(0);

    // Advance timers for AI
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // AI (using deterministic random 0) will pick the first empty slot, which is index 0.
    expect(
      screen.getByRole('button', { name: /Row 1, Column 1, marked by AI/i })
    ).toBeInTheDocument();

    // Back to player's turn
    expect(screen.getByText('Your turn')).toBeInTheDocument();
  });

  it('handles AI medium difficulty random move', async () => {
    // Math.random() < 0.3 evaluates to true if random is 0
    // Spy on Math.random to make AI's random moves deterministic
    // 0 is less than 0.3, so it takes random path
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<TicTacToe />);

    // Switch to medium mode (default is medium)

    // Play a move
    const emptyCells = screen.getAllByRole('button', { name: /empty/i });
    fireEvent.click(emptyCells[4]); // Center

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // AI will pick index 0 (first empty slot) because random path selects emptyIndices[0]
    // since Math.random returns 0.1, Math.floor(0.1 * 8) = 0
    expect(
      screen.getByRole('button', { name: /Row 1, Column 1, marked by AI/i })
    ).toBeInTheDocument();
  });

  it('handles AI medium difficulty optimal move', async () => {
    // 0.5 is > 0.3, so it takes optimal path
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    render(<TicTacToe />);

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // Play a move
    fireEvent.click(getCell(0)); // Top left

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Optimal move for center open and top-left X is center
    expect(
      screen.getByRole('button', { name: /Row 2, Column 2, marked by AI/i })
    ).toBeInTheDocument();
  });

  it('handles AI hard difficulty optimal move', async () => {
    render(<TicTacToe />);

    fireEvent.click(screen.getByRole('button', { name: 'Set difficulty to Hard' }));

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // Play a move
    fireEvent.click(getCell(4)); // Center

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Optimal move for center X is corner (e.g. 0)
    expect(
      screen.getByRole('button', { name: /Row 1, Column 1, marked by AI/i })
    ).toBeInTheDocument();
  });

  it('detects a player win', async () => {
    render(<TicTacToe />);
    fireEvent.click(screen.getByRole('button', { name: 'Set difficulty to Easy' }));

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // P X(4) -> AI O(0)
    fireEvent.click(getCell(4));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // P X(1) -> AI O(2)
    fireEvent.click(getCell(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // P X(7) -> win line 1,4,7
    fireEvent.click(getCell(7));

    const winMessages = screen.getAllByText('You Won!');
    expect(winMessages.length).toBeGreaterThan(0);
  });

  it('handles game reset', async () => {
    render(<TicTacToe />);
    fireEvent.click(screen.getByRole('button', { name: 'Set difficulty to Easy' }));

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    fireEvent.click(getCell(4));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    fireEvent.click(getCell(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    fireEvent.click(getCell(7));

    // Restart
    const playAgainButton = screen.getByRole('button', { name: /Play Again/i });
    fireEvent.click(playAgainButton);

    // Cells should be empty again
    const emptyCells = screen.getAllByRole('button', { name: /empty/i });
    expect(emptyCells).toHaveLength(9);
  });

  it('detects a draw', async () => {
    // Math.random() < 0.3 evaluates to true if random is 0
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<TicTacToe />);

    // Switch to medium mode (default)
    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // To get a draw, we need to fill the board.
    // Given AI (with Math.random() < 0.3) always picks the first empty slot:
    // P moves: 1, 3, 4, 6, 8 results in a draw.

    // Turn 1
    fireEvent.click(getCell(1)); // P
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    }); // AI -> 0

    // Turn 2
    fireEvent.click(getCell(3)); // P
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    }); // AI -> 2

    // Turn 3
    fireEvent.click(getCell(4)); // P
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    }); // AI -> 5

    // Turn 4
    fireEvent.click(getCell(6)); // P
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    }); // AI -> 7

    // Turn 5
    fireEvent.click(getCell(8)); // P -> fills board

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    }); // Let animations/timers settle

    const drawMessages = screen.getAllByText("It's a Draw!");
    expect(drawMessages.length).toBeGreaterThan(0);
  });

  it('detects an AI win', async () => {
    // Easy mode is fine, AI takes first empty spot.
    vi.spyOn(Math, 'random').mockReturnValue(0.0);

    render(<TicTacToe />);
    fireEvent.click(screen.getByRole('button', { name: 'Set difficulty to Easy' }));

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // P takes 3 -> AI takes 0
    fireEvent.click(getCell(3));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // P takes 4 -> AI takes 1
    fireEvent.click(getCell(4));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // P takes 6 -> AI takes 2 (AI wins!)
    fireEvent.click(getCell(6));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    const aiWinMessages = screen.getAllByText('AI Wins!');
    expect(aiWinMessages.length).toBeGreaterThan(0);
  });

  it('ignores clicks on already occupied cells', async () => {
    // Explicitly mock Math.random to ensure AI's random move is deterministic (picks first empty cell)
    vi.spyOn(Math, 'random').mockReturnValue(0.0);
    render(<TicTacToe />);

    const getCell = index => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      return screen.getByRole('button', { name: new RegExp(`Row ${row}, Column ${col}`) });
    };

    // Click cell 0
    fireEvent.click(getCell(0));

    // Cell 0 should now be marked by you
    expect(
      screen.getByRole('button', { name: /Row 1, Column 1, marked by you/i })
    ).toBeInTheDocument();

    // Click cell 0 again
    fireEvent.click(getCell(0));

    // Wait for AI move (AI takes 1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Cell 0 should still be marked by you
    expect(
      screen.getByRole('button', { name: /Row 1, Column 1, marked by you/i })
    ).toBeInTheDocument();

    // The AI should have made one move in cell 1 (Row 1, Column 2)
    expect(
      screen.getByRole('button', { name: /Row 1, Column 2, marked by AI/i })
    ).toBeInTheDocument();

    // Clicking cell 1 (AI occupied) shouldn't do anything
    fireEvent.click(getCell(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Cell 1 should still be marked by AI
    expect(
      screen.getByRole('button', { name: /Row 1, Column 2, marked by AI/i })
    ).toBeInTheDocument();
  });
});
