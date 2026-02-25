import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogSkeleton, ProjectSkeleton, ChatSkeleton, TypingIndicator } from './SkeletonLoader';

// Mock Theme Context
vi.mock('./theme-context', () => ({
  useTheme: vi.fn(() => ({ theme: 'neubrutalism' })),
}));

// Mock Framer Motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

describe('SkeletonLoader', () => {
  describe('BlogSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<BlogSkeleton />);
      // Check if it renders the structure (pulse animation class)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      // It should have multiple skeleton lines
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
    });
  });

  describe('ProjectSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ProjectSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
    });
  });

  describe('ChatSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChatSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      // Should have structure for chat bubble
      expect(container.firstChild).toHaveClass('flex justify-start');
    });
  });

  describe('TypingIndicator', () => {
    it('renders accessible loading state', () => {
      render(<TypingIndicator />);
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Digital Rishabh is thinking...');
    });

    it('renders dots for animation', () => {
      const { container } = render(<TypingIndicator />);
      // 3 dots
      // The dots are inside aria-hidden="true" container
      const dotsContainer = container.querySelector('[aria-hidden="true"]');
      expect(dotsContainer).toBeInTheDocument();
      expect(dotsContainer.children.length).toBe(3);
    });
  });
});
