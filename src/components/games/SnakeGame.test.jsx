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
      div: ({ children, ...props }) => {
        const domProps = Object.keys(props).reduce((acc, key) => {
          if (
            ![
              'whileTap',
              'initial',
              'animate',
              'exit',
              'transition',
              'whileHover',
              'variants',
              'layoutId',
              'style',
              'drag',
              'dragConstraints',
              'dragElastic',
              'dragMomentum',
              'onUpdate',
            ].includes(key)
          ) {
            acc[key] = props[key];
          }
          return acc;
        }, {});
        return <div {...domProps}>{children}</div>;
      },
      button: ({ children, ...props }) => {
        const domProps = Object.keys(props).reduce((acc, key) => {
          if (
            ![
              'whileTap',
              'initial',
              'animate',
              'exit',
              'transition',
              'whileHover',
              'variants',
              'layoutId',
              'style',
              'drag',
              'dragConstraints',
              'dragElastic',
              'dragMomentum',
              'onUpdate',
            ].includes(key)
          ) {
            acc[key] = props[key];
          }
          return acc;
        }, {});
        return <button {...domProps}>{children}</button>;
      },
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

// Mock the DOM properties that might be needed by the canvas drawing logic
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      getPropertyValue: vi.fn().mockReturnValue('#000000'),
    },
  },
  configurable: true,
});

