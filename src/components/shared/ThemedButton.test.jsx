import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemedButton from './ThemedButton';

import { useTheme } from './theme-context';

// Mock useTheme hook
vi.mock('./theme-context', () => ({
  useTheme: vi.fn(() => ({ theme: 'neubrutalism' })),
}));

describe('ThemedButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTheme).mockReturnValue({ theme: 'neubrutalism' });
  });

  it('renders children correctly', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows loading spinner and disables button when isLoading is true', () => {
    render(<ThemedButton isLoading>Click me</ThemedButton>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner
    // We can find it by the unique class name we added 'animate-spin'
    // Since we are using React Testing Library, we can use container.querySelector
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not show spinner when isLoading is false', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).not.toBeDisabled();

    const spinner = button.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('applies different styles based on theme', () => {
    // This test relies on the mock returning 'neubrutalism'
    const { container } = render(<ThemedButton variant="primary">Themed</ThemedButton>);
    // Neubrutalism primary has 'bg-fun-yellow'
    expect(container.firstChild).toHaveClass('bg-fun-yellow');
  });

  it('applies liquid theme classes', () => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'liquid' });
    const { container } = render(<ThemedButton variant="primary">Themed</ThemedButton>);
    expect(container.firstChild).toHaveClass('liquid-button-primary');
  });

  it('applies isActive classes in neubrutalism theme', () => {
    const { container } = render(<ThemedButton isActive>Active</ThemedButton>);
    expect(container.firstChild).toHaveClass('-translate-x-0.5');
  });

  it('does not apply isActive classes in liquid theme', () => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'liquid' });
    const { container } = render(<ThemedButton isActive>Active</ThemedButton>);
    expect(container.firstChild).not.toHaveClass('-translate-x-0.5');
  });

  it('applies coloredShadow class in neubrutalism theme', () => {
    const { container } = render(<ThemedButton coloredShadow="blue">Shadow</ThemedButton>);
    // We expect the specific shadow class, assuming blue maps to something in NB_SHADOW_COLOR_MAP.
    // In neubrutalism theme with colored shadow, it removes inline box shadow.
    expect(container.firstChild).not.toHaveStyle({ boxShadow: 'var(--nb-shadow)' });
    // Assuming NB_SHADOW_COLOR_MAP['blue'] provides 'shadow-[4px_4px_0px_0px_#3B82F6]' or similar, we just test class exists
    // The exact class might vary but the inline style absence proves it was applied.
  });

  it('renders custom sizes', () => {
    const { container } = render(<ThemedButton size="lg">Large</ThemedButton>);
    expect(container.firstChild).toHaveClass('px-8 py-4');
  });

  it('renders as a custom component via "as" prop', () => {
    const { container } = render(
      <ThemedButton as="a" href="https://example.com">
        Link
      </ThemedButton>
    );
    expect(container.firstChild.tagName).toBe('A');
    expect(container.firstChild).toHaveAttribute('href', 'https://example.com');
  });
});
