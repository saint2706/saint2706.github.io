import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Footer from './Footer';
import { useTheme } from '../shared/theme-context';
import { isSafeHref } from '../../utils/security';

vi.mock('../shared/theme-context', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../shared/ScrollReveal', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="scroll-reveal">{children}</div>,
}));

vi.mock('../shared/ZigzagDivider', () => ({
  __esModule: true,
  default: () => <div data-testid="zigzag-divider" />,
}));

vi.mock('../shared/MarqueeTicker', () => ({
  __esModule: true,
  default: () => <div data-testid="marquee-ticker" />,
}));

vi.mock('../../utils/security', () => ({
  isSafeHref: vi.fn(),
}));

// We'll mutate this mock data for different test scenarios
let mockResumeData = {
  basics: {
    name: 'Test Name',
    socials: [
      { network: 'GitHub', url: 'https://github.com/test' },
      { network: 'LinkedIn', url: 'https://linkedin.com/in/test' },
    ],
  },
};

vi.mock('../../data/resume', () => ({
  get resumeData() {
    return mockResumeData;
  },
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'neubrutalism' });
    isSafeHref.mockReturnValue(true);
    mockResumeData = {
      basics: {
        name: 'Test Name',
        socials: [
          { network: 'GitHub', url: 'https://github.com/test' },
          { network: 'LinkedIn', url: 'https://linkedin.com/in/test' },
        ],
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    render(<Footer />);
    expect(screen.getByText(/Made with/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Visit GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Visit LinkedIn')).toBeInTheDocument();
  });

  it('handles heart clicks and shows secret with confetti', () => {
    vi.useFakeTimers();
    render(<Footer />);
    const heartBtn = screen.getByLabelText('Give a like');

    // Click 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(heartBtn);
    }

    expect(screen.getByText('You found a secret! ❤️')).toBeInTheDocument();
    // Check that there is at least one confetti element
    const confettiElements = document.querySelectorAll('.confetti-piece');
    expect(confettiElements.length).toBeGreaterThan(0);

    // Fast forward to hide confetti
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    const newConfettiElements = document.querySelectorAll('.confetti-piece');
    expect(newConfettiElements.length).toBe(0);
  });

  it('renders liquid theme correctly', () => {
    useTheme.mockReturnValue({ theme: 'liquid' });
    render(<Footer />);
    expect(screen.getByText(/Made with/i)).toBeInTheDocument();
  });

  it('does not render social links if urls are missing or unsafe', () => {
    // Case 1: URLs missing
    mockResumeData.basics.socials = [];
    const { unmount } = render(<Footer />);
    expect(screen.queryByLabelText('Visit GitHub')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Visit LinkedIn')).not.toBeInTheDocument();
    unmount();

    // Case 2: URLs unsafe
    mockResumeData.basics.socials = [
      { network: 'GitHub', url: 'javascript:alert(1)' },
      { network: 'LinkedIn', url: 'javascript:alert(1)' },
    ];
    isSafeHref.mockReturnValue(false);
    render(<Footer />);
    expect(screen.queryByLabelText('Visit GitHub')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Visit LinkedIn')).not.toBeInTheDocument();
  });

  it('updates aria-live region correctly on click', () => {
    render(<Footer />);
    const heartBtn = screen.getByLabelText('Give a like');

    fireEvent.click(heartBtn);
    expect(screen.getByText('4 more clicks for a surprise')).toBeInTheDocument();

    fireEvent.click(heartBtn);
    fireEvent.click(heartBtn);
    fireEvent.click(heartBtn);
    expect(screen.getByText('1 more click for a surprise')).toBeInTheDocument();

    fireEvent.click(heartBtn);
    expect(screen.getByText('You found a secret!')).toBeInTheDocument();
  });
});