window.getComputedStyle = vi.fn().mockReturnValue({
  getPropertyValue: vi.fn(prop => {
    switch (prop) {
      case '--color-border':
        return '#000000';
      case '--color-accent':
        return '#0052CC';
      case '--color-fun-pink':
        return '#9C0E4B';
      case '--color-fun-yellow':
        return '#FFEB3B';
      default:
        return '';
    }
  }),
});

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
    vi.spyOn(window, 'setInterval').mockImplementation(cb => {
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
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // ignore
    }
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
      expect(pausedElements.length).toBe(0);
    });

    fireEvent.keyDown(container, { key: 'Escape' }); // Pause with Escape

    await waitFor(() => {
      const pausedElements = screen.getAllByText(/Paused/i);
      expect(pausedElements.length).toBeGreaterThan(0);
    });
  });

  it('updates direction correctly and prevents 180 degree turns', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    const container = screen.getByLabelText('Snake Game Board. Use arrow keys to move.');
    container.focus();

    // Initially moving right. Try moving left (180 degree).
    fireEvent.keyDown(container, { key: 'ArrowLeft' });
    tickGame();

    fireEvent.keyDown(container, { key: 'w' });
    tickGame();

    fireEvent.keyDown(container, { key: 's' });
    tickGame();

    fireEvent.keyDown(container, { key: 'a' });
    tickGame();

    fireEvent.keyDown(container, { key: 'd' });
    tickGame();

    fireEvent.keyDown(container, { key: 'x' });
    tickGame();

    expect(screen.queryByText(/Game Over/i)).not.toBeInTheDocument();
  });

  it('handles touch controls (swipe)', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    const container = screen.getByLabelText('Snake Game Board. Use arrow keys to move.');

    fireEvent.touchStart(container, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 100, clientY: 200 }] });
    tickGame();

    fireEvent.touchStart(container, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 0, clientY: 200 }] });
    tickGame();

    fireEvent.keyDown(container, { key: ' ' });
    fireEvent.touchStart(container, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 100, clientY: 200 }] });

    expect(screen.queryByText(/Game Over/i)).not.toBeInTheDocument();
  });

  it('pauses on blur', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    const container = screen.getByLabelText('Snake Game Board. Use arrow keys to move.');
    container.focus();

    fireEvent.blur(container);

    await waitFor(() => {
      const pausedElements = screen.getAllByText(/Paused/i);
      expect(pausedElements.length).toBeGreaterThan(0);
    });
  });

  it('restarts game on Play Again', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    // Force Game Over
    for (let i = 0; i < 30; i++) {
      tickGame();
    }

    await waitFor(() => {
      expect(screen.getAllByText(/Game Over/i).length).toBeGreaterThan(0);
    });

    const playAgainButton = screen.getByRole('button', { name: 'Play Snake Game Again' });
    fireEvent.click(playAgainButton);

    await waitFor(() => {
      expect(screen.queryByText(/Game Over/i)).not.toBeInTheDocument();
    });
  });

  it('handles pause by blurring the game container', async () => {
    renderWithTheme(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Snake Game' }));

    const container = screen.getByLabelText('Snake Game Board. Use arrow keys to move.');
    container.focus();

    // Blur should trigger a pause
    fireEvent.blur(container);

    await waitFor(() => {
      const pausedElements = screen.getAllByText(/Paused/i);
      expect(pausedElements.length).toBeGreaterThan(0);
    });
  });

  it('handles space key to pause/resume game', async () => {
    vi.useFakeTimers();
    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Space to pause
    const container = screen.getAllByLabelText(/Snake Game Board/i)[0];
    act(() => {
      fireEvent.keyDown(container, { key: ' ' });
    });
    expect(screen.getByText('Paused')).toBeInTheDocument();

    // Space to resume
    act(() => {
      fireEvent.keyDown(container, { key: ' ' });
    });
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('handles touch events for mobile controls', () => {
    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    const gameContainer = screen.getAllByLabelText(/Snake Game Board/i)[0];

    // Simulate swipe up
    fireEvent.touchStart(gameContainer, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(gameContainer, { changedTouches: [{ clientX: 100, clientY: 50 }] });

    // Simulate swipe down
    fireEvent.touchStart(gameContainer, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(gameContainer, { changedTouches: [{ clientX: 100, clientY: 150 }] });

    // Simulate swipe left
    fireEvent.touchStart(gameContainer, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(gameContainer, { changedTouches: [{ clientX: 50, clientY: 100 }] });

    // Simulate swipe right
    fireEvent.touchStart(gameContainer, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(gameContainer, { changedTouches: [{ clientX: 150, clientY: 100 }] });

    // Short swipe should not trigger
    fireEvent.touchStart(gameContainer, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(gameContainer, { changedTouches: [{ clientX: 105, clientY: 105 }] });
  });

  it('ticks game forward safely', () => {
    // Tests tickGame logic specifically by firing multiple fast ticks
    vi.useFakeTimers();
    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    const container = screen.getAllByLabelText(/Snake Game Board/i)[0];
    // Move up
    act(() => {
      fireEvent.keyDown(container, { code: 'ArrowUp' });
    });

    // Move fast to trigger edge cases
    act(() => {
      vi.advanceTimersByTime(300);
    });

    vi.useRealTimers();
  });

  it('handles invalid rgb formats from css variables', () => {
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = () => ({
      getPropertyValue: prop => {
        if (prop === '--color-fun-yellow') return 'rgb(NaN, 0, 0)';
        return 'rgb(255, 0, 0)';
      },
    });

    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Should fallback gracefully without crashing
    expect(screen.getByText('Score')).toBeInTheDocument();

    window.getComputedStyle = originalGetComputedStyle;
  });

  it('ignores keyboard navigation when not playing or paused', () => {
    render(<SnakeGame />);
    const container = screen.getAllByLabelText(/Snake Game Board/i)[0];
    // State is 'idle'
    fireEvent.keyDown(container, { key: 'ArrowUp' });
    // It shouldn't crash
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('ignores multi-touch starts or touch ends without starts', () => {
    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    const container = screen.getAllByLabelText(/Snake Game Board/i)[0];

    // Test missing touch start reference
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 100, clientY: 50 }] });

    // Test multi-touch
    fireEvent.touchStart(container, {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 120, clientY: 120 },
      ],
    });

    // Shouldn't crash and should remain playing
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('toggles pause from playing to paused and vice versa', async () => {
    render(<SnakeGame />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // There is a pause button visible on mobile layout md:hidden maybe?
    // <button aria-label="Pause game">
    const pauseButton = screen.getByLabelText('Pause game');

    await act(async () => {
      fireEvent.click(pauseButton);
    });

    // Resume button appears
    const resumeButton = screen.getByText('Resume');
    expect(resumeButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(resumeButton);
    });

    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  });
});
