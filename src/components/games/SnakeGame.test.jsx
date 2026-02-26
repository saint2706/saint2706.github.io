import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import SnakeGame from './SnakeGame';
import { ThemeProvider } from '../shared/ThemeProvider';

// Mock dependencies
vi.mock('lucide-react', () => ({
  Play: () => <span data-testid="play-icon">Play</span>,
  RotateCcw: () => <span data-testid="reset-icon">Reset</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  Pause: () => <span data-testid="pause-icon">Pause</span>,
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

// Mock Canvas
const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

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

describe('SnakeGame', () => {
  let intervals;
  let intervalIdCounter;

  beforeEach(() => {
    // Manual interval mocking
    intervals = new Map();
    intervalIdCounter = 0;

    // eslint-disable-next-line no-unused-vars
    vi.spyOn(window, 'setInterval').mockImplementation((cb, ms) => {
      intervalIdCounter++;
      intervals.set(intervalIdCounter, cb);
      return intervalIdCounter;
    });

    vi.spyOn(window, 'clearInterval').mockImplementation(id => {
      intervals.delete(id);
    });

    localStorageMock.clear();
    mockContext.fillRect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const tickGame = () => {
    act(() => {
      intervals.forEach(cb => cb());
    });
  };

  it('renders initial game state', () => {
    renderWithTheme(<SnakeGame />);
    expect(screen.getAllByText(/Snake Game/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Start Snake Game' })).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('starts game on button click', async () => {
    renderWithTheme(<SnakeGame />);
    const startButton = screen.getByRole('button', { name: 'Start Snake Game' });

    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Start Snake Game' })).not.toBeInTheDocument();
    });

    // Interval should be set
    expect(intervals.size).toBe(1);
  });

  it('updates game state (snake moves) over time', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Start Snake Game' })).not.toBeInTheDocument();
    });

    mockContext.fillRect.mockClear();

    // Trigger one tick
    tickGame();

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('eats food and increments score', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    // Snake at (10, 10). Food at (15, 10). Distance 5.
    // Need 5 ticks.
    for (let i = 0; i < 5; i++) {
      tickGame();
    }

    await waitFor(() => {
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });
  });

  it('handles wall collision (Game Over)', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    // Wall at distance 10.
    // Need 10 ticks.
    // But speed increases (ticks become faster in real life, but here we manually tick).
    // The logic is inside tick callback.
    // Just tick enough times.

    // Note: Eating food at step 5 will respawn food and increase score.
    // Then we continue moving Right.
    // Until x=20.

    // Just tick 15 times to be sure.
    for (let i = 0; i < 15; i++) {
      tickGame();
    }

    await waitFor(() => {
      const gameOvers = screen.getAllByText(/Game Over/i);
      expect(gameOvers.length).toBeGreaterThan(0);
    });
  });

  it('controls game with keyboard (Pause/Resume)', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    const container = screen.getByLabelText('Snake Game Board. Use arrow keys to move.');
    container.focus();

    fireEvent.keyDown(container, { key: ' ' }); // Space

    await waitFor(() => {
      const pausedElements = screen.getAllByText(/Paused/i);
      expect(pausedElements.length).toBeGreaterThan(0);
    });

    fireEvent.keyDown(container, { key: ' ' }); // Resume

    await waitFor(() => {
      const pausedElements = screen.queryAllByText(/Paused/i);
      // Only visible elements matter, but queryAllByText finds hidden ones too?
      // Wait, "Game paused" sr-only text vs "Paused" banner.
      // If unpaused, both should be gone.
      // Except maybe "Playing..." replaces sr-only.
      // "Paused" banner is conditional {gameState === 'paused'}.
      // So it should be gone.

      // Let's check banner specifically if possible, or just length 0.
      // If "Playing..." contains "Paused"? No.
      expect(pausedElements.length).toBe(0);
    });
  });
});
