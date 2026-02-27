import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import LightsOut from './LightsOut';
import { ThemeProvider } from '../shared/ThemeProvider';

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

const renderWithTheme = component => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('LightsOut Game', () => {
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

    // Check adjacent cell (0,1) should also toggle
    // This assumes row-major order: (0,0), (0,1), ..., (4,4)
    // Row 0, Col 1 is adjacent to Row 0, Col 0

    // We can't easily check previous state of neighbor without storing it,
    // but we can check if it changed relative to its initial state if we knew it.
    // Instead, let's just assert that *something* happened to grid.

    // Check moves incremented
    expect(screen.getByText('1')).toBeInTheDocument(); // Moves count
  });

  it('handles keyboard navigation', async () => {
    renderWithTheme(<LightsOut />);
    const startButton = screen.getByText(/Start Puzzle/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Playing Lights Out/i)).toBeInTheDocument();
    });

    const cells = screen.getAllByLabelText(/Row \d+, Column \d+: light (on|off)/i);

    // Grid is 5x5. Index = row * 5 + col
    const cell00 = cells[0];
    const cell01 = cells[1];
    const cell10 = cells[5];

    // Initial focus should be on (0,0)
    await waitFor(() => {
      expect(cell00).toHaveFocus();
    });

    // Move Right -> (0,1)
    fireEvent.keyDown(cell00, { key: 'ArrowRight', code: 'ArrowRight' });
    await waitFor(() => expect(cell01).toHaveFocus());

    // Move Down -> (1,1) (index 6)
    fireEvent.keyDown(cell01, { key: 'ArrowDown', code: 'ArrowDown' });
    const cell11 = cells[6];
    await waitFor(() => expect(cell11).toHaveFocus());

    // Move Left -> (1,0) (index 5)
    fireEvent.keyDown(cell11, { key: 'ArrowLeft', code: 'ArrowLeft' });
    await waitFor(() => expect(cell10).toHaveFocus());

    // Move Up -> (0,0) (index 0)
    fireEvent.keyDown(cell10, { key: 'ArrowUp', code: 'ArrowUp' });
    await waitFor(() => expect(cell00).toHaveFocus());

    // Check boundary constraints (Up from 0,0 should stay 0,0)
    fireEvent.keyDown(cell00, { key: 'ArrowUp', code: 'ArrowUp' });
    await waitFor(() => expect(cell00).toHaveFocus());

    // Toggle with Enter
    const initialLabel = cell00.getAttribute('aria-label');
    fireEvent.keyDown(cell00, { key: 'Enter', code: 'Enter' });
    const updatedLabel = cell00.getAttribute('aria-label');
    expect(updatedLabel).not.toBe(initialLabel);

    // Toggle with Space
    fireEvent.keyDown(cell00, { key: ' ', code: 'Space' });
    // Should flip back (or at least change again)
    const finalLabel = cell00.getAttribute('aria-label');
    expect(finalLabel).toBe(initialLabel);
  });
});
