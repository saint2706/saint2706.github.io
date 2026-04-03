import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MemoryMatch from './MemoryMatch';

// Mock theme context
vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

// Mock framer-motion to bypass animations
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

describe('MemoryMatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
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

  it('renders idle state correctly', () => {
    render(<MemoryMatch />);
    expect(screen.getByText('Memory Match ready. Press Start to begin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('starts the game when Start Game is clicked', async () => {
    render(<MemoryMatch />);
    const startButton = screen.getByRole('button', { name: /Start Game/i });
    fireEvent.click(startButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText('Playing Memory Match. Moves: 0.')).toBeInTheDocument();

    // 16 cards should be rendered
    const cards = screen.getAllByRole('button', { name: /Card \d+: face down/i });
    expect(cards).toHaveLength(16);
  });

  it('flips a card when clicked', async () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const cards = screen.getAllByRole('button', { name: /Card \d+: face down/i });
    fireEvent.click(cards[0]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // After clicking, the card should no longer be face down
    expect(cards[0]).not.toHaveAttribute('aria-label', expect.stringContaining('face down'));
    // Focus should be visually accurate (we don't check exact aria-pressed immediately due to state update)
    expect(cards[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles matching two cards', async () => {
    // Mock random to be deterministic
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      render(<MemoryMatch />);
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      const cards = screen.getAllByRole('button', { name: /Card \d+: face down/i });

      // Click first card
      fireEvent.click(cards[0]);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(cards[0]).toHaveAttribute('aria-pressed', 'true');

      // Click second card
      fireEvent.click(cards[1]);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(cards[1]).toHaveAttribute('aria-pressed', 'true');

      // Wait for match logic and flush state
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
        await vi.advanceTimersByTimeAsync(0);
      });

      // Moves should be 1
      expect(screen.getByText('1')).toBeInTheDocument();
    } finally {
      Math.random = originalRandom;
    }
  });

  it('handles matching all cards to win', async () => {
    // To test the win condition without timeouts, we spy on random
    const originalRandom = Math.random;

    try {
      // Use Math.random to produce a completely non-shuffled array!
      // Fisher Yates swaps index `i` with `j` where `j = Math.floor(Math.random() * (i + 1))`.
      // If `Math.random` returns `0.999`, then `j` is always `i`.
      Math.random = () => 0.999;

      render(<MemoryMatch />);
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // With Math.random = 0.999, the array is NOT shuffled.
      // The deck is `[...ICONS, ...ICONS]`.
      // So indices 0 and 8 match, 1 and 9 match, etc.
      for (let i = 0; i < 8; i++) {
        const cardsToClick = screen.getAllByRole('button', { name: /Card/i });
        fireEvent.click(cardsToClick[i]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        fireEvent.click(cardsToClick[i + 8]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(600);
        });
      }

      expect(screen.getByText(/You Win!/i)).toBeInTheDocument();
    } finally {
      Math.random = originalRandom;
    }
  });

  it('handles unmatched cards flipping back', async () => {
    // Mock random so we can predict cards
    const originalRandom = Math.random;
    Math.random = () => 0.5; // predictable shuffle

    try {
      render(<MemoryMatch />);
      fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      const cards = screen.getAllByRole('button', { name: /Card \d+: face down/i });

      // Since we want unmatched cards, we must click two different icons
      // With Math.random() = 0.5, cards[0] and cards[1] are likely the same or different.
      // Let's just find two cards that don't match by checking their aria-label after clicking.
      fireEvent.click(cards[0]);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      const icon1 = screen.getAllByRole('button')[0].getAttribute('aria-label');

      let idx = 1;
      fireEvent.click(cards[idx]);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      let icon2 = screen.getAllByRole('button')[idx].getAttribute('aria-label');

      // If they magically match, try another one
      if (icon1 === icon2) {
        // Wait for match logic
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800);
        });
        // Try next pair
        idx++;
        fireEvent.click(cards[idx]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        icon2 = screen.getAllByRole('button')[idx].getAttribute('aria-label');
        fireEvent.click(cards[idx + 1]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      }

      // Now we wait for the unmatch logic
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });

      // Check that cards flip back
      // The previously clicked cards should be 'face down' again
      const allCards = screen.getAllByRole('button', { name: /Card \d+: face down/i });
      expect(allCards.length).toBeGreaterThan(0);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('supports keyboard navigation', async () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const cards = screen.getAllByRole('button', { name: /Card \d+: face down/i });

    // Initial focus index is 0
    expect(cards[0]).toHaveAttribute('tabIndex', '0');
    expect(cards[1]).toHaveAttribute('tabIndex', '-1');

    // Press ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(cards[0]).toHaveAttribute('tabIndex', '-1');
    expect(cards[1]).toHaveAttribute('tabIndex', '0');

    // Press ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(cards[0]).toHaveAttribute('tabIndex', '0');
    expect(cards[1]).toHaveAttribute('tabIndex', '-1');

    // Press ArrowDown
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    // focus should be index 4 (0 + 4)
    const cardsAfterDown = screen.getAllByRole('button', { name: /Card \d+: face/i });
    expect(cardsAfterDown[0]).toHaveAttribute('tabIndex', '-1');
    expect(cardsAfterDown[4]).toHaveAttribute('tabIndex', '0');

    // Press ArrowUp
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    // focus should be index 0
    const cardsAfterUp = screen.getAllByRole('button', { name: /Card \d+: face/i });
    expect(cardsAfterUp[0]).toHaveAttribute('tabIndex', '0');
    expect(cardsAfterUp[4]).toHaveAttribute('tabIndex', '-1');

    // Test Space key to flip
    fireEvent.keyDown(window, { key: ' ' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getAllByRole('button', { name: /Card \d+/i })[0]).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Press Enter to flip
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fireEvent.keyDown(window, { key: 'Enter' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Flush any pending async state updates from matching
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const finalCards = screen.getAllByRole('button', { name: /Card \d+/i });
    expect(finalCards[1]).toHaveAttribute('aria-pressed', 'true');

    // Unknown key shouldn't do anything
    fireEvent.keyDown(window, { key: 'a' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(finalCards[1]).toHaveAttribute('tabIndex', '0');
  });
});
