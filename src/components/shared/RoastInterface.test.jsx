import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import RoastInterface from './RoastInterface';
import * as aiService from '../../services/ai';
import * as themeContext from './theme-context';

// Mock dependencies
vi.mock('../../services/ai', () => ({
  roastResume: vi.fn()
}));

vi.mock('./theme-context', () => ({
  useTheme: vi.fn()
}));

// Mock framer-motion to bypass animations in tests
vi.mock('framer-motion', async () => {
  const actual = await import('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => {
        // eslint-disable-next-line no-unused-vars
        const { initial, animate, exit, ...rest } = props;
        return <div {...rest}>{children}</div>;
      }
    },
    useReducedMotion: () => false,
  };
});

describe('RoastInterface Component', () => {
  const mockOnClose = vi.fn();
  const mockOnRoastComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    themeContext.useTheme.mockReturnValue({ theme: 'neubrutalism' });
    aiService.roastResume.mockResolvedValue('This is a mocked roast.');

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with initial content', () => {
    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Initial roast content"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    expect(screen.getByText('Resume Roasted 🔥')).toBeInTheDocument();
    expect(screen.getByText(/"Initial roast content"/)).toBeInTheDocument();
  });

  it('auto-loads roast on mount if no content is provided', async () => {
    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent={null}
        onRoastComplete={mockOnRoastComplete}
      />
    );

    expect(screen.getByText('Roasting your resume...')).toBeInTheDocument();

    await waitFor(() => {
      expect(aiService.roastResume).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnRoastComplete).toHaveBeenCalledWith('This is a mocked roast.');
    });
  });

  it('calls onClose when close buttons are clicked', () => {
    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Roast"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    // Header close button
    fireEvent.click(screen.getByLabelText('Close roast'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Footer close button
    fireEvent.click(screen.getByRole('button', { name: 'Close roast interface' }));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('generates a new roast when "Roast Again" is clicked', async () => {
    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Old Roast"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Roast resume again' }));

    await waitFor(() => {
      expect(aiService.roastResume).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnRoastComplete).toHaveBeenCalledWith('This is a mocked roast.');
    });
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    vi.useFakeTimers();

    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Test roast for clipboard"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    const copyButton = screen.getByLabelText('Copy roast to clipboard');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test roast for clipboard');

    // Test check icon state
    expect(screen.getByLabelText('Copied roast')).toBeInTheDocument();

    // Test state reset
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByLabelText('Copy roast to clipboard')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('handles clipboard errors gracefully', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));

    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Test roast"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    const copyButton = screen.getByLabelText('Copy roast to clipboard');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Should not crash and should remain as 'Copy' (not Copied)
    expect(screen.getByLabelText('Copy roast to clipboard')).toBeInTheDocument();
  });

  it('applies liquid theme classes correctly', () => {
    themeContext.useTheme.mockReturnValue({ theme: 'liquid' });

    render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent="Roast"
        onRoastComplete={mockOnRoastComplete}
      />
    );

    // The inner container for content has 'bg-transparent' in liquid theme
    // and 'bg-card' in neubrutalism
    const contentContainer = screen.getByText(/"Roast"/).parentElement;
    expect(contentContainer).toHaveClass('bg-transparent');
  });

  it('handles component unmount during API call safely', async () => {
    let resolveApi;
    aiService.roastResume.mockReturnValue(new Promise(resolve => {
      resolveApi = resolve;
    }));

    const { unmount } = render(
      <RoastInterface
        onClose={mockOnClose}
        roastContent={null}
        onRoastComplete={mockOnRoastComplete}
      />
    );

    expect(screen.getByText('Roasting your resume...')).toBeInTheDocument();

    // Unmount before API resolves
    unmount();

    // Resolve the API call after unmount
    await act(async () => {
      resolveApi('Late roast');
    });

    // onRoastComplete should not be called because component is unmounted
    expect(mockOnRoastComplete).not.toHaveBeenCalled();
  });
});
