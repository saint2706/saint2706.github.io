import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import LightsOut from './LightsOut';
import { ThemeProvider } from '../shared/ThemeProvider';
import { useReducedMotion } from 'framer-motion';

// Mock Lucide icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  Play: () => <span data-testid="play-icon">Play</span>,
  RotateCcw: () => <span data-testid="rotate-icon">RotateCcw</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  Lightbulb: () => <span data-testid="lightbulb-icon">Lightbulb</span>,
}));

// Mock Reduced Motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  // Helper to filter out motion-specific props
  const filterMotionProps = (props) => {
    // eslint-disable-next-line no-unused-vars
    const { whileTap, initial, animate, exit, transition, variants, ...domProps } = props;
    return domProps;
  };
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }) => <div {...filterMotionProps(props)}>{children}</div>,
      button: ({ children, ...props }) => <button {...filterMotionProps(props)}>{children}</button>,
    },
  };
});

const renderWithTheme = component => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('LightsOut Game', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset reduced motion default
    if (useReducedMotion.mock) {
        useReducedMotion.mockReturnValue(false);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial game state', () => {
    renderWithTheme(<LightsOut />);
    expect(screen.getByText(/Lights Out puzzle ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Puzzle/i)).toBeInTheDocument();
  });

  it('starts game on button click', async () => {
    renderWithTheme(<LightsOut />);
    const startButton = screen.getByText(/Start Puzzle/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Playing Lights Out/i)).toBeInTheDocument();
    });

    // Check if grid is rendered (25 cells)
    const cells = screen.getAllByLabelText(/Row \d+, Column \d+: light (on|off)/i);
    expect(cells).toHaveLength(25);
  });

  it('toggles lights on click', async () => {
    renderWithTheme(<LightsOut />);
    const startButton = screen.getByText(/Start Puzzle/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Playing Lights Out/i)).toBeInTheDocument();
    });

    const cells = screen.getAllByLabelText(/Row \d+, Column \d+: light (on|off)/i);
    const cell = cells[0]; // Top-left cell (0,0)

    // Get initial state
    const initialLabel = cell.getAttribute('aria-label');
    const isInitiallyOn = initialLabel.includes('light on');

    // Click to toggle
    fireEvent.click(cell);

    // Check if label updated
    const updatedLabel = cell.getAttribute('aria-label');
    const isNowOn = updatedLabel.includes('light on');

    expect(isNowOn).toBe(!isInitiallyOn);

    // Check moves incremented
    expect(screen.getByText('1')).toBeInTheDocument(); // Moves count
  });

  it('handles keyboard navigation', async () => {
    renderWithTheme(<LightsOut />);
    fireEvent.click(screen.getByText(/Start Puzzle/i));
    await waitFor(() => screen.getByText(/Playing Lights Out/i));

    // Initial focus should be (0,0) - Row 1, Col 1

    // Simulate ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Check (0,1) -> Row 1, Col 2 is focused
    const cell01 = screen.getByLabelText(/Row 1, Column 2:/i);
    expect(cell01).toHaveClass('ring-accent');

    // Simulate ArrowDown
    fireEvent.keyDown(window, { key: 'ArrowDown' });

    // Check (1,1) -> Row 2, Col 2 is focused
    const cell11 = screen.getByLabelText(/Row 2, Column 2:/i);
    expect(cell11).toHaveClass('ring-accent');

    // Simulate Enter to toggle
    const initialLabel = cell11.getAttribute('aria-label');
    fireEvent.keyDown(window, { key: 'Enter' });

    // Check if toggled
    const updatedLabel = cell11.getAttribute('aria-label');
    expect(updatedLabel).not.toBe(initialLabel);

    // Simulate ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    const cell10 = screen.getByLabelText(/Row 2, Column 1:/i);
    expect(cell10).toHaveClass('ring-accent');

    // Simulate ArrowUp
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    const cell00 = screen.getByLabelText(/Row 1, Column 1:/i);
    expect(cell00).toHaveClass('ring-accent');
  });

  it('wins the game with deterministic random', async () => {
    // Mock Math.random to return 0 to force "all off" initially, triggering the fallback "center on"
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    renderWithTheme(<LightsOut />);
    fireEvent.click(screen.getByText(/Start Puzzle/i));

    await waitFor(() => screen.getByText(/Playing Lights Out/i));

    // Based on logic, if Math.random() is always 0, the fallback creates a cross at (2,2)
    // Clicking (2,2) should solve it.

    const centerCell = screen.getByLabelText(/Row 3, Column 3:/i); // (2,2) -> Row 3, Col 3
    fireEvent.click(centerCell);

    await waitFor(() => {
        expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
    });

    // Check for "New Puzzle" button
    const newPuzzleBtn = screen.getByText(/New Puzzle/i);
    expect(newPuzzleBtn).toBeInTheDocument();

    // Start new game
    fireEvent.click(newPuzzleBtn);
    await waitFor(() => {
        expect(screen.getByText(/Playing Lights Out/i)).toBeInTheDocument();
    });

    randomSpy.mockRestore();
  });

  it('respects reduced motion settings', () => {
    // Setup mock return value before render
    if (useReducedMotion.mock) {
      useReducedMotion.mockReturnValue(true);
    }

    renderWithTheme(<LightsOut />);

    // Verify hook was called
    expect(useReducedMotion).toHaveBeenCalled();
  });

  it('ignores other keys', async () => {
    renderWithTheme(<LightsOut />);
    fireEvent.click(screen.getByText(/Start Puzzle/i));
    await waitFor(() => screen.getByText(/Playing Lights Out/i));

    // Press 'A' key
    fireEvent.keyDown(window, { key: 'a' });
    // Should not throw and nothing happens
    expect(screen.getByText(/Playing Lights Out/i)).toBeInTheDocument();
  });
});
